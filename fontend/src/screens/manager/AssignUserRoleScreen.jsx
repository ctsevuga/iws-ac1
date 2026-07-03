import { useState } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";

import { toast } from "react-toastify";

import {
  useGetUsersQuery,
  useAssignUserRoleMutation,
} from "../../slices/usersApiSlice";

const AssignUserRoleScreen = () => {
  const { data: users = [], refetch } =
    useGetUsersQuery();

  const [assignUserRole, { isLoading }] =
    useAssignUserRoleMutation();

  const [selectedRoles, setSelectedRoles] =
    useState({});

  const roleOptions = [
    "manager",
    "dispatcher",
    "technician",
    "customer",
  ];

  // Handle role change per user
  const handleRoleChange = (
    userId,
    role
  ) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  // Assign role handler
  const handleAssign = async (userId) => {
    const role = selectedRoles[userId];

    if (!role) {
      toast.error(
        "Please select a role first"
      );
      return;
    }

    try {
      await assignUserRole({
        userId,
        role,
      }).unwrap();

      toast.success("Role assigned successfully");

      // optional refresh
      refetch();
    } catch (error) {
      toast.error(
        error?.data?.message ||
          "Failed to assign role"
      );
    }
  };

  return (
    <Row className="justify-content-center">
      <Col md={10}>
        <Card className="p-3 shadow-sm">
          <h3 className="mb-4">
            Assign User Roles
          </h3>

          <Table
            striped
            hover
            responsive
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Current Role</th>
                <th>Assign Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>
                    {user.role === "unassigned"
                      ? "Not Assigned"
                      : user.role}
                  </td>

                  {/* ROLE SELECT */}
                  <td>
                    <Form.Select
                      value={
                        selectedRoles[user._id] ||
                        ""
                      }
                      onChange={(e) =>
                        handleRoleChange(
                          user._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="">
                        Select Role
                      </option>

                      {roleOptions.map(
                        (role) => (
                          <option
                            key={role}
                            value={role}
                          >
                            {role
                              .charAt(0)
                              .toUpperCase() +
                              role.slice(1)}
                          </option>
                        )
                      )}
                    </Form.Select>
                  </td>

                  {/* ACTION BUTTON */}
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={isLoading}
                      onClick={() =>
                        handleAssign(
                          user._id
                        )
                      }
                    >
                      Assign
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </Col>
    </Row>
  );
};

export default AssignUserRoleScreen;