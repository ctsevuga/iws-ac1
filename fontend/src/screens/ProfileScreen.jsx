import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import Loader from "../components/Loader";
import { useUpdateProfileMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";

const ProfileScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // ✅ NEW
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useUpdateProfileMutation(); // ✅ renamed hook

  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || "");
      setEmail(userInfo.email || "");
      setPhone(userInfo.phone || ""); // ✅ NEW
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      const res = await updateProfile({
        name,
        email,
        phone,
        password: password || undefined, // only send if changed
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      toast.success("Profile updated successfully");

      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Row>
      <Col md={4}>
        <h2>User Profile</h2>

        <Form onSubmit={submitHandler}>
          {/* Name */}
          <Form.Group className="my-2" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          {/* Email */}
          <Form.Group className="my-2" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          {/* Phone */}
          <Form.Group className="my-2" controlId="phone">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>

          {/* Role (Read-only) */}
          <Form.Group className="my-2" controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Control
              type="text"
              value={userInfo?.role || ""}
              disabled
            />
          </Form.Group>

          {/* Company (Read-only) */}
          <Form.Group className="my-2" controlId="company">
            <Form.Label>Company</Form.Label>
            <Form.Control
              type="text"
              value={userInfo?.company || ""}
              disabled
            />
          </Form.Group>

          {/* Password */}
          <Form.Group className="my-2" controlId="password">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password (optional)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {/* Confirm Password */}
          <Form.Group className="my-2" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" variant="primary">
            Update
          </Button>

          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>
    </Row>
  );
};

export default ProfileScreen;