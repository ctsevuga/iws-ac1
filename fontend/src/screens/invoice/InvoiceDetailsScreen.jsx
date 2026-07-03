// src/screens/invoices/InvoiceDetailsScreen.jsx

import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Spinner,
  Alert,
  ListGroup,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useParams } from "react-router-dom";

import { useGetInvoiceDetailsQuery } from "../../slices/invoiceApiSlice";

const InvoiceDetailsScreen = () => {
  const { id } = useParams();

  const {
    data: invoice,
    isLoading,
    error,
  } = useGetInvoiceDetailsQuery(id);

  /**
   * Status badge variant
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
    <Row className="justify-content-center">
      <Col lg={10}>
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
          <>
            {/* Header */}
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                  <div>
                    <h2 className="mb-1">
                      {
                        invoice.invoiceNumber
                      }
                    </h2>

                    <div className="text-muted">
                      Created{" "}
                      {new Date(
                        invoice.createdAt
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-end">
                    <Badge
                      bg={getStatusVariant(
                        invoice.status
                      )}
                      className="fs-6 px-3 py-2"
                    >
                      {invoice.status}
                    </Badge>

                    <h3 className="mt-3 mb-0">
                      {invoice.currency}{" "}
                      {invoice.totalAmount?.toFixed(
                        2
                      )}
                    </h3>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Row>
              {/* Left Column */}
              <Col lg={8}>
                {/* Customer */}
                <Card className="shadow-sm border-0 mb-4">
                  <Card.Header>
                    Customer Information
                  </Card.Header>

                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Name:</strong>{" "}
                      {invoice.customer?.name}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Email:</strong>{" "}
                      {invoice.customer?.email ||
                        "N/A"}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Phone:</strong>{" "}
                      {invoice.customer?.phone ||
                        "N/A"}
                    </ListGroup.Item>

                    {invoice.customer
                      ?.address && (
                      <ListGroup.Item>
                        <strong>
                          Address:
                        </strong>{" "}
                        {
                          invoice.customer
                            ?.address
                        }
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>

                {/* Job */}
                <Card className="shadow-sm border-0 mb-4">
                  <Card.Header>
                    Job Information
                  </Card.Header>

                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Title:</strong>{" "}
                      {invoice.job?.title}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>Status:</strong>{" "}
                      {invoice.job?.status}
                    </ListGroup.Item>

                    {invoice.job
                      ?.description && (
                      <ListGroup.Item>
                        <strong>
                          Description:
                        </strong>{" "}
                        {
                          invoice.job
                            ?.description
                        }
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>

                {/* Invoice Items */}
                <Card className="shadow-sm border-0 mb-4">
                  <Card.Header>
                    Invoice Items
                  </Card.Header>

                  <Card.Body>
                    <Table
                      striped
                      bordered
                      hover
                      responsive
                      className="align-middle"
                    >
                      <thead>
                        <tr>
                          <th>
                            Description
                          </th>
                          <th width="120">
                            Quantity
                          </th>
                          <th width="150">
                            Price
                          </th>
                          <th width="150">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {invoice.items.map(
                          (
                            item,
                            index
                          ) => (
                            <tr
                              key={index}
                            >
                              <td>
                                {
                                  item.description
                                }
                              </td>

                              <td>
                                {
                                  item.quantity
                                }
                              </td>

                              <td>
                                {
                                  invoice.currency
                                }{" "}
                                {item.price.toFixed(
                                  2
                                )}
                              </td>

                              <td>
                                {
                                  invoice.currency
                                }{" "}
                                {item.lineTotal.toFixed(
                                  2
                                )}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                {/* Notes */}
                {invoice.notes && (
                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Header>
                      Notes
                    </Card.Header>

                    <Card.Body>
                      <p className="mb-0">
                        {invoice.notes}
                      </p>
                    </Card.Body>
                  </Card>
                )}
              </Col>

              {/* Right Column */}
              <Col lg={4}>
                {/* Summary */}
                <Card className="shadow-sm border-0 mb-4">
                  <Card.Header>
                    Invoice Summary
                  </Card.Header>

                  <Card.Body>
                    <div className="d-flex justify-content-between mb-3">
                      <span>
                        Subtotal
                      </span>

                      <strong>
                        {
                          invoice.currency
                        }{" "}
                        {invoice.subtotal?.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                      <span>
                        Discount
                      </span>

                      <strong>
                        {
                          invoice.currency
                        }{" "}
                        {invoice.discount?.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                    <div className="d-flex justify-content-between mb-3">
                      <span>
                        Tax (
                        {
                          invoice.taxRate
                        }
                        %)
                      </span>

                      <strong>
                        {
                          invoice.currency
                        }{" "}
                        {invoice.taxAmount?.toFixed(
                          2
                        )}
                      </strong>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between">
                      <h5>Total</h5>

                      <h5>
                        {
                          invoice.currency
                        }{" "}
                        {invoice.totalAmount?.toFixed(
                          2
                        )}
                      </h5>
                    </div>
                  </Card.Body>
                </Card>

                {/* Payment Info */}
                <Card className="shadow-sm border-0 mb-4">
                  <Card.Header>
                    Payment Information
                  </Card.Header>

                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>
                        Payment Method:
                      </strong>{" "}
                      {invoice.paymentMethod.replace(
                        "_",
                        " "
                      )}
                    </ListGroup.Item>

                    <ListGroup.Item>
                      <strong>
                        Due Date:
                      </strong>{" "}
                      {new Date(
                        invoice.dueDate
                      ).toLocaleDateString()}
                    </ListGroup.Item>

                    {invoice.paidAt && (
                      <ListGroup.Item>
                        <strong>
                          Paid At:
                        </strong>{" "}
                        {new Date(
                          invoice.paidAt
                        ).toLocaleDateString()}
                      </ListGroup.Item>
                    )}

                    <ListGroup.Item>
                      <strong>
                        Is Paid:
                      </strong>{" "}
                      {invoice.isPaid
                        ? "Yes"
                        : "No"}
                    </ListGroup.Item>
                  </ListGroup>
                </Card>

                {/* Actions */}
                <Card className="shadow-sm border-0">
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <LinkContainer
                        to={`/invoices/${invoice._id}/edit`}
                      >
                        <Button variant="warning">
                          Update Invoice
                        </Button>
                      </LinkContainer>

                      <LinkContainer
                        to={`/invoices/${invoice._id}/status`}
                      >
                        <Button variant="secondary">
                          Update Status
                        </Button>
                      </LinkContainer>

                      <LinkContainer to="/invoices">
                        <Button variant="outline-dark">
                          Back To Invoices
                        </Button>
                      </LinkContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Col>
    </Row>
  );
};

export default InvoiceDetailsScreen;