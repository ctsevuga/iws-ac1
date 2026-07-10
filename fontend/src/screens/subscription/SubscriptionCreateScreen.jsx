import React, { useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Container,
  Spinner,
} from "react-bootstrap";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { useCreateSubscriptionMutation } from "../../slices/subscriptionApiSlice";
import AsyncSelect from "react-select/async";

import { useLazySearchCompaniesQuery } from "../../slices/companyApiSlice";

const SubscriptionCreateScreen = () => {
  const navigate = useNavigate();

  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation();

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
  /*                                   FORM                                     */
  /* -------------------------------------------------------------------------- */

  const [company, setCompany] = useState(null);

  const [plan, setPlan] = useState("basic");

  const [billingCycle, setBillingCycle] = useState("monthly");

  const [status, setStatus] = useState("active");

  const [autoRenew, setAutoRenew] = useState(true);

  const [currency, setCurrency] = useState("INR");

  /* -------------------------------------------------------------------------- */
  /*                               SUBMIT                                       */
  /* -------------------------------------------------------------------------- */

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        company: company.value,
        plan,
        billingCycle,
        status,
        autoRenew,
        currency,
      };

      await createSubscription(payload).unwrap();

      toast.success("Subscription created successfully");

      navigate("/subscriptions");
    } catch (err) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="fw-bold text-primary mb-4">Create Subscription</h3>

              <Form onSubmit={submitHandler}>
                {/* Company */}

                <Form.Group className="mb-3">
                  <Form.Label>Company</Form.Label>

                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadCompanyOptions}
                    value={company}
                    placeholder="Search company..."
                    noOptionsMessage={() => "No companies found"}
                    loadingMessage={() => "Searching companies..."}
                    onChange={setCompany}
                  />
                </Form.Group>

                {/* Plan */}

                <Form.Group className="mb-3">
                  <Form.Label>Plan</Form.Label>

                  <Form.Select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                  >
                    <option value="basic">Basic</option>
                  </Form.Select>
                </Form.Group>

                {/* Billing Cycle */}

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

                {/* Status */}

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

                {/* Currency */}

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

                {/* Auto Renew */}

                <Form.Group className="mb-4">
                  <Form.Check
                    type="switch"
                    label="Auto Renew Subscription"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                  />
                </Form.Group>

                {/* Submit */}

                <div className="d-grid">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Creating...
                      </>
                    ) : (
                      "Create Subscription"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SubscriptionCreateScreen;
