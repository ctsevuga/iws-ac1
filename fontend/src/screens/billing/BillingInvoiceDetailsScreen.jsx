import React, { useRef } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Button,
} from "react-bootstrap";

import html2pdf from "html2pdf.js";

import { useParams, useNavigate } from "react-router-dom";

import { useGetInvoiceQuery } from "../../slices/billingApiSlice";

import "../../css/InvoiceDetailsScreen.css";

const InvoiceDetailsScreen = () => {
  const { invoiceId } = useParams();

  const navigate = useNavigate();

  const invoiceRef = useRef(null);

  const { data, isLoading, error } = useGetInvoiceQuery(invoiceId);

  const invoice = data?.data;

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner />
      </Container>
    );
  }

  if (error || !invoice) {
    return (
      <Container className="py-5">
        <Card>
          <Card.Body>
            <h5 className="text-danger">
              {error?.data?.message || "Invoice not found"}
            </h5>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const options = {
      margin: 0.4,

      filename: `${invoice.invoice.invoiceNumber}.pdf`,

      image: {
        type: "jpeg",
        quality: 1,
      },

      html2canvas: {
        scale: 2,
        useCORS: true,
      },

      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf().set(options).from(invoiceRef.current).save();
  };

  const statusVariant = (status) => {
    switch (status) {
      case "paid":
        return "success";

      case "cancelled":
        return "danger";

      case "overdue":
        return "danger";

      default:
        return "warning";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString();
  };

  return (
    <Container className="py-4">
      <div className="d-flex gap-2 mb-3 no-print">
        <Button variant="outline-primary" onClick={handlePrint}>
          🖨 Print
        </Button>

        <Button variant="primary" onClick={handleDownloadPDF}>
          📄 Download PDF
        </Button>
      </div>

      <Row className="justify-content-center">
        <Col lg={10}>
          <div ref={invoiceRef}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                {/* HEADER */}

                <div className="d-flex justify-content-between mb-4">
                  <div>
                    <h3 className="fw-bold text-primary">Invoice</h3>

                    <h6>{invoice.invoice.invoiceNumber}</h6>
                  </div>

                  <Badge bg={statusVariant(invoice.invoice.status)}>
  {invoice.invoice.status}
</Badge>
                </div>

                {/* CUSTOMER GST SNAPSHOT */}

                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Billing Information
                  </Card.Header>

                  <Card.Body>
  <Row>
    <Col md={6}>
      <p>
        <strong>Company:</strong> {invoice.company.name}
      </p>

      <p>
        <strong>GSTIN:</strong> {invoice.company.gstin || "-"}
      </p>

      <p>
        <strong>State Code:</strong> {invoice.company.stateCode || "-"}
      </p>
    </Col>

    <Col md={6}>
      <strong>Billing Address</strong>

      <div className="mt-2">
        {invoice.company.billingAddress?.addressLine1}
        <br />

        {invoice.company.billingAddress?.addressLine2}
        <br />

        {invoice.company.billingAddress?.city},{" "}
        {invoice.company.billingAddress?.district}
        <br />

        {invoice.company.billingAddress?.state}
        {" - "}
        {invoice.company.billingAddress?.pincode}
        <br />

        {invoice.company.billingAddress?.country}
      </div>
    </Col>
  </Row>
</Card.Body>
                </Card>

                {/* INVOICE INFORMATION */}

                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Invoice Information
                  </Card.Header>

                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p>
                          <strong>Invoice Date:</strong>{" "}
                          {formatDate(invoice.invoice.invoiceDate)}
                        </p>

                        <p>
                          <strong>Due Date:</strong>{" "}
                          {formatDate(invoice.invoice.dueDate)}
                        </p>
                      </Col>

                      <Col md={6}>
                        <p>
                          <strong>Billing Period:</strong>
                        </p>

                        <p>
                          {formatDate(invoice.invoice.billingPeriod.from)}

                          {" - "}

                          {formatDate(invoice.invoice.billingPeriod.to)}
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* USAGE SNAPSHOT */}

                <Card className="mb-4">
                  <Card.Header className="fw-bold">Usage Snapshot</Card.Header>

                  <Card.Body>
                    <Row>
                      <Col>
                        Managers
                        <h5>{invoice.usage.managers}</h5>
                      </Col>

                      <Col>
                        Dispatchers
                        <h5>{invoice.usage.dispatchers}</h5>
                      </Col>

                      <Col>
                        Technicians
                        <h5>{invoice.usage.technicians}</h5>
                      </Col>
                    </Row>
                    <Row className="mt-3">
  <Col>
    Extra Managers
    <h6>{invoice.usage.extraManagers}</h6>
  </Col>

  <Col>
    Extra Dispatchers
    <h6>{invoice.usage.extraDispatchers}</h6>
  </Col>

  <Col>
    Extra Technicians
    <h6>{invoice.usage.extraTechnicians}</h6>
  </Col>
</Row>
                  </Card.Body>
                </Card>

                {/* LINE ITEMS */}

                <Card className="mb-4">
                  <Card.Header className="fw-bold">Billing Items</Card.Header>

                  <Card.Body>
                    <Table bordered responsive>
                      <thead>
                        <tr>
                          <th>Description</th>

                          <th>Qty</th>

                          <th>Unit Price</th>

                          <th>Amount</th>
                        </tr>
                      </thead>

                      <tbody>
                        {invoice.items?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.description}</td>

                            <td>{item.quantity}</td>

                            <td>₹{item.unitPrice}</td>

                            <td>₹{item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                {/* GST SUMMARY */}

                <Card className="mb-4">
                  <Card.Header className="fw-bold">GST Summary</Card.Header>

                  <Card.Body>

  <Table borderless>

    <tbody>

      <tr>
        <td>Subtotal</td>
        <td className="text-end">
          ₹{invoice.summary.subtotal.toLocaleString()}
        </td>
      </tr>

      <tr>
        <td>
          GST ({invoice.summary.gst.percentage}%)
        </td>

        <td className="text-end">
          ₹{invoice.summary.gst.amount.toLocaleString()}
        </td>
      </tr>

      {invoice.summary.gst.type === "CGST_SGST" ? (
        <>
          <tr>
            <td>CGST</td>

            <td className="text-end">
              ₹{invoice.summary.gst.cgst.toLocaleString()}
            </td>
          </tr>

          <tr>
            <td>SGST</td>

            <td className="text-end">
              ₹{invoice.summary.gst.sgst.toLocaleString()}
            </td>
          </tr>
        </>
      ) : (
        <tr>
          <td>IGST</td>

          <td className="text-end">
            ₹{invoice.summary.gst.igst.toLocaleString()}
          </td>
        </tr>
      )}

      <tr className="table-primary">
        <th>Total Amount</th>

        <th className="text-end">
          ₹{invoice.summary.totalAmountWithGST.toLocaleString()}
        </th>
      </tr>

      <tr>
        <td>Paid</td>

        <td className="text-end">
          ₹{invoice.summary.paidAmount.toLocaleString()}
        </td>
      </tr>

      <tr className="table-warning">
        <th>Balance</th>

        <th className="text-end">
          ₹{invoice.summary.balanceAmount.toLocaleString()}
        </th>
      </tr>

    </tbody>

  </Table>

</Card.Body>
                </Card>

                {/* PAYMENT */}

                <Card className="mb-4">
                  <Card.Header className="fw-bold">
                    Payment Information
                  </Card.Header>

                  <Card.Body>
                    <p>Status: {invoice.payment.status}</p>

<p>Paid At: {formatDate(invoice.payment.paidAt)}</p>
                  </Card.Body>
                </Card>

                <div className="d-flex justify-content-end no-print">
                  <Button variant="secondary" onClick={() => navigate(-1)}>
                    Back
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default InvoiceDetailsScreen;
