import { useState, useEffect } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Form,
  Button,
  Row,
  Col,
} from "react-bootstrap";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import Loader from "../components/Loader";
import FormContainer from "../components/FormContainer";

import { useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";

import { toast } from "react-toastify";

const RegisterScreen = () => {
  const [name, setName] = useState("");

  const [phone, setPhone] =
    useState("");

  const [role, setRole] =
    useState("technician");

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [register, { isLoading }] =
    useRegisterMutation();

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const { search } = useLocation();

  const sp = new URLSearchParams(search);

  const redirect =
    sp.get("redirect") || "/home";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name) {
      return toast.error(
        "Name is required"
      );
    }

    if (!phone) {
      return toast.error(
        "Phone number is required"
      );
    }

    if (password !== confirmPassword) {
      return toast.error(
        "Passwords do not match"
      );
    }

    try {
      const res = await register({
        name,
        phone,
        password,
        role,
      }).unwrap();

      dispatch(setCredentials({ ...res }));

      navigate(redirect);
    } catch (err) {
      toast.error(
        err?.data?.message || err.error
      );
    }
  };

  return (
    <FormContainer>
      <h1 className="mb-4 text-center">
        Register
      </h1>

      <Form onSubmit={submitHandler}>
        {/* Name */}
        <Form.Group
          className="my-3"
          controlId="name"
        >
          <Form.Label>Name</Form.Label>

          <Form.Control
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />
        </Form.Group>

        {/* Phone */}
        <Form.Group
          className="my-3"
          controlId="phone"
        >
          <Form.Label>
            Phone Number
          </Form.Label>

          <Form.Control
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />
        </Form.Group>

        {/* Role */}
        <Form.Group
          className="my-3"
          controlId="role"
        >
          <Form.Label>Role</Form.Label>

          <Form.Select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >
            <option value="technician">
              Technician
            </option>

            <option value="dispatcher">
              Dispatcher
            </option>

            <option value="manager">
              Manager
            </option>

            <option value="admin">
              Admin
            </option>
          </Form.Select>
        </Form.Group>

        {/* Password */}
        <Form.Group
          className="my-3"
          controlId="password"
        >
          <Form.Label>Password</Form.Label>

          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </Form.Group>

        {/* Confirm Password */}
        <Form.Group
          className="my-3"
          controlId="confirmPassword"
        >
          <Form.Label>
            Confirm Password
          </Form.Label>

          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
          />
        </Form.Group>

        <Button
          disabled={isLoading}
          type="submit"
          variant="primary"
          className="w-100 mt-3"
        >
          Register
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
        <Col className="text-center">
          Already have an account?{" "}
          <Link
            to={
              redirect
                ? `/?redirect=${redirect}`
                : "/"
            }
          >
            Login
          </Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default RegisterScreen;