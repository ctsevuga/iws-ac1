import React from "react";

import {
  Row,
  Col,
  Card,
  Table,
  ProgressBar,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";

import { useGetMyCurrentUsageQuery } from "../../slices/companyBillingApiSlice";

const CurrentUsageScreen = () => {
  const { data, isLoading, error } = useGetMyCurrentUsageQuery();

  const usageData = data?.data;

  const getVariant = (percentage) => {
    if (percentage <= 80) return "success";
    if (percentage <= 100) return "warning";
    return "danger";
  };

  return (
    <Row className="justify-content-center my-4">
      <Col md={12}>
        <Card className="shadow-sm border-0">
          <Card.Body>

            {/* ===================================================== */}
            {/* Header */}
            {/* ===================================================== */}

            <div className="mb-4">
              <h2 className="mb-1">
                Current Usage
              </h2>

              <p className="text-muted mb-0">
                Monitor your subscription usage and additional monthly charges.
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
                  "Unable to load usage"}
              </Alert>
            ) : (
              <>

                {/* ===================================================== */}
                {/* Plan Summary */}
                {/* ===================================================== */}

                <Row className="mb-4">

                  <Col md={6}>
                    <Card bg="primary" text="white">
                      <Card.Body>

                        <h6>Current Plan</h6>

                        <h2 className="text-uppercase">
                          {usageData.plan.name}
                        </h2>

                        <Badge bg="light" text="dark">
                          {usageData.plan.status}
                        </Badge>

                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={6}>
                    <Card bg="success" text="white">
                      <Card.Body>

                        <h6>
                          Estimated Additional Monthly Cost
                        </h6>

                        <h2>
                          ₹
                          {usageData.additionalMonthlyCost.toLocaleString()}
                        </h2>

                      </Card.Body>
                    </Card>
                  </Col>

                </Row>

                {/* ===================================================== */}
                {/* Usage Cards */}
                {/* ===================================================== */}

                <Row className="mb-4">

                  {/* Managers */}

                  <Col md={4}>
                    <Card>

                      <Card.Body>

                        <h5>Managers</h5>

                        <div className="mb-2">
                          {usageData.usage.managers} /
                          {" "}
                          {usageData.limits.managers}
                        </div>

                        <ProgressBar
                          now={Math.min(
                            usageData.usagePercentage.managers,
                            100
                          )}
                          variant={getVariant(
                            usageData.usagePercentage.managers
                          )}
                          label={`${usageData.usagePercentage.managers}%`}
                        />

                        {usageData.extraUsage.managers > 0 && (
                          <div className="mt-2 text-danger">
                            Extra Managers :
                            {" "}
                            {usageData.extraUsage.managers}
                          </div>
                        )}

                      </Card.Body>

                    </Card>
                  </Col>

                  {/* Dispatchers */}

                  <Col md={4}>
                    <Card>

                      <Card.Body>

                        <h5>Dispatchers</h5>

                        <div className="mb-2">
                          {usageData.usage.dispatchers} /
                          {" "}
                          {usageData.limits.dispatchers}
                        </div>

                        <ProgressBar
                          now={Math.min(
                            usageData.usagePercentage.dispatchers,
                            100
                          )}
                          variant={getVariant(
                            usageData.usagePercentage.dispatchers
                          )}
                          label={`${usageData.usagePercentage.dispatchers}%`}
                        />

                        {usageData.extraUsage.dispatchers > 0 && (
                          <div className="mt-2 text-danger">
                            Extra Dispatchers :
                            {" "}
                            {usageData.extraUsage.dispatchers}
                          </div>
                        )}

                      </Card.Body>

                    </Card>
                  </Col>

                  {/* Technicians */}

                  <Col md={4}>
                    <Card>

                      <Card.Body>

                        <h5>Technicians</h5>

                        <div className="mb-2">
                          {usageData.usage.technicians} /
                          {" "}
                          {usageData.limits.technicians}
                        </div>

                        <ProgressBar
                          now={Math.min(
                            usageData.usagePercentage.technicians,
                            100
                          )}
                          variant={getVariant(
                            usageData.usagePercentage.technicians
                          )}
                          label={`${usageData.usagePercentage.technicians}%`}
                        />

                        {usageData.extraUsage.technicians > 0 && (
                          <div className="mt-2 text-danger">
                            Extra Technicians :
                            {" "}
                            {usageData.extraUsage.technicians}
                          </div>
                        )}

                      </Card.Body>

                    </Card>
                  </Col>

                </Row>

                {/* ===================================================== */}
                {/* Detailed Usage */}
                {/* ===================================================== */}

                <Card>

                  <Card.Header>
                    <strong>Usage Details</strong>
                  </Card.Header>

                  <Card.Body>

                    <Table
                      bordered
                      hover
                      responsive
                      className="align-middle"
                    >

                      <thead className="table-light">

                        <tr>

                          <th>User Type</th>

                          <th>Current</th>

                          <th>Included</th>

                          <th>Extra</th>

                          <th>Usage</th>

                        </tr>

                      </thead>

                      <tbody>

                        <tr>

                          <td>Managers</td>

                          <td>
                            {usageData.usage.managers}
                          </td>

                          <td>
                            {usageData.limits.managers}
                          </td>

                          <td>
                            {usageData.extraUsage.managers}
                          </td>

                          <td>
                            {usageData.usagePercentage.managers}%
                          </td>

                        </tr>

                        <tr>

                          <td>Dispatchers</td>

                          <td>
                            {usageData.usage.dispatchers}
                          </td>

                          <td>
                            {usageData.limits.dispatchers}
                          </td>

                          <td>
                            {usageData.extraUsage.dispatchers}
                          </td>

                          <td>
                            {usageData.usagePercentage.dispatchers}%
                          </td>

                        </tr>

                        <tr>

                          <td>Technicians</td>

                          <td>
                            {usageData.usage.technicians}
                          </td>

                          <td>
                            {usageData.limits.technicians}
                          </td>

                          <td>
                            {usageData.extraUsage.technicians}
                          </td>

                          <td>
                            {usageData.usagePercentage.technicians}%
                          </td>

                        </tr>

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

export default CurrentUsageScreen;