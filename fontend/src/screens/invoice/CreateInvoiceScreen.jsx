// src/screens/invoice/CreateInvoiceScreen.jsx

import { useMemo, useState } from "react";

import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
} from "react-bootstrap";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { useCreateInvoiceMutation } from "../../slices/invoiceApiSlice";

import {
  useGetItemsQuery,
} from "../../slices/itemApiSlice";

import {
  useGetCustomersQuery,
} from "../../slices/customerApiSlice";

import {
  useGetJobsByCustomerQuery,
} from "../../slices/jobApiSlice";

const CreateInvoiceScreen = () => {
  const navigate = useNavigate();

  /**
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [formData, setFormData] = useState({
    customer: "",
    job: "",
    dueDate: "",
    paymentMethod: "cash",
    taxRate: 0,
    discount: 0,
    notes: "",
    currency: "USD",
  });

  const [items, setItems] = useState([
    {
      itemId: "",
      description: "",
      quantity: 1,
      price: 0,
    },
  ]);

  /**
   * =========================================================
   * CREATE INVOICE
   * =========================================================
   */

  const [createInvoice, { isLoading }] =
    useCreateInvoiceMutation();

  /**
   * =========================================================
   * FETCH CUSTOMERS
   * =========================================================
   */

  const {
    data: customersData,
    isLoading: loadingCustomers,
  } = useGetCustomersQuery({
    page: 1,
    limit: 1000,
  });

  /**
   * =========================================================
   * FETCH JOBS BY CUSTOMER
   * =========================================================
   */
const customerId = formData.customer || "";
  const {
  data: jobsData,
  isLoading: loadingJobs,
} = useGetJobsByCustomerQuery(customerId, {
  skip: !customerId,
});
  console.log(formData.customer);
console.log(jobsData);
  /**
   * =========================================================
   * FETCH ITEMS
   * =========================================================
   */

  const {
    data: itemsData,
    isLoading: loadingItems,
  } = useGetItemsQuery({
    page: 1,
    limit: 1000,
  });

  /**
   * =========================================================
   * DATA ARRAYS
   * =========================================================
   */

  const customers =
    customersData?.customers || [];

  const allJobs = Array.isArray(jobsData) ? jobsData : [];

  const availableItems =
    itemsData?.items || [];

  /**
   * =========================================================
   * TOTALS
   * =========================================================
   */

  const subtotal = useMemo(() => {
    return items.reduce(
      (acc, item) =>
        acc +
        Number(item.quantity || 0) *
          Number(item.price || 0),
      0
    );
  }, [items]);

  const taxableAmount =
    subtotal -
    Number(formData.discount || 0);

  const taxAmount =
    (taxableAmount *
      Number(formData.taxRate || 0)) /
    100;

  const totalAmount =
    taxableAmount + taxAmount;

  /**
   * =========================================================
   * HANDLE FORM CHANGE
   * =========================================================
   */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,

      ...(name === "customer" && {
        job: "",
      }),
    }));
  };

  /**
   * =========================================================
   * HANDLE ITEM CHANGE
   * =========================================================
   */

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    const updatedItems = [...items];

    updatedItems[index][field] =
      field === "description" ||
      field === "itemId"
        ? value
        : Number(value);

    setItems(updatedItems);
  };

  /**
   * =========================================================
   * HANDLE ITEM SELECT
   * =========================================================
   */

  const handleSelectItem = (
    index,
    itemId
  ) => {
    const selectedItem =
      availableItems.find(
        (item) => item._id === itemId
      );

    if (!selectedItem) return;

    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],

      itemId: selectedItem._id,

      description:
        selectedItem.description ||
        selectedItem.name,

      price: selectedItem.price || 0,

      quantity:
        updatedItems[index].quantity || 1,
    };

    setItems(updatedItems);
  };

  /**
   * =========================================================
   * ADD ITEM ROW
   * =========================================================
   */

  const addItem = () => {
    setItems([
      ...items,
      {
        itemId: "",
        description: "",
        quantity: 1,
        price: 0,
      },
    ]);
  };

  /**
   * =========================================================
   * REMOVE ITEM ROW
   * =========================================================
   */

  const removeItem = (index) => {
    if (items.length === 1) return;

    const updatedItems = items.filter(
      (_, i) => i !== index
    );

    setItems(updatedItems);
  };

  /**
   * =========================================================
   * FORMAT JOB DATE
   * =========================================================
   */

  const formatJobDate = (date) => {
    if (!date) return "";

    return new Date(date)
      .toLocaleDateString("en-CA");
  };

  /**
   * =========================================================
   * FORMAT JOB LABEL
   * =========================================================
   */

  const formatJobLabel = (job) => {
    const title =
      job.title ||
      job.jobNumber ||
      job.serviceType ||
      "Untitled Job";

    const createdDate =
      formatJobDate(job.createdAt);

    return `${title} - ${createdDate}`;
  };

  /**
   * =========================================================
   * SUBMIT HANDLER
   * =========================================================
   */

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      /**
       * Validation
       */

      if (!formData.customer) {
        toast.error(
          "Please select a customer"
        );

        return;
      }

      if (!formData.job) {
        toast.error(
          "Please select a job"
        );

        return;
      }

      const invalidItem = items.find(
        (item) =>
          !item.description ||
          item.quantity < 1 ||
          item.price < 0
      );

      if (invalidItem) {
        toast.error(
          "Please complete all invoice items"
        );

        return;
      }

      /**
       * Clean payload
       */

      const cleanedItems = items.map(
        ({
          itemId,
          description,
          quantity,
          price,
        }) => ({
          itemId,
          description,
          quantity,
          price,
        })
      );

      const payload = {
        ...formData,
        items: cleanedItems,
      };

      const res =
        await createInvoice(payload).unwrap();

      toast.success("Invoice created");

      navigate(`/invoices/${res._id}`);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to create invoice"
      );
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg={10}>
        <Card className="shadow-sm border-0">
          <Card.Body>

            <h2 className="mb-4">
              Create Invoice
            </h2>

            <Form onSubmit={submitHandler}>

              {/* ===================================================== */}
              {/* CUSTOMER & JOB */}
              {/* ===================================================== */}

              <Row className="mb-3">

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Customer
                    </Form.Label>

                    <Form.Select
                      name="customer"
                      value={formData.customer}
                      onChange={handleChange}
                      required
                      disabled={loadingCustomers}
                    >
                      <option value="">
                        {loadingCustomers
                          ? "Loading customers..."
                          : "Select Customer"}
                      </option>

                      {customers.map((customer) => (
                        <option
                          key={customer._id}
                          value={customer._id}
                        >
                          {customer.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Job
                    </Form.Label>

<Form.Select
  name="job"
  value={formData.job}
  onChange={handleChange}
  required
  disabled={!formData.customer || loadingJobs}
>
  <option value="">
    {!formData.customer
      ? "Select customer first"
      : loadingJobs
      ? "Loading jobs..."
      : "Select Job"}
  </option>

  {allJobs.map((job) => (
    <option key={job._id} value={job._id}>
      {`${job.serviceType || "Job"} - ${new Date(
        job.createdAt
      ).toISOString().split("T")[0]}`}
    </option>
  ))}
</Form.Select>
                  </Form.Group>
                </Col>

              </Row>

              {/* ===================================================== */}
              {/* INVOICE SETTINGS */}
              {/* ===================================================== */}

              <Row className="mb-4">

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>
                      Due Date
                    </Form.Label>

                    <Form.Control
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>
                      Payment Method
                    </Form.Label>

                    <Form.Select
                      name="paymentMethod"
                      value={
                        formData.paymentMethod
                      }
                      onChange={handleChange}
                    >
                      <option value="cash">
                        Cash
                      </option>

                      <option value="card">
                        Card
                      </option>

                      <option value="bank_transfer">
                        Bank Transfer
                      </option>

                      <option value="online">
                        Online
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>
                      Tax Rate (%)
                    </Form.Label>

                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label>
                      Discount
                    </Form.Label>

                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

              </Row>

              {/* ===================================================== */}
              {/* ITEMS */}
              {/* ===================================================== */}

              <h5 className="mb-3">
                Invoice Items
              </h5>

              <Table
                bordered
                responsive
                className="align-middle"
              >

                <thead>
                  <tr>
                    <th width="250">
                      Select Item
                    </th>

                    <th>Description</th>

                    <th width="120">
                      Quantity
                    </th>

                    <th width="150">
                      Price
                    </th>

                    <th width="150">
                      Total
                    </th>

                    <th width="80"></th>
                  </tr>
                </thead>

                <tbody>

                  {items.map((item, index) => (
                    <tr key={index}>

                      <td>
                        <Form.Select
                          value={item.itemId}
                          onChange={(e) =>
                            handleSelectItem(
                              index,
                              e.target.value
                            )
                          }
                          disabled={loadingItems}
                        >
                          <option value="">
                            {loadingItems
                              ? "Loading items..."
                              : "Select Item"}
                          </option>

                          {availableItems.map(
                            (availableItem) => (
                              <option
                                key={
                                  availableItem._id
                                }
                                value={
                                  availableItem._id
                                }
                              >
                                {
                                  availableItem.name
                                }
                              </option>
                            )
                          )}
                        </Form.Select>
                      </td>

                      <td>
                        <Form.Control
                          type="text"
                          placeholder="Item description"
                          value={
                            item.description
                          }
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>

                      <td>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>

                      <td>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          required
                        />
                      </td>

                      <td>
                        $
                        {(
                          Number(
                            item.quantity || 0
                          ) *
                          Number(
                            item.price || 0
                          )
                        ).toFixed(2)}
                      </td>

                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            removeItem(index)
                          }
                        >
                          ×
                        </Button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </Table>

              <Button
                variant="secondary"
                className="mb-4"
                onClick={addItem}
              >
                Add Item
              </Button>

              {/* ===================================================== */}
              {/* NOTES */}
              {/* ===================================================== */}

              <Form.Group className="mb-4">
                <Form.Label>
                  Notes
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Optional invoice notes..."
                />
              </Form.Group>

              {/* ===================================================== */}
              {/* CURRENCY */}
              {/* ===================================================== */}

              <Row className="mb-4">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>
                      Currency
                    </Form.Label>

                    <Form.Control
                      type="text"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* ===================================================== */}
              {/* TOTALS */}
              {/* ===================================================== */}

              <Card className="bg-light mb-4">
                <Card.Body>

                  <Row>

                    <Col md={6}></Col>

                    <Col md={6}>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>

                        <strong>
                          $
                          {subtotal.toFixed(2)}
                        </strong>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Discount:</span>

                        <strong>
                          $
                          {Number(
                            formData.discount
                          ).toFixed(2)}
                        </strong>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Tax:</span>

                        <strong>
                          $
                          {taxAmount.toFixed(2)}
                        </strong>
                      </div>

                      <hr />

                      <div className="d-flex justify-content-between">
                        <h5>Total:</h5>

                        <h5>
                          $
                          {Math.max(
                            totalAmount,
                            0
                          ).toFixed(2)}
                        </h5>
                      </div>

                    </Col>

                  </Row>

                </Card.Body>
              </Card>

              {/* ===================================================== */}
              {/* SUBMIT */}
              {/* ===================================================== */}

              <div className="d-grid">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={
                    isLoading ||
                    loadingItems ||
                    loadingCustomers ||
                    loadingJobs
                  }
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        size="sm"
                        animation="border"
                        className="me-2"
                      />

                      Creating...
                    </>
                  ) : (
                    "Create Invoice"
                  )}
                </Button>
              </div>

            </Form>

          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateInvoiceScreen;