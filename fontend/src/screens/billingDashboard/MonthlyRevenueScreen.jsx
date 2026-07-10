import React, { useState } from "react";

import {
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Alert,
  Form,
} from "react-bootstrap";

import { useGetMonthlyRevenueQuery } from "../../slices/billingDashboardApiSlice";

const MonthlyRevenueScreen = () => {
  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState(currentYear);

  const { data, isLoading, error } =
    useGetMonthlyRevenueQuery({ year });

  const revenue = data?.data;

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
                  Monthly Revenue
                </h2>

                <p className="text-muted mb-0">
                  Revenue generated from paid invoices
                </p>
              </div>

              <div style={{ width: "180px" }}>
                <Form.Select
                  value={year}
                  onChange={(e) =>
                    setYear(Number(e.target.value))
                  }
                >
                  {Array.from(
                    { length: 6 },
                    (_, i) => currentYear - i
                  ).map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </Form.Select>
              </div>

            </div>

            {isLoading ? (
              <div className="text-center my-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger">
                {error?.data?.message ||
                  error?.error ||
                  "Unable to load revenue"}
              </Alert>
            ) : (
              <>

                {/* ================================================= */}
                {/* Summary */}
                {/* ================================================= */}

                <Row className="mb-4">

                  <Col md={4}>
                    <Card bg="success" text="white">
                      <Card.Body>

                        <h6>Total Revenue</h6>

                        <h2>
                          ₹
                          {revenue.totalRevenue.toLocaleString()}
                        </h2>

                        <small>
                          Year {revenue.year}
                        </small>

                      </Card.Body>
                    </Card>
                  </Col>

                </Row>

                {/* ================================================= */}
                {/* Monthly Cards */}
                {/* ================================================= */}

                <Row className="mb-4">

                  {revenue.monthlyRevenue.map((month) => (
                    <Col
                      lg={3}
                      md={4}
                      sm={6}
                      className="mb-3"
                      key={month.month}
                    >
                      <Card className="h-100">

                        <Card.Body>

                          <h6>
                            {month.monthName}
                          </h6>

                          <h4 className="text-success">
                            ₹
                            {month.revenue.toLocaleString()}
                          </h4>

                          <small className="text-muted">
                            {month.invoices} Invoice(s)
                          </small>

                        </Card.Body>

                      </Card>
                    </Col>
                  ))}

                </Row>

                {/* ================================================= */}
                {/* Revenue Table */}
                {/* ================================================= */}

                <Card>

                  <Card.Header>
                    <strong>
                      Monthly Revenue Details
                    </strong>
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

                          <th>Month</th>

                          <th>Total Revenue</th>

                          <th>Invoices Paid</th>

                        </tr>

                      </thead>

                      <tbody>

                        {revenue.monthlyRevenue.map((month) => (
                          <tr key={month.month}>

                            <td>
                              {month.monthName}
                            </td>

                            <td>
                              ₹
                              {month.revenue.toLocaleString()}
                            </td>

                            <td>
                              {month.invoices}
                            </td>

                          </tr>
                        ))}

                      </tbody>

                      <tfoot>

                        <tr className="table-primary">

                          <th>Total</th>

                          <th>
                            ₹
                            {revenue.totalRevenue.toLocaleString()}
                          </th>

                          <th>
                            {revenue.monthlyRevenue.reduce(
                              (sum, item) =>
                                sum + item.invoices,
                              0
                            )}
                          </th>

                        </tr>

                      </tfoot>

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

export default MonthlyRevenueScreen;