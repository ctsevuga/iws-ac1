import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";

import {
  useGetSubscriptionQuery,
  useUpdateSubscriptionMutation,
} from "../../slices/subscriptionApiSlice";

import AsyncSelect from "react-select/async";
import { useLazySearchCompaniesQuery } from "../../slices/companyApiSlice";

const SubscriptionEditScreen = () => {
  /* -------------------------------------------------------------------------- */
  /*                                  COMPANY                                   */
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
  /*                              SUBSCRIPTION                                  */
  /* -------------------------------------------------------------------------- */

  const {
    data: subscriptionData,
    isLoading,
    refetch,
  } = useGetSubscriptionQuery(companyId, {
    skip: !companyId,
  });

  const [updateSubscription, { isLoading: loadingUpdate }] =
    useUpdateSubscriptionMutation();

  /* -------------------------------------------------------------------------- */
  /*                                  STATE                                     */
  /* -------------------------------------------------------------------------- */

  const [plan, setPlan] = useState("basic");
  const [status, setStatus] = useState("active");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [autoRenew, setAutoRenew] = useState(true);
  const [currency, setCurrency] = useState("INR");

  const [billingDay, setBillingDay] = useState("");

  const [startedAt, setStartedAt] = useState("");

  const [nextBillingDate, setNextBillingDate] = useState("");

  const [cancelledAt, setCancelledAt] = useState("");

  const [createdAt, setCreatedAt] = useState("");

  const [updatedAt, setUpdatedAt] = useState("");

  /* -------------------------------------------------------------------------- */
  /*                              LOAD SUBSCRIPTION                             */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!subscriptionData?.data) return;

    const s = subscriptionData.data;

    setPlan(s.plan);
    setStatus(s.status);
    setBillingCycle(s.billingCycle);
    setAutoRenew(s.autoRenew);
    setCurrency(s.currency);

    setBillingDay(s.billingDay);

    setStartedAt(s.startedAt ? new Date(s.startedAt).toLocaleDateString() : "");

    setCreatedAt(s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "");

    setUpdatedAt(s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : "");

    setNextBillingDate(
      s.nextBillingDate ? s.nextBillingDate.substring(0, 10) : "",
    );

    setCancelledAt(s.cancelledAt ? s.cancelledAt.substring(0, 10) : "");
  }, [subscriptionData]);

  /* -------------------------------------------------------------------------- */
  /*                                  SUBMIT                                    */
  /* -------------------------------------------------------------------------- */

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateSubscription({
        companyId,
        plan,
        status,
        billingCycle,
        autoRenew,
        currency,
        nextBillingDate,
        cancelledAt: cancelledAt === "" ? null : cancelledAt,
      }).unwrap();

      toast.success("Subscription updated");

      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Unable to update subscription");
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-4 text-primary">Subscription Details</h3>

              {/* COMPANY */}

              <Form.Group className="mb-4">
                <Form.Label>Select Company</Form.Label>

                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadCompanyOptions}
                  value={company}
                  placeholder="Search company..."
                  noOptionsMessage={() => "No companies found"}
                  loadingMessage={() => "Searching companies..."}
                  isClearable
                  onChange={(selectedCompany) => {
                    setCompany(selectedCompany);
                    setCompanyId(selectedCompany ? selectedCompany.value : "");
                  }}
                />
              </Form.Group>

              {companyId && isLoading && (
                <div className="text-center">
                  <Spinner animation="border" />
                </div>
              )}

              {companyId && subscriptionData?.data && (
                <Form onSubmit={submitHandler}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Plan</Form.Label>

                        <Form.Select
                          value={plan}
                          onChange={(e) => setPlan(e.target.value)}
                        >
                          <option value="basic">Basic</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>

                        <Form.Select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                        >
                          <option value="active">Active</option>

                          <option value="paused">Paused</option>

                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Billing Cycle</Form.Label>

                        <Form.Select
                          value={billingCycle}
                          onChange={(e) => setBillingCycle(e.target.value)}
                        >
                          <option value="monthly">Monthly</option>

                          <option value="yearly">Yearly</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Currency</Form.Label>

                        <Form.Select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                        >
                          <option value="INR">INR</option>

                          <option value="USD">USD</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Next Billing Date</Form.Label>

                    <Form.Control
                      type="date"
                      value={nextBillingDate}
                      onChange={(e) => setNextBillingDate(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Cancelled At</Form.Label>

                    <Form.Control
                      type="date"
                      value={cancelledAt}
                      onChange={(e) => setCancelledAt(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Check
                    className="mb-4"
                    type="switch"
                    label="Auto Renew"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                  />

                  <hr />

                  <h5>Subscription Information</h5>

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Billing Day</Form.Label>

                        <Form.Control value={billingDay} disabled />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Started At</Form.Label>

                        <Form.Control value={startedAt} disabled />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Created At</Form.Label>

                        <Form.Control value={createdAt} disabled />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Updated At</Form.Label>

                    <Form.Control value={updatedAt} disabled />
                  </Form.Group>

                  <div className="d-grid">
                    <Button type="submit" disabled={loadingUpdate}>
                      {loadingUpdate ? (
                        <>
                          <Spinner
                            size="sm"
                            animation="border"
                            className="me-2"
                          />
                          Updating...
                        </>
                      ) : (
                        "Update Subscription"
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionEditScreen;
