import React from "react";

import {
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import { useGetBillingDashboardQuery } from "../../slices/billingDashboardApiSlice";

const BillingDashboardScreen = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetBillingDashboardQuery();

  const dashboard = data?.data;

  return (
    <Row className="justify-content-center my-4">
      <Col md={12}>
        <Card className="shadow-sm border-0">
          <Card.Body>

            {/* Header */}

            <div className="mb-4">
              <h2 className="mb-1">
                Billing Dashboard
              </h2>

              <p className="text-muted mb-0">
                SaaS Billing Overview
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
                  "Unable to load dashboard"}
              </Alert>
            ) : (
              <>
                {/* ===================================================== */}
                {/* Company Statistics */}
                {/* ===================================================== */}

                <Row className="mb-4">

                  <Col md={3}>
                    <Card bg="primary" text="white">
                      <Card.Body>
                        <h6>Total Companies</h6>
                        <h2>{dashboard?.companies?.total}</h2>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card bg="success" text="white">
                      <Card.Body>
                        <h6>Active</h6>
                        <h2>{dashboard?.companies?.active}</h2>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card bg="warning" text="dark">
                      <Card.Body>
                        <h6>Trial</h6>
                        <h2>{dashboard?.companies?.trial}</h2>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card bg="info" text="white">
                      <Card.Body>
                        <h6>Paid</h6>
                        <h2>{dashboard?.companies?.paid}</h2>
                      </Card.Body>
                    </Card>
                  </Col>

                </Row>

                {/* ===================================================== */}
                {/* Revenue */}
                {/* ===================================================== */}

                <Row className="mb-4">

                  <Col md={4}>
                    <Card className="border-success">
                      <Card.Body>
                        <h6>Total Revenue</h6>

                        <h3 className="text-success">
                          ₹
                          {dashboard?.revenue?.total?.toLocaleString()}
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="border-primary">
                      <Card.Body>
                        <h6>Current Month</h6>

                        <h3 className="text-primary">
                          ₹
                          {dashboard?.revenue?.currentMonth?.toLocaleString()}
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card className="border-warning">
                      <Card.Body>
                        <h6>MRR</h6>

                        <h3 className="text-warning">
                          ₹
                          {dashboard?.revenue?.mrr?.toLocaleString()}
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>

                </Row>

                {/* ===================================================== */}
                {/* Invoice Summary */}
                {/* ===================================================== */}

                <Row className="mb-4">

                  <Col md={4}>
                    <Card>
                      <Card.Body>

                        <h5>Paid</h5>

                        <h3 className="text-success">
                          {dashboard?.invoices?.paid?.count}
                        </h3>

                        <div>
                          ₹
                          {dashboard?.invoices?.paid?.amount?.toLocaleString()}
                        </div>

                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card>
                      <Card.Body>

                        <h5>Pending</h5>

                        <h3 className="text-warning">
                          {dashboard?.invoices?.pending?.count}
                        </h3>

                        <div>
                          ₹
                          {dashboard?.invoices?.pending?.amount?.toLocaleString()}
                        </div>

                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card>
                      <Card.Body>

                        <h5>Cancelled</h5>

                        <h3 className="text-danger">
                          {dashboard?.invoices?.cancelled?.count}
                        </h3>

                        <div>
                          ₹
                          {dashboard?.invoices?.cancelled?.amount?.toLocaleString()}
                        </div>

                      </Card.Body>
                    </Card>
                  </Col>

                </Row>

                {/* ===================================================== */}
                {/* User Summary */}
                {/* ===================================================== */}

                <Row className="mb-4">

                  <Col md={4}>
                    <Card>
                      <Card.Body>

                        <h6>Managers</h6>

                        <h2>
                          {dashboard?.users?.managers}
                        </h2>

                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card>
                      <Card.Body>

                        <h6>Dispatchers</h6>

                        <h2>
                          {dashboard?.users?.dispatchers}
                        </h2>

                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={4}>
                    <Card>
                      <Card.Body>

                        <h6>Technicians</h6>

                        <h2>
                          {dashboard?.users?.technicians}
                        </h2>

                      </Card.Body>
                    </Card>
                  </Col>

                </Row>

                {/* ===================================================== */}
                {/* Recent Invoices */}
                {/* ===================================================== */}

                <Card>

                  <Card.Header>
                    <strong>Recent Invoices</strong>
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

                          <th>Company</th>

                          <th>Date</th>

                          <th>Total</th>

                          <th>Status</th>

                          <th></th>

                        </tr>
                      </thead>

                      <tbody>

                        {dashboard?.recentInvoices?.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              className="text-center"
                            >
                              No invoices found
                            </td>
                          </tr>
                        ) : (
                          dashboard?.recentInvoices?.map((invoice) => (
                            <tr key={invoice._id}>

                              <td>
                                {invoice.invoiceNumber}
                              </td>

                              <td>
                                {invoice.company?.name}
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

                                <Badge
                                  bg={
                                    invoice.status === "paid"
                                      ? "success"
                                      : invoice.status === "pending"
                                      ? "warning"
                                      : "secondary"
                                  }
                                >
                                  {invoice.status}
                                </Badge>

                              </td>

                              <td>

                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() =>
                                    navigate(
                                      `/billing/${invoice._id}`
                                    )
                                  }
                                >
                                  View
                                </button>

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

export default BillingDashboardScreen;