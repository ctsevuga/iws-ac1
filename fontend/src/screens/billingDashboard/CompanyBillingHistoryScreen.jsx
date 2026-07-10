import React from "react";

import {
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Alert,
  Badge,
  Button,
} from "react-bootstrap";

import { useNavigate, useParams } from "react-router-dom";

import { useGetCompanyBillingHistoryQuery } from "../../slices/billingDashboardApiSlice";

const CompanyBillingHistoryScreen = () => {
  const navigate = useNavigate();

  const { companyId } = useParams();

  const { data, isLoading, error } =
    useGetCompanyBillingHistoryQuery(companyId);

  const billing = data?.data;

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge bg="success">Paid</Badge>;

      case "pending":
        return <Badge bg="warning">Pending</Badge>;

      case "cancelled":
        return <Badge bg="secondary">Cancelled</Badge>;

      default:
        return <Badge bg="dark">{status}</Badge>;
    }
  };

  return (
    <Row className="justify-content-center my-4">
      <Col md={12}>
        <Card className="shadow-sm border-0">

          <Card.Body>

            {/* Header */}

            <div className="mb-4">

              <h2 className="mb-1">
                Company Billing History
              </h2>

              <p className="text-muted mb-0">
                Subscription and Invoice History
              </p>

            </div>

            {isLoading ? (
              <div className="text-center my-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger">
                {error?.data?.message ||
                  error?.error ||
                  "Unable to load billing history"}
              </Alert>
            ) : (
              <>

                {/* ================================================= */}
                {/* Company Information */}
                {/* ================================================= */}

                <Card className="mb-4">

                  <Card.Header>
                    <strong>Company Information</strong>
                  </Card.Header>

                  <Card.Body>

                    <Row>

                      <Col md={4}>
                        <strong>Name</strong>
                        <br />
                        {billing.company.name}
                      </Col>

                      <Col md={4}>
                        <strong>Legal Name</strong>
                        <br />
                        {billing.company.legalName}
                      </Col>

                      <Col md={4}>
                        <strong>Email</strong>
                        <br />
                        {billing.company.email}
                      </Col>

                    </Row>

                    <hr />

                    <Row>

                      <Col md={3}>
                        <strong>Phone</strong>
                        <br />
                        {billing.company.phone}
                      </Col>

                      <Col md={3}>
                        <strong>Plan</strong>
                        <br />
                        {billing.company.plan}
                      </Col>

                      <Col md={3}>
                        <strong>Status</strong>
                        <br />
                        <Badge
                          bg={
                            billing.company.subscriptionStatus ===
                            "active"
                              ? "success"
                              : "warning"
                          }
                        >
                          {billing.company.subscriptionStatus}
                        </Badge>
                      </Col>

                      <Col md={3}>
                        <strong>Customer Since</strong>
                        <br />
                        {new Date(
                          billing.company.createdAt
                        ).toLocaleDateString()}
                      </Col>

                    </Row>

                  </Card.Body>

                </Card>

                {/* ================================================= */}
                {/* Subscription */}
                {/* ================================================= */}

                {billing.subscription && (
                  <Card className="mb-4">

                    <Card.Header>
                      <strong>Subscription</strong>
                    </Card.Header>

                    <Card.Body>

                      <Row>

                        <Col md={4}>
                          <strong>Plan</strong>
                          <br />
                          {billing.subscription.planName}
                        </Col>

                        <Col md={4}>
                          <strong>Status</strong>
                          <br />
                          <Badge bg="primary">
                            {billing.subscription.status}
                          </Badge>
                        </Col>

                        <Col md={4}>
                          <strong>Next Billing</strong>
                          <br />
                          {billing.subscription.nextBillingDate
                            ? new Date(
                                billing.subscription.nextBillingDate
                              ).toLocaleDateString()
                            : "-"}
                        </Col>

                      </Row>

                    </Card.Body>

                  </Card>
                )}

                {/* ================================================= */}
                {/* Summary */}
                {/* ================================================= */}

                <Row className="mb-4">

                  <Col md={3}>
                    <Card bg="primary" text="white">
                      <Card.Body>

                        <h6>Total Invoices</h6>

                        <h2>
                          {billing.summary.totalInvoices}
                        </h2>

                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card bg="info" text="white">
                      <Card.Body>

                        <h6>Total Billed</h6>

                        <h2>
                          ₹
                          {billing.summary.totalBilled.toLocaleString()}
                        </h2>

                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card bg="success" text="white">
                      <Card.Body>

                        <h6>Total Paid</h6>

                        <h2>
                          ₹
                          {billing.summary.totalPaid.toLocaleString()}
                        </h2>

                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card bg="danger" text="white">
                      <Card.Body>

                        <h6>Outstanding</h6>

                        <h2>
                          ₹
                          {billing.summary.outstanding.toLocaleString()}
                        </h2>

                      </Card.Body>
                    </Card>
                  </Col>

                </Row>

                {/* ================================================= */}
                {/* Invoice History */}
                {/* ================================================= */}

                <Card className="mb-4">

                  <Card.Header>
                    <strong>Invoice History</strong>
                  </Card.Header>

                  <Card.Body>

                    <Table
                      responsive
                      hover
                      bordered
                      className="align-middle"
                    >

                      <thead className="table-light">

                        <tr>

                          <th>Invoice</th>

                          <th>Billing Period</th>

                          <th>Invoice Date</th>

                          <th>Total</th>

                          <th>Paid</th>

                          <th>Status</th>

                          <th>Payment</th>

                          <th></th>

                        </tr>

                      </thead>

                      <tbody>

                        {billing.invoices.length === 0 ? (
                          <tr>
                            <td
                              colSpan={8}
                              className="text-center"
                            >
                              No invoices found
                            </td>
                          </tr>
                        ) : (
                          billing.invoices.map((invoice) => (
                            <tr key={invoice._id}>

                              <td>
                                <strong>
                                  {invoice.invoiceNumber}
                                </strong>
                              </td>

                              <td>
                                {new Date(
                                  invoice.billingPeriodStart
                                ).toLocaleDateString()}
                                <br />
                                <small className="text-muted">
                                  to
                                </small>
                                <br />
                                {new Date(
                                  invoice.billingPeriodEnd
                                ).toLocaleDateString()}
                              </td>

                              <td>
                                {new Date(
                                  invoice.invoiceDate
                                ).toLocaleDateString()}
                              </td>

                              <td>
                                ₹
                                {invoice.total.toLocaleString()}
                              </td>

                              <td>
                                ₹
                                {invoice.paidAmount.toLocaleString()}
                              </td>

                              <td>
                                {getStatusBadge(
                                  invoice.status
                                )}
                              </td>

                              <td>
                                {invoice.paymentMethod ||
                                  "-"}
                              </td>

                              <td>

                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() =>
                                    navigate(
                                      `/billing/invoice/${invoice._id}`
                                    )
                                  }
                                >
                                  View
                                </Button>

                              </td>

                            </tr>
                          ))
                        )}

                      </tbody>

                    </Table>

                  </Card.Body>

                </Card>

                {/* ================================================= */}
                {/* Monthly Trend */}
                {/* ================================================= */}

                <Card>

                  <Card.Header>
                    <strong>Monthly Billing Trend</strong>
                  </Card.Header>

                  <Card.Body>

                    <Table
                      bordered
                      hover
                      responsive
                    >

                      <thead className="table-light">

                        <tr>

                          <th>Month</th>

                          <th>Invoices</th>

                          <th>Total Amount</th>

                        </tr>

                      </thead>

                      <tbody>

                        {billing.monthlyTrend.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3}
                              className="text-center"
                            >
                              No data available
                            </td>
                          </tr>
                        ) : (
                          billing.monthlyTrend.map((item, index) => (
                            <tr key={index}>

                              <td>
                                {item._id.month}/
                                {item._id.year}
                              </td>

                              <td>
                                {item.count}
                              </td>

                              <td>
                                ₹
                                {item.amount.toLocaleString()}
                              </td>

                            </tr>
                          ))
                        )}

                      </tbody>

                    </Table>

                  </Card.Body>

                </Card>

              </>
            )}

          </Card.Body>

        </Card>
      </Col>
    </Row>
  );
};

export default CompanyBillingHistoryScreen;