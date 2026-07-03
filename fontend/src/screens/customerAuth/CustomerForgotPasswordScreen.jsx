import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
} from "react-bootstrap";

import { FaKey } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useForgotCustomerPasswordMutation } from "../../slices/customerAuthApiSlice";

// =====================================
// Phone Validator (India)
// =====================================
const validateIndianPhone = (phone) => {
  let normalized = phone
    .trim()
    .replace(/\s+/g, "")
    .replace(/-/g, "");

  let warning = "";

  // Remove +91
  if (normalized.startsWith("+91")) {
    normalized = normalized.slice(3);
  }

  // Remove 91 prefix
  else if (normalized.startsWith("91") && normalized.length === 12) {
    normalized = normalized.slice(2);
  }

  // Leading zero warning
  if (/^0+/.test(normalized)) {
    warning = "Leading zero removed from phone number";
    normalized = normalized.replace(/^0+/, "");
  }

  const isValid = /^[6-9]\d{9}$/.test(normalized);

  return { normalized, isValid, warning };
};

// =====================================
// Component
// =====================================
const CustomerForgotPasswordScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [forgotPassword, { isLoading }] =
    useForgotCustomerPasswordMutation();

  // =====================================
  // SUBMIT
  // =====================================
  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const { normalized, isValid, warning } =
      validateIndianPhone(phone);

    if (warning) {
      toast.warning(warning);
    }

    if (!isValid) {
      return toast.error("Enter a valid Indian mobile number");
    }

    try {
      await forgotPassword({
        slug,
        data: {
          phone: normalized,
          password,
        },
      }).unwrap();

      toast.success("Password updated successfully");

      navigate(`/${slug}`);
    } catch (err) {
      toast.error(
        err?.data?.message || "Failed to reset password"
      );
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow border-0">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">
                <FaKey className="me-2" />
                Forgot Password
              </h3>

              <Form onSubmit={submitHandler}>
                {/* PHONE */}
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter registered mobile number"
                    required
                  />
                </Form.Group>

                {/* NEW PASSWORD */}
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter new password"
                    required
                  />
                </Form.Group>

                {/* CONFIRM PASSWORD */}
                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Confirm new password"
                    required
                  />
                </Form.Group>

                {/* SUBMIT */}
                <div className="d-grid">
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          size="sm"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </div>

                {/* BACK */}
                <div className="text-center mt-3">
                  <Button
                    variant="link"
                    onClick={() => navigate(`/${slug}`)}
                  >
                    Back to Login
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

export default CustomerForgotPasswordScreen;