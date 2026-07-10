import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";

import AsyncSelect from "react-select/async";
import { useLazySearchCompaniesQuery } from "../../slices/companyApiSlice";
import { useGetSubscriptionQuery } from "../../slices/subscriptionApiSlice";

const SubscriptionDetailsScreen = () => {
  /* -------------------------------------------------------------------------- */
  /*                              SELECT COMPANY                                */
  /* -------------------------------------------------------------------------- */

  const [companyId, setCompanyId] = useState("");

  const [company, setCompany] = useState(null);

const [searchCompanies] = useLazySearchCompaniesQuery();

const loadCompanyOptions = async (inputValue) => {
  try {
    const response = await searchCompanies({
      search: inputValue,
      page: 1,
      limit: 20,
    }).unwrap();

    return response.companies.map((company) => ({
      value: company._id,
      label: company.legalName
        ? `${company.name} (${company.legalName})`
        : company.name,
    }));
  } catch (error) {
    return [];
  }
};

  /* -------------------------------------------------------------------------- */
  /*                           LOAD SUBSCRIPTION                                */
  /* -------------------------------------------------------------------------- */

  const {
    data: subscriptionData,
    isLoading: loadingSubscription,
    error: subscriptionError,
  } = useGetSubscriptionQuery(companyId, {
    skip: !companyId,
  });

  const subscription = subscriptionData?.data;

  /* -------------------------------------------------------------------------- */
  /*                               FORMAT DATE                                  */
  /* -------------------------------------------------------------------------- */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  /* -------------------------------------------------------------------------- */

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={9}>

          {/* ================================================================ */}
          {/* SELECT COMPANY */}
          {/* ================================================================ */}

          <Card className="shadow-sm border-0 mb-4">
            <Card.Body>
              <h3 className="text-primary fw-bold mb-4">
                View Subscription
              </h3>

              <Form.Group>
  <Form.Label>Select Company</Form.Label>

  <AsyncSelect
    cacheOptions
    defaultOptions
    loadOptions={loadCompanyOptions}
    value={company}
    placeholder="Search company..."
    noOptionsMessage={() => "No companies found"}
    loadingMessage={() => "Searching companies..."}
    onChange={(selectedCompany) => {
      setCompany(selectedCompany);
      setCompanyId(selectedCompany ? selectedCompany.value : "");
    }}
    isClearable
  />
</Form.Group>
            </Card.Body>
          </Card>

          {/* ================================================================ */}
          {/* LOADING */}
          {/* ================================================================ */}

          {loadingSubscription && (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          )}

          

          {subscriptionError && companyId && (
            <Alert variant="warning">
              Subscription not found for the selected company.
            </Alert>
          )}

          {/* ================================================================ */}
          {/* COMPANY INFORMATION */}
          {/* ================================================================ */}

          {subscription && (
            <>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Header className="fw-bold">
                  Company Information
                </Card.Header>

                <Card.Body>
                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          value={subscription.company?.name || ""}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Legal Name</Form.Label>
                        <Form.Control
                          value={subscription.company?.legalName || ""}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          value={subscription.company?.email || ""}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          value={subscription.company?.phone || ""}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Slug</Form.Label>
                        <Form.Control
                          value={subscription.company?.slug || ""}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Company Created</Form.Label>
                        <Form.Control
                          value={formatDate(
                            subscription.company?.createdAt
                          )}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>
                </Card.Body>
              </Card>

              {/* ============================================================ */}
              {/* SUBSCRIPTION INFORMATION */}
              {/* ============================================================ */}

              <Card className="shadow-sm border-0">
                <Card.Header className="fw-bold">
                  Subscription Information
                </Card.Header>

                <Card.Body>

                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Subscription ID</Form.Label>
                        <Form.Control
                          value={subscription._id}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Plan</Form.Label>
                        <Form.Control
                          value={subscription.plan}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Control
                          value={subscription.status}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Billing Cycle</Form.Label>
                        <Form.Control
                          value={subscription.billingCycle}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Billing Day</Form.Label>
                        <Form.Control
                          value={subscription.billingDay}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Currency</Form.Label>
                        <Form.Control
                          value={subscription.currency}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Auto Renew</Form.Label>
                        <Form.Control
                          value={
                            subscription.autoRenew
                              ? "Yes"
                              : "No"
                          }
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Started At</Form.Label>
                        <Form.Control
                          value={formatDate(
                            subscription.startedAt
                          )}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Next Billing Date
                        </Form.Label>
                        <Form.Control
                          value={formatDate(
                            subscription.nextBillingDate
                          )}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cancelled At</Form.Label>
                        <Form.Control
                          value={formatDate(
                            subscription.cancelledAt
                          )}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                  <Row>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          Subscription Created
                        </Form.Label>
                        <Form.Control
                          value={formatDate(
                            subscription.createdAt
                          )}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Last Updated</Form.Label>
                        <Form.Control
                          value={formatDate(
                            subscription.updatedAt
                          )}
                          readOnly
                        />
                      </Form.Group>
                    </Col>

                  </Row>

                </Card.Body>
              </Card>
            </>
          )}

        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionDetailsScreen;