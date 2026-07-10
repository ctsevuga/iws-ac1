import React from "react";

import {
  Table,
  Button,
  Card,
  Container,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";

import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

import {
  useListInvoicesQuery,
  useMarkInvoicePaidMutation,
  useCancelInvoiceMutation,
} from "../../slices/billingApiSlice";

const InvoiceListScreen = () => {
  const navigate = useNavigate();

  /* -------------------------------------------------------------------------- */
  /*                              RTK QUERY                                     */
  /* -------------------------------------------------------------------------- */

  const { data, isLoading, refetch } = useListInvoicesQuery({
    page: 1,
    limit: 20,
  });

  const [markInvoicePaid, { isLoading: paying }] = useMarkInvoicePaidMutation();

  const [cancelInvoice, { isLoading: cancelling }] = useCancelInvoiceMutation();

  const invoices = data?.data || [];
console.log(JSON.stringify(invoices, null, 2));
  /* -------------------------------------------------------------------------- */
  /*                           MARK PAID HANDLER                                */
  /* -------------------------------------------------------------------------- */

  const markPaidHandler = async (invoiceId) => {
    try {
      await markInvoicePaid(invoiceId).unwrap();

      toast.success("Invoice marked as paid");

      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Unable to update invoice");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                           CANCEL HANDLER                                   */
  /* -------------------------------------------------------------------------- */

  const cancelHandler = async (invoiceId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this invoice?",
    );

    if (!confirmCancel) return;

    try {
      await cancelInvoice(invoiceId).unwrap();

      toast.success("Invoice cancelled");

      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Unable to cancel invoice");
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                              STATUS BADGE                                  */
  /* -------------------------------------------------------------------------- */

  const statusVariant = (status) => {
    switch (status) {
      case "paid":
        return "success";

      case "pending":
        return "warning";

      case "cancelled":
        return "danger";

      default:
        return "secondary";
    }
  };

  return (
    <Container className="py-4">
      <Row>
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-primary mb-0">Billing Invoices</h3>

                <Button
                  variant="primary"
                  onClick={() => navigate("/billing/invoices/generate")}
                >
                  Generate Invoice
                </Button>
              </div>

              {isLoading ? (
                <div className="text-center">
                  <Spinner />
                </div>
              ) : (
                <Table responsive bordered hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Invoice No</th>

                      <th>Company</th>

                      <th>Plan</th>

                      <th>Invoice Date</th>

                      <th>Billing Period</th>

                      <th>Total (Incl. GST)</th>

                      <th>Status</th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td>{invoice.invoiceNumber}</td>

                        <td>{invoice.company?.name}</td>

                        <td>{invoice.subscription?.plan || "-"}</td>

                        <td>
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </td>

                        <td>
                          {new Date(
                            invoice.billingPeriodStart,
                          ).toLocaleDateString()}

                          {" - "}

                          {new Date(
                            invoice.billingPeriodEnd,
                          ).toLocaleDateString()}
                        </td>

                        <td>
                          <strong>
                            ₹{invoice.totalAmountWithGST?.toLocaleString()}
                          </strong>

                          <br />

                          <small className="text-muted">
                            GST ₹{invoice.gst?.amount?.toLocaleString()}
                          </small>
                        </td>

                        <td>
                          <Badge bg={statusVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </td>

                        <td>
                          {/* VIEW */}

                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() =>
                              navigate(`/billing/invoices/${invoice._id}`)
                            }
                          >
                            View
                          </Button>

                          {/* REGENERATE */}

                          {invoice.status === "pending" && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="me-2"
                              onClick={() =>
                                navigate(
                                  `/billing/invoices/${invoice._id}/regenerate`,
                                )
                              }
                            >
                              Regenerate
                            </Button>
                          )}

                          {/* MARK PAID */}

                          {invoice.status === "pending" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="me-2"
                              disabled={paying}
                              onClick={() => markPaidHandler(invoice._id)}
                            >
                              Mark Paid
                            </Button>
                          )}

                          {/* CANCEL */}

                          {invoice.status === "pending" && (
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={cancelling}
                              onClick={() => cancelHandler(invoice._id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InvoiceListScreen;
