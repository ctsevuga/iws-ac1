import React, { useState } from "react";

import {
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Alert,
  Badge,
  Form,
  InputGroup,
  Pagination,
  Button,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import { useGetOutstandingInvoicesQuery } from "../../slices/billingDashboardApiSlice";

const OutstandingInvoicesScreen = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    error,
  } = useGetOutstandingInvoicesQuery({
    search,
    page,
    limit: 20,
  });

  const billing = data?.data;

  const pagination = data?.pagination;

  return (
    <Row className="justify-content-center my-4">
      <Col md={12}>
        <Card className="shadow-sm border-0">

          <Card.Body>

            {/* ================================================= */}
            {/* Header */}
            {/* ================================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

              <div>

                <h2 className="mb-1">
                  Outstanding Invoices
                </h2>

                <p className="text-muted mb-0">
                  Pending invoices awaiting payment
                </p>

              </div>

            </div>

            {/* ================================================= */}
            {/* Search */}
            {/* ================================================= */}

            <Row className="mb-4">

              <Col md={5}>

                <InputGroup>

                  <Form.Control
                    placeholder="Search Invoice Number"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />

                </InputGroup>

              </Col>

            </Row>

            {isLoading ? (
              <div className="text-center my-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger">
                {error?.data?.message ||
                  error?.error ||
                  "Unable to load invoices"}
              </Alert>
            ) : (
              <>

                {/* ================================================= */}
                {/* Summary Cards */}
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

                        <h6>Total Amount</h6>

                        <h2>
                          ₹
                          {billing.summary.totalAmount.toLocaleString()}
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
                          {billing.summary.outstandingAmount.toLocaleString()}
                        </h2>

                      </Card.Body>
                    </Card>

                  </Col>

                </Row>

                {/* ================================================= */}
                {/* Invoice Table */}
                {/* ================================================= */}

                <Card>

                  <Card.Header>
                    <strong>Outstanding Invoice List</strong>
                  </Card.Header>

                  <Card.Body>

                    <Table
                      responsive
                      bordered
                      hover
                      className="align-middle"
                    >

                      <thead className="table-light">

                        <tr>

                          <th>Invoice</th>

                          <th>Company</th>

                          <th>Invoice Date</th>

                          <th>Due Date</th>

                          <th>Total</th>

                          <th>Paid</th>

                          <th>Balance</th>

                          <th>Status</th>

                          <th></th>

                        </tr>

                      </thead>

                      <tbody>

                        {billing.invoices.length === 0 ? (

                          <tr>

                            <td
                              colSpan="9"
                              className="text-center"
                            >
                              No outstanding invoices found
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

                                <div>
                                  {invoice.company?.name}
                                </div>

                                <small className="text-muted">
                                  {invoice.company?.email}
                                </small>

                              </td>

                              <td>
                                {new Date(
                                  invoice.invoiceDate
                                ).toLocaleDateString()}
                              </td>

                              <td>

                                {invoice.dueDate
                                  ? new Date(
                                      invoice.dueDate
                                    ).toLocaleDateString()
                                  : "-"}

                                {invoice.isOverdue && (
                                  <>
                                    <br />

                                    <Badge bg="danger">
                                      Overdue
                                    </Badge>
                                  </>
                                )}

                              </td>

                              <td>
                                ₹
                                {invoice.amount.total.toLocaleString()}
                              </td>

                              <td>
                                ₹
                                {invoice.amount.paid.toLocaleString()}
                              </td>

                              <td>

                                <strong className="text-danger">
                                  ₹
                                  {invoice.amount.balance.toLocaleString()}
                                </strong>

                              </td>

                              <td>

                                <Badge bg="warning">
                                  {invoice.status}
                                </Badge>

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
                {/* Pagination */}
                {/* ================================================= */}

                <div className="d-flex justify-content-between align-items-center mt-3">

                  <small className="text-muted">
                    Total Records : {pagination?.total || 0}
                  </small>

                  <Pagination>

                    <Pagination.Prev
                      disabled={page === 1}
                      onClick={() =>
                        setPage((p) => p - 1)
                      }
                    />

                    <Pagination.Item active>
                      {page}
                    </Pagination.Item>

                    <Pagination.Next
                      disabled={
                        page === pagination?.pages
                      }
                      onClick={() =>
                        setPage((p) => p + 1)
                      }
                    />

                  </Pagination>

                </div>

              </>
            )}

          </Card.Body>

        </Card>
      </Col>
    </Row>
  );
};

export default OutstandingInvoicesScreen;