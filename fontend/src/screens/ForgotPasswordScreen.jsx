import { useState } from "react";

import {
  Form,
  Button,
  Card,
} from "react-bootstrap";

import {
  useNavigate,
} from "react-router-dom";

import {
  toast,
} from "react-toastify";

import Loader from "../components/Loader";
import FormContainer from "../components/FormContainer";

import {
  useForgotPasswordMutation,
} from "../slices/usersApiSlice";

const ForgotPasswordScreen = () => {
  const [phone, setPhone] =
    useState("");

  const [newPassword,
    setNewPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const navigate = useNavigate();

  const [
    forgotPassword,
    { isLoading },
  ] = useForgotPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (
      !phone ||
      !newPassword ||
      !confirmPassword
    ) {
      toast.error(
        "All fields are required"
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      await forgotPassword({
        phone,
        newPassword,
      }).unwrap();

      toast.success(
        "Password reset successfully. Please sign in."
      );

      navigate("/");
    } catch (err) {
      toast.error(
        err?.data?.message ||
        err.error
      );
    }
  };

  return (
    <FormContainer>
      <Card className="shadow-sm p-4">
        <h2 className="text-center mb-4">
          Forgot Password
        </h2>

        <Form onSubmit={submitHandler}>

          <Form.Group
            className="mb-3"
            controlId="phone"
          >
            <Form.Label>
              Phone Number
            </Form.Label>

            <Form.Control
              type="text"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
            />
          </Form.Group>

          <Form.Group
            className="mb-3"
            controlId="newPassword"
          >
            <Form.Label>
              New Password
            </Form.Label>

            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
            />
          </Form.Group>

          <Form.Group
            className="mb-4"
            controlId="confirmPassword"
          >
            <Form.Label>
              Confirm Password
            </Form.Label>

            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={isLoading}
          >
            Reset Password
          </Button>

          {isLoading && <Loader />}
        </Form>
      </Card>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;