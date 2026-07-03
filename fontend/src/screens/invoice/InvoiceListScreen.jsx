// src/screens/invoices/InvoiceListScreen.jsx

import { useState } from "react";
import {
  Table,
  Button,
  Badge,
  Row,
  Col,
  Form,
  Card,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { toast } from "react-toastify";

import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
} from "../../slices/invoiceApiSlice";

const InvoiceListScreen = () => {
  /**
   * Filters
   */
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [customer, setCustomer] = useState("");

  /**
   * Query
   */
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetInvoicesQuery({
    page,
    status,
    search,
    customer,
  });

  /**
   * Delete mutation
   */
  const [deleteInvoice, { isLoading: loadingDelete }] =
    useDeleteInvoiceMutation();

  /**
   * Delete handler
   */
  const deleteHandler = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this invoice?"
      )
    ) {
      try {
        await deleteInvoice(id).unwrap();

        toast.success("Invoice deleted");

        refetch();
      } catch (err) {
        toast.error(
          err?.data?.message ||
            err?.error ||
            "Failed to delete invoice"
        );
      }
    }
  };

  /**
   * Badge colors
   */
  const getStatusVariant = (status) => {
    switch (status) {
      case "paid":
        return "success";

      case "draft":
        return "secondary";

      case "sent":
        return "primary";

      case "overdue":
        return "danger";

      case "cancelled":
        return "dark";

      default:
        return "light";
    }
  };

  return (
    <Row>
      <Col>
        <Card className="shadow-sm border-0">
          <Card.Body>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-0">
                  Invoices
                </h2>

                <small className="text-muted">
                  Manage company invoices
                </small>
              </div>

              <LinkContainer to="/invoices/create">
                <Button variant="primary">
                  Create Invoice
                </Button>
              </LinkContainer>
            </div>

            {/* Filters */}
            <Row className="mb-4">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    Search Invoice #
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="INV-2026..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label>
                    Status
                  </Form.Label>

                  <Form.Select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                  >
                    <option value="">
                      All Statuses
                    </option>

                    <option value="draft">
                      Draft
                    </option>

                    <option value="sent">
                      Sent
                    </option>

                    <option value="paid">
                      Paid
                    </option>

                    <option value="overdue">
                      Overdue
                    </option>

                    <option value="cancelled">
                      Cancelled
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col
                md={4}
                className="d-flex align-items-end"
              >
                <Button
                  variant="secondary"
                  onClick={() => refetch()}
                >
                  Apply Filters
                </Button>
              </Col>
            </Row>

            {/* Loading */}
            {isLoading || loadingDelete ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <div className="text-danger">
                {error?.data?.message ||
                  error.error}
              </div>
            ) : (
              <>
                {/* Invoice Table */}
                <Table
                  striped
                  bordered
                  hover
                  responsive
                  className="align-middle"
                >
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th>Job</th>
                      <th>Status</th>
                      <th>Due Date</th>
                      <th>Total</th>
                      <th>Created</th>
                      <th width="320">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.invoices?.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="text-center py-4"
                        >
                          No invoices found
                        </td>
                      </tr>
                    ) : (
                      data?.invoices?.map(
                        (invoice) => (
                          <tr
                            key={invoice._id}
                          >
                            <td>
                              <strong>
                                {
                                  invoice.invoiceNumber
                                }
                              </strong>
                            </td>

                            <td>
                              <div>
                                {
                                  invoice
                                    ?.customer
                                    ?.name
                                }
                              </div>

                              <small className="text-muted">
                                {
                                  invoice
                                    ?.customer
                                    ?.email
                                }
                              </small>
                            </td>

                            <td>
                              {
                                invoice?.job
                                  ?.title
                              }
                            </td>

                            <td>
                              <Badge
                                bg={getStatusVariant(
                                  invoice.status
                                )}
                              >
                                {
                                  invoice.status
                                }
                              </Badge>
                            </td>

                            <td>
                              {new Date(
                                invoice.dueDate
                              ).toLocaleDateString()}
                            </td>

                            <td>
                              <strong>
                                {
                                  invoice.currency
                                }{" "}
                                {invoice.totalAmount?.toFixed(
                                  2
                                )}
                              </strong>
                            </td>

                            <td>
                              {new Date(
                                invoice.createdAt
                              ).toLocaleDateString()}
                            </td>

                            {/* Actions */}
                            <td>
                              <div className="d-flex flex-wrap gap-2">
                                {/* View */}
                                <LinkContainer
                                  to={`/invoices/${invoice._id}`}
                                >
                                  <Button
                                    variant="info"
                                    size="sm"
                                  >
                                    View
                                  </Button>
                                </LinkContainer>

                                {/* Update */}
                                <LinkContainer
                                  to={`/invoices/${invoice._id}/edit`}
                                >
                                  <Button
                                    variant="warning"
                                    size="sm"
                                  >
                                    Update
                                  </Button>
                                </LinkContainer>

                                {/* Update Status */}
                                <LinkContainer
                                  to={`/invoices/${invoice._id}/status`}
                                >
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                  >
                                    Status
                                  </Button>
                                </LinkContainer>

                                {/* Delete */}
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    deleteHandler(
                                      invoice._id
                                    )
                                  }
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </Table>

                {/* Pagination */}
                {data?.pages > 1 && (
                  <Pagination className="justify-content-center mt-4">
                    {[...Array(data.pages).keys()].map(
                      (x) => (
                        <Pagination.Item
                          key={x + 1}
                          active={
                            x + 1 === page
                          }
                          onClick={() =>
                            setPage(x + 1)
                          }
                        >
                          {x + 1}
                        </Pagination.Item>
                      )
                    )}
                  </Pagination>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default InvoiceListScreen;