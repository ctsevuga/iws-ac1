import React, { useState, useRef } from "react";

import html2pdf from "html2pdf.js";

import "../../css/InvoiceDetailsScreen.css";

import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Form,
  InputGroup,
  Pagination,
  Button,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import { useGetMyInvoicesQuery } from "../../slices/companyBillingApiSlice";

const MyInvoicesScreen = () => {
  const navigate = useNavigate();

  const reportRef = useRef(null);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetMyInvoicesQuery({
    search,

    status: status || undefined,

    page,

    limit: 20,
  });

  const billing = data?.data || {};

  const invoices = billing.invoices || [];
  console.log(invoices);

  const pagination = data?.pagination;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!reportRef.current) return;

    html2pdf()
      .set({
        margin: 8,

        filename: `Invoice-History-${
          new Date().toISOString().split("T")[0]
        }.pdf`,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "landscape",
        },
      })
      .from(reportRef.current)
      .save();
  };

  const badgeVariant = (status) => {
    switch (status) {
      case "paid":
        return "success";

      case "pending":
        return "warning";

      case "overdue":
        return "danger";

      case "cancelled":
        return "secondary";

      default:
        return "dark";
    }
  };
  console.log(invoices);
  console.log(invoices[0]);
  console.log(invoices[0]?.amount);

  return (
    <Row className="justify-content-center my-4">
      <Col md={12}>
        <div ref={reportRef}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="mb-4">
                <h2>My Invoices</h2>

                <p className="text-muted">
                  View your company's billing history
                </p>

                <div className="d-flex gap-2 no-print">
                  <Button variant="outline-primary" onClick={handlePrint}>
                    🖨 Print
                  </Button>

                  <Button variant="primary" onClick={handleDownloadPDF}>
                    📄 Download PDF
                  </Button>
                </div>
              </div>

              {/* FILTERS */}

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

                <Col md={3}>
                  <Form.Select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);

                      setPage(1);
                    }}
                  >
                    <option value="">All Status</option>

                    <option value="paid">Paid</option>

                    <option value="pending">Pending</option>

                    <option value="overdue">Overdue</option>

                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Col>
              </Row>

              {isLoading ? (
                <div className="text-center my-5">
                  <Spinner animation="border" />
                </div>
              ) : error ? (
                <Alert variant="danger">
                  {error?.data?.message || "Unable to load invoices"}
                </Alert>
              ) : (
                <>
                  {/* SUMMARY */}

                  <Row className="mb-4">
                    <Col md={3}>
                      <Card bg="primary" text="white">
                        <Card.Body>
                          <h6>Total Invoices</h6>

                          <h2>{billing.summary?.totalInvoices || 0}</h2>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={3}>
                      <Card bg="info" text="white">
                        <Card.Body>
                          <h6>Total Billed</h6>

                          <h2>
                            ₹
                            {(
                              billing.summary?.totalBilled || 0
                            ).toLocaleString()}
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
                            {(billing.summary?.totalPaid || 0).toLocaleString()}
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
                            {(
                              billing.summary?.outstanding || 0
                            ).toLocaleString()}
                          </h2>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* INVOICE TABLE */}

                  <Card>
                    <Card.Header>
                      <strong>Invoice History</strong>
                    </Card.Header>

                    <Card.Body>
                      <Table responsive bordered hover>
                        <thead>
                          <tr>
                            <th>Invoice</th>

                            <th>Plan</th>

                            <th>Billing Period</th>

                            <th>GST</th>

                            <th>Total</th>

                            <th>Paid</th>

                            <th>Balance</th>

                            <th>Status</th>

                            <th>Due Date</th>

                            <th>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {invoices.length === 0 ? (
                            <tr>
                              <td colSpan="10" className="text-center">
                                No invoices found
                              </td>
                            </tr>
                          ) : (
                            invoices.map((invoice) => (
                              <tr key={invoice._id}>
                                <td>
                                  <strong>{invoice.invoiceNumber}</strong>
                                </td>

                                <td>
                                  {invoice.subscription?.plan}
                                  <br />
                                  <small>
                                    {invoice.subscription?.billingCycle}
                                  </small>
                                </td>

                                <td>
                                  {new Date(
                                    invoice.billingPeriod.from,
                                  ).toLocaleDateString()}
                                  <br />
                                  to
                                  <br />
                                  {new Date(
                                    invoice.billingPeriod.to,
                                  ).toLocaleDateString()}
                                </td>

                                <td>
                                  ₹{(invoice.amount?.gst || 0).toLocaleString()}
                                </td>

                                <td>
                                  <strong>
                                    ₹
                                    {(
                                      invoice.amount?.total || 0
                                    ).toLocaleString()}
                                  </strong>
                                </td>

                                <td>
                                  ₹
                                  {(invoice.amount?.paid || 0).toLocaleString()}
                                </td>

                                <td>
                                  <strong className="text-danger">
                                    ₹
                                    {(
                                      invoice.amount?.balance || 0
                                    ).toLocaleString()}
                                  </strong>
                                </td>

                                <td>
                                  <Badge bg={badgeVariant(invoice.status)}>
                                    {invoice.status}
                                  </Badge>
                                </td>

                                <td>
                                  {invoice.dueDate
                                    ? new Date(
                                        invoice.dueDate,
                                      ).toLocaleDateString()
                                    : "-"}
                                </td>

                                <td>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() =>
                                      navigate("/company-billing/current-plan")
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

                  {/* PAGINATION */}

                  <div className="d-flex justify-content-between mt-3">
                    <small>Total Records: {pagination?.total || 0}</small>

                    <Pagination>
                      <Pagination.Prev
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      />

                      <Pagination.Item active>{page}</Pagination.Item>

                      <Pagination.Next
                        disabled={page === pagination?.pages}
                        onClick={() => setPage((p) => p + 1)}
                      />
                    </Pagination>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default MyInvoicesScreen;
