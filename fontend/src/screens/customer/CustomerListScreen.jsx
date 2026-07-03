import React, { useState } from "react";

import {
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Badge,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";

import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetCustomersQuery,
  useDeleteCustomerMutation,
  useReactivateCustomerMutation,
} from "../../slices/customerApiSlice";

const CustomerListScreen = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isActive, setIsActive] = useState("");

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useGetCustomersQuery({
    search,
    page,
    limit: 20,
    isActive: isActive === "" ? undefined : isActive,
  });

  const [deleteCustomer, { isLoading: loadingDelete }] =
    useDeleteCustomerMutation();

  const [reactivateCustomer, { isLoading: loadingReactivate }] =
    useReactivateCustomerMutation();

  const deleteHandler = async (id) => {
    if (!window.confirm("Deactivate this customer?")) return;

    try {
      await deleteCustomer(id).unwrap();
      toast.success("Customer deactivated");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Delete failed");
    }
  };

  const reactivateHandler = async (id) => {
    if (!window.confirm("Reactivate this customer?")) return;

    try {
      await reactivateCustomer(id).unwrap();
      toast.success("Customer reactivated");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Reactivate failed");
    }
  };

  const totalPages = data?.pages || 1;

  return (
    <Row className="justify-content-center my-4">
      <Col md={12}>
        <Card className="shadow-sm border-0">
          <Card.Body>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1">Customers</h2>
                <p className="text-muted mb-0">
                  Manage company customers
                </p>
              </div>

              <Button
                as={Link}
                to="/customers/create"
                variant="primary"
              >
                Create Customer
              </Button>
            </div>

            {/* Filters */}
            <Row className="mb-3">
              <Col md={5}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search name, phone, email"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </InputGroup>
              </Col>

              <Col md={3}>
                <Form.Select
                  value={isActive}
                  onChange={(e) => {
                    setIsActive(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Loading */}
            {isLoading || loadingDelete || loadingReactivate ? (
              <div className="text-center my-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger">
                {error?.data?.message ||
                  error?.error ||
                  "Failed to load customers"}
              </Alert>
            ) : (
              <>
                {/* Table */}
                <Table
                  responsive
                  hover
                  bordered
                  className="align-middle"
                >
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Area</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data?.customers?.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-4"
                        >
                          No customers found
                        </td>
                      </tr>
                    ) : (
                      data.customers.map((customer) => (
                        <tr key={customer._id}>
                          <td>
                            <strong>
                              {customer.name}
                            </strong>
                          </td>

                          <td>{customer.phone}</td>

                          <td>{customer.email || "-"}</td>

                          <td>
                            {customer.area?.name || "-"}
                          </td>

                          <td>
                            {customer.isActive ? (
                              <Badge bg="success">
                                Active
                              </Badge>
                            ) : (
                              <Badge bg="secondary">
                                Inactive
                              </Badge>
                            )}
                          </td>

                          <td>
                            {new Date(
                              customer.createdAt
                            ).toLocaleDateString()}
                          </td>

                          <td>
                            <div className="d-flex justify-content-center gap-2">

                              {/* View */}
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() =>
                                  navigate(
                                    `/customers/${customer._id}`
                                  )
                                }
                              >
                                View
                              </Button>

                              {/* Edit */}
                              <Button
                                size="sm"
                                variant="outline-warning"
                                onClick={() =>
                                  navigate(
                                    `/customers/${customer._id}/edit`
                                  )
                                }
                              >
                                Edit
                              </Button>

                              {/* Delete */}
                              {customer.isActive && (
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() =>
                                    deleteHandler(customer._id)
                                  }
                                >
                                  Delete
                                </Button>
                              )}

                              {/* Reactivate */}
                              {!customer.isActive && (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() =>
                                    reactivateHandler(customer._id)
                                  }
                                >
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    Total: {data?.total || 0}
                  </small>

                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={page === 1}
                      onClick={() =>
                        setPage((p) => p - 1)
                      }
                    />

                    <Pagination.Item active>
                      {page}
                    </Pagination.Item>

                    <Pagination.Next
                      disabled={page === totalPages}
                      onClick={() =>
                        setPage((p) => p + 1)
                      }
                    />
                  </Pagination>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default CustomerListScreen;