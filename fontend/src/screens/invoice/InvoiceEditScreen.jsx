// src/screens/invoices/InvoiceEditScreen.jsx

import { useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetInvoiceDetailsQuery,
  useUpdateInvoiceMutation,
} from "../../slices/invoiceApiSlice";

import { useGetItemsQuery } from "../../slices/itemApiSlice";

const InvoiceEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: invoice,
    isLoading,
    error,
  } = useGetInvoiceDetailsQuery(id);

  const {
    data: itemList = [],
    isLoading: loadingItems,
  } = useGetItemsQuery();

  const [updateInvoice, { isLoading: loadingUpdate }] =
    useUpdateInvoiceMutation();

  /**
   * Local state
   */
  const [formData, setFormData] = useState({
    dueDate: "",
    paymentMethod: "cash",
    taxRate: 0,
    discount: 0,
    notes: "",
    currency: "USD",
  });

  const [items, setItems] = useState([]);

  /**
   * Hydrate form when data loads
   */
  useEffect(() => {
    if (invoice) {
      setFormData({
        dueDate: invoice.dueDate
          ? invoice.dueDate.substring(0, 10)
          : "",
        paymentMethod:
          invoice.paymentMethod || "cash",
        taxRate: invoice.taxRate || 0,
        discount: invoice.discount || 0,
        notes: invoice.notes || "",
        currency: invoice.currency || "USD",
      });

      setItems(
        (invoice.items || []).map((item) => ({
          ...item,
          itemId:
            item.itemId ||
            item._id ||
            "",
        }))
      );
    }
  }, [invoice]);

  /**
   * Handlers
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index,
    field,
    value
  ) => {
    const updated = [...items];

    updated[index][field] =
      field === "description"
        ? value
        : Number(value);

    setItems(updated);
  };

  const handleSelectItem = (
    index,
    itemId
  ) => {
    const selectedItem = itemList.find(
      (item) => item._id === itemId
    );

    if (!selectedItem) return;

    const updated = [...items];

    updated[index] = {
      ...updated[index],
      itemId: selectedItem._id,
      description:
        selectedItem.name ||
        selectedItem.description ||
        "",
      price: Number(
        selectedItem.price || 0
      ),
      quantity:
        updated[index].quantity || 1,
    };

    setItems(updated);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemId: "",
        description: "",
        quantity: 1,
        price: 0,
        lineTotal: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    const updated = items.filter(
      (_, i) => i !== index
    );

    setItems(updated);
  };

  /**
   * Live preview totals (frontend only)
   */
  const preview = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.price || 0),
      0
    );

    const taxable =
      subtotal -
      Number(formData.discount || 0);

    const tax =
      (taxable *
        Number(formData.taxRate || 0)) /
      100;

    const total = Math.max(
      taxable + tax,
      0
    );

    return {
      subtotal,
      tax,
      total,
    };
  }, [items, formData]);

  /**
   * Submit
   */
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateInvoice({
        id,
        data: {
          ...formData,
          items,
        },
      }).unwrap();

      toast.success("Invoice updated");

      navigate(`/invoices/${id}`);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update invoice"
      );
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg={10}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h2 className="mb-4">
              Edit Invoice
            </h2>

            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger">
                {error?.data?.message ||
                  error.error}
              </Alert>
            ) : (
              <Form onSubmit={submitHandler}>
                {/* Read-only info */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Invoice Number
                      </Form.Label>

                      <Form.Control
                        value={
                          invoice.invoiceNumber
                        }
                        disabled
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Status
                      </Form.Label>

                      <Form.Control
                        value={invoice.status}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Editable fields */}
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>
                        Due Date
                      </Form.Label>

                      <Form.Control
                        type="date"
                        name="dueDate"
                        value={
                          formData.dueDate
                        }
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
                        name="taxRate"
                        min="0"
                        step="0.01"
                        value={
                          formData.taxRate
                        }
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
                        name="discount"
                        min="0"
                        step="0.01"
                        value={
                          formData.discount
                        }
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Items */}
                <h5 className="mt-4 mb-3">
                  Items
                </h5>

                <Table
                  bordered
                  responsive
                  className="align-middle"
                >
                  <thead>
                    <tr>
                      <th>Item</th>

                      <th width="120">
                        Qty
                      </th>

                      <th width="140">
                        Price
                      </th>

                      <th width="140">
                        Total
                      </th>

                      <th width="80"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map(
                      (item, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Select
                              value={
                                item.itemId || ""
                              }
                              onChange={(e) =>
                                handleSelectItem(
                                  index,
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">
                                Select Item
                              </option>

                              {itemList.map(
                                (product) => (
                                  <option
                                    key={
                                      product._id
                                    }
                                    value={
                                      product._id
                                    }
                                  >
                                    {product.name} (
                                    $
                                    {Number(
                                      product.price ||
                                        0
                                    ).toFixed(2)}
                                    )
                                  </option>
                                )
                              )}
                            </Form.Select>
                          </td>

                          <td>
                            <Form.Control
                              type="number"
                              min="1"
                              value={
                                item.quantity
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <Form.Control
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                item.price
                              }
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "price",
                                  e.target.value
                                )
                              }
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
                      )
                    )}
                  </tbody>
                </Table>

                <Button
                  variant="secondary"
                  className="mb-4"
                  onClick={addItem}
                  disabled={loadingItems}
                >
                  {loadingItems
                    ? "Loading Items..."
                    : "Add Item"}
                </Button>

                {/* Notes */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    Notes
                  </Form.Label>

                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Form.Group>

                {/* Summary */}
                <Card className="bg-light mb-4">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal</span>

                      <strong>
                        $
                        {preview.subtotal.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between">
                      <span>Tax</span>

                      <strong>
                        $
                        {preview.tax.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between">
                      <h5>Total</h5>

                      <h5>
                        $
                        {preview.total.toFixed(
                          2
                        )}
                      </h5>
                    </div>
                  </Card.Body>
                </Card>

                {/* Submit */}
                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loadingUpdate}
                  >
                    {loadingUpdate
                      ? "Updating..."
                      : "Update Invoice"}
                  </Button>
                </div>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default InvoiceEditScreen;