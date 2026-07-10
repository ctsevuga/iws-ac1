import React, { useRef } from "react";

import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";

import "../../css/InvoiceDetailsScreen.css";

import html2pdf from "html2pdf.js";

import { useGetMyCurrentPlanQuery } from "../../slices/companyBillingApiSlice";

const CurrentPlanScreen = () => {
  const { data, isLoading, error } = useGetMyCurrentPlanQuery();

  const plan = data?.data;

  const planRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    html2pdf()
      .set({
        margin: 0.4,

        filename: `Current-Subscription-${Date.now()}.pdf`,

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 3,
          useCORS: true,
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(planRef.current)
      .save();
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error?.data?.message || "Unable to load subscription"}
      </Alert>
    );
  }

  return (
    <Row className="justify-content-center my-4">
      <Col md={12}>
        <div ref={planRef}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <div className="mb-4">
                <h2>Current Subscription</h2>

                <p className="text-muted">
                  View your subscription, usage and GST-inclusive billing.
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

              {/* SUBSCRIPTION INFORMATION */}

              <Card className="mb-4">
                <Card.Header>
                  <strong>Subscription Information</strong>
                </Card.Header>

                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <strong>Plan</strong>
                      <br />
                      {plan.plan.name.toUpperCase()}
                    </Col>

                    <Col md={3}>
                      <strong>Status</strong>
                      <br />
                      <Badge
                        bg={
                          plan.plan.status === "active"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {plan.plan.status}
                      </Badge>
                    </Col>

                    <Col md={3}>
                      <strong>Billing Cycle</strong>
                      <br />
                      {plan.plan.billingCycle}
                    </Col>

                    <Col md={3}>
                      <strong>Next Billing Date</strong>
                      <br />
                      {new Date(plan.plan.nextBillingDate).toLocaleDateString()}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* USER USAGE */}

              <Card className="mb-4">
                <Card.Header>
                  <strong>Current Usage</strong>
                </Card.Header>

                <Card.Body>
                  <Table bordered responsive>
                    <thead className="table-light">
                      <tr>
                        <th>User Type</th>
                        <th>Current</th>
                        <th>Included</th>
                        <th>Additional</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>Managers</td>
                        <td>{plan.usage.managers}</td>
                        <td>{plan.limits.included.managers}</td>
                        <td>{plan.additionalUsers.managers}</td>
                      </tr>

                      <tr>
                        <td>Dispatchers</td>
                        <td>{plan.usage.dispatchers}</td>
                        <td>{plan.limits.included.dispatchers}</td>
                        <td>{plan.additionalUsers.dispatchers}</td>
                      </tr>

                      <tr>
                        <td>Technicians</td>
                        <td>{plan.usage.technicians}</td>
                        <td>{plan.limits.included.technicians}</td>
                        <td>{plan.additionalUsers.technicians}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* MONTHLY BILLING */}

              <Card className="mb-4">
                <Card.Header>
                  <strong>Estimated Monthly Billing</strong>
                </Card.Header>

                <Card.Body>
                  <Table bordered>
                    <tbody>
                      <tr>
                        <td>Base Plan</td>
                        <td>
                          ₹{plan.limits.pricing.basePlan.toLocaleString()}
                        </td>
                      </tr>

                      <tr>
                        <td>Additional Managers</td>
                        <td>
                          ₹
                          {(
                            plan.additionalUsers.managers *
                            plan.limits.pricing.extraManager
                          ).toLocaleString()}
                        </td>
                      </tr>

                      <tr>
                        <td>Additional Dispatchers</td>
                        <td>
                          ₹
                          {(
                            plan.additionalUsers.dispatchers *
                            plan.limits.pricing.extraDispatcher
                          ).toLocaleString()}
                        </td>
                      </tr>

                      <tr>
                        <td>Additional Technicians</td>
                        <td>
                          ₹
                          {(
                            plan.additionalUsers.technicians *
                            plan.limits.pricing.extraTechnician
                          ).toLocaleString()}
                        </td>
                      </tr>

                      <tr>
                        <td>Subtotal</td>
                        <td>₹{plan.billing.subtotal.toLocaleString()}</td>
                      </tr>

                      <tr>
                        <td>GST ({plan.billing.gst.percentage}%)</td>
                        <td>₹{plan.billing.gst.amount.toLocaleString()}</td>
                      </tr>

                      <tr className="table-success fw-bold">
                        <td>Total (Incl. GST)</td>
                        <td>
                          ₹{plan.billing.totalAmountWithGST.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>

              {/* GST DETAILS */}

              <Card className="mb-4">
                <Card.Header>
                  <strong>GST Details</strong>
                </Card.Header>

                <Card.Body>
                  <Table bordered responsive>
                    <tbody>
                      <tr>
                        <td>GST Type</td>
                        <td>{plan.billing.gst.type}</td>
                      </tr>

                      <tr>
                        <td>GST Percentage</td>
                        <td>{plan.billing.gst.percentage}%</td>
                      </tr>

                      <tr>
                        <td>CGST</td>
                        <td>₹{plan.billing.gst.cgst.toLocaleString()}</td>
                      </tr>

                      <tr>
                        <td>SGST</td>
                        <td>₹{plan.billing.gst.sgst.toLocaleString()}</td>
                      </tr>

                      <tr>
                        <td>IGST</td>
                        <td>₹{plan.billing.gst.igst.toLocaleString()}</td>
                      </tr>

                      <tr className="table-info">
                        <td>Total GST</td>
                        <td>₹{plan.billing.gst.amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
              <Card className="mb-4">
                <Card.Header>
                  <strong>Billing Information</strong>
                </Card.Header>

                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <strong>Company</strong>
                      <br />
                      {plan.company.name}
                    </Col>

                    <Col md={4}>
                      <strong>GSTIN</strong>
                      <br />
                      {plan.company.gstin || "-"}
                    </Col>

                    <Col md={4}>
                      <strong>State Code</strong>
                      <br />
                      {plan.company.stateCode || "-"}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </div>
      </Col>
    </Row>
  );
};

export default CurrentPlanScreen;
