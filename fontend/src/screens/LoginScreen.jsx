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

import ServiceFinder from "../screens/companyServiceArea/ServiceFinder";

import Loader from "../components/Loader";
import FormContainer from "../components/FormContainer";

import { useLoginMutation } from "../slices/usersApiSlice";

import { setCredentials } from "../slices/authSlice";

import { toast } from "react-toastify";

const LoginScreen = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] =
    useState("");

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [login, { isLoading }] =
    useLoginMutation();

  const { userInfo } = useSelector(
    (state) => state.auth
  );

  const { search } = useLocation();

  const sp = new URLSearchParams(search);

  const redirect =
    sp.get("redirect") || "/home";

  useEffect(() => {
    if (userInfo) {
      // 👇 force password change
      if (userInfo.mustChangePassword) {
        navigate("/change-password");
      } else {
        navigate(redirect);
      }
    }
  }, [
    navigate,
    redirect,
    userInfo,
  ]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      toast.error(
        "Phone and password are required"
      );

      return;
    }

    try {
      const res = await login({
        phone,
        password,
      }).unwrap();

      // Save auth state
      dispatch(setCredentials({ ...res }));

      // 👇 Check password change requirement
      if (res.mustChangePassword) {
        toast.info(
          "Please change your default password"
        );

        navigate("/change-password");
      } else {
        navigate("/home");
      }

    } catch (err) {
      toast.error(
        err?.data?.message || err.error
      );
    }
  };

  return (
    <>
    <FormContainer>
      <h1 className="mb-4 text-center">
        Sign In
      </h1>

      <Form onSubmit={submitHandler}>
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

        <Button
          disabled={isLoading}
          type="submit"
          variant="primary"
          className="w-100 mt-3"
        >
          Sign In
        </Button>

        {isLoading && <Loader />}
      </Form>

      <Row className="py-3">
  <Col className="text-center">
    <Link to="/forgot-password">
      Forgot Password
    </Link>
  </Col>
</Row>
    </FormContainer>
    <ServiceFinder />
    </>
  );
};

export default LoginScreen;