import { useState } from "react";
import { Form, Button, Row, Col, Card, Alert } from "react-bootstrap";

import { toast } from "react-toastify";

import { useCreateUserMutation } from "../../slices/usersApiSlice";

const CreateUserScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("technician");

  const [createdUser, setCreatedUser] = useState(null);

  const [createUser, { isLoading }] = useCreateUserMutation();

  const roleOptions = ["manager", "dispatcher", "technician"];

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name || !phone || !role) {
      toast.error("Name, phone and role are required");
      return;
    }

    try {
      const res = await createUser({
        name,
        email,
        phone,
        role,
      }).unwrap();

      setCreatedUser(res);

      toast.success(res.message || "User created successfully");

      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setRole("technician");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  return (
    <Row className="justify-content-center">
      {" "}
      <Col md={8}>
        {" "}
        <Card className="shadow-sm p-4">
          {" "}
          <h3 className="mb-4">Create User </h3>
          {createdUser && (
            <Alert variant="success">
              <strong>User Created Successfully</strong>

              <hr />

              <p className="mb-1">
                <strong>Name:</strong> {createdUser.user.name}
              </p>

              <p className="mb-1">
                <strong>Phone:</strong> {createdUser.credentials.phone}
              </p>

              <p className="mb-0">
                <strong>Temporary Password:</strong>{" "}
                {createdUser.credentials.temporaryPassword}
              </p>
            </Alert>
          )}
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full Name</Form.Label>

              <Form.Control
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>

              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Phone Number</Form.Label>

              <Form.Control
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="role">
              <Form.Label>Role</Form.Label>

              <Form.Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create User"}
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default CreateUserScreen;
