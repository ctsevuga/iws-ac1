import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Spinner,
  Badge,
  Row,
  Col,
  Form,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import {
  useGetServiceRequestDetailsQuery,
  useAssignTechnicianMutation,
} from "../../slices/serviceRequestApiSlice";

import { useGetTechniciansQuery } from "../../slices/technicianApiSlice";
import { useGetAreasQuery } from "../../slices/areaApiSlice";

const AssignTechnician = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const canAssign =
    userInfo?.role === "manager" ||
    userInfo?.role === "dispatcher";

  const {
    data: request,
    isLoading,
    error,
    refetch,
  } = useGetServiceRequestDetailsQuery(id);

  const {
    data: technicianData,
    isLoading: techniciansLoading,
    error: techniciansError,
  } = useGetTechniciansQuery();

  const technicians =
    technicianData?.technicians || [];

  const {
    data: areaData,
    isLoading: areasLoading,
    error: areasError,
  } = useGetAreasQuery();

  const areas = areaData?.areas || areaData || [];

  const [
    assignTechnician,
    { isLoading: assigning },
  ] = useAssignTechnicianMutation();

  const [selectedArea, setSelectedArea] =
    useState("");

  const [technicianId, setTechnicianId] =
    useState("");

  useEffect(() => {
    if (
      request?.area?._id &&
      !selectedArea
    ) {
      setSelectedArea(
        request.area._id
      );
    }
  }, [request, selectedArea]);

  const filteredTechnicians =
  selectedArea
    ? technicians.filter(
        (technician) =>
          technician.areas?.some(
            (area) =>
              area._id === selectedArea
          )
      )
    : technicians;

  const getStatusVariant = (status) => {
    switch (status) {
      case "new":
        return "info";
      case "assigned":
        return "primary";
      case "in_progress":
        return "warning";
      case "completed":
        return "success";
      case "closed":
        return "dark";
      default:
        return "secondary";
    }
  };

  if (!canAssign) {
    return (
      <Alert variant="danger">
        Access denied. Only Manager or Dispatcher can assign technicians.
      </Alert>
    );
  }

  if (
    isLoading ||
    techniciansLoading ||
    areasLoading
  ) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error?.data?.message ||
          "Failed to load service request"}
      </Alert>
    );
  }

  if (techniciansError) {
    return (
      <Alert variant="danger">
        {techniciansError?.data?.message ||
          "Failed to load technicians"}
      </Alert>
    );
  }

  if (areasError) {
    return (
      <Alert variant="danger">
        {areasError?.data?.message ||
          "Failed to load areas"}
      </Alert>
    );
  }

  if (!request) {
    return (
      <Alert variant="warning">
        Service request not found
      </Alert>
    );
  }

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!technicianId) {
      toast.error(
        "Please select a technician"
      );
      return;
    }

    try {
      await assignTechnician({
        id,
        technicianId,
      }).unwrap();

      toast.success(
        "Technician assigned successfully"
      );

      refetch();

      navigate(
        `/service-requests/${id}`
      );
    } catch (err) {
      toast.error(
        err?.data?.message ||
          "Failed to assign technician"
      );
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">
            Assign Technician
          </h4>

          <Badge
            bg={getStatusVariant(
              request.status
            )}
          >
            {request.status}
          </Badge>
        </div>

        <Row className="mb-4">
          <Col md={6}>
            <p className="mb-1">
              <strong>Customer:</strong>{" "}
              {request.customer?.name ||
                request
                  .customerSnapshot
                  ?.name ||
                "-"}
            </p>

            <p className="mb-1">
              <strong>Phone:</strong>{" "}
              {request.customer?.phone ||
                request
                  .customerSnapshot
                  ?.phone ||
                "-"}
            </p>

            <p className="mb-1">
              <strong>Issue:</strong>{" "}
              {request.issueType}
            </p>
          </Col>

          <Col md={6}>
            <p className="mb-1">
              <strong>Priority:</strong>{" "}
              {request.priority || "-"}
            </p>

            <p className="mb-1">
              <strong>Area:</strong>{" "}
              {request.area?.name || "-"}
            </p>

            <p className="mb-1">
              <strong>
                Current Technician:
              </strong>{" "}
              {request
                .assignedTechnician
                ?.name ||
                "Unassigned"}
            </p>
          </Col>
        </Row>

        <Form onSubmit={submitHandler}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label>
                  Select Area
                </Form.Label>

                <Form.Select
                  value={selectedArea}
                  onChange={(e) => {
                    setSelectedArea(
                      e.target.value
                    );
                    setTechnicianId(
                      ""
                    );
                  }}
                >
                  <option value="">
                    All Areas
                  </option>

                  {areas.map((area) => (
                    <option
                      key={area._id}
                      value={area._id}
                    >
                      {area.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label>
                  Select Technician
                </Form.Label>

                <Form.Select
                  value={technicianId}
                  onChange={(e) =>
                    setTechnicianId(
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    -- Select Technician --
                  </option>

                  {filteredTechnicians.map(
                    (
                      technician
                    ) => (
                      <option
                        key={
                          technician._id
                        }
                        value={
                          technician._id
                        }
                      >
                        {
                          technician.name
                        }
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Alert variant="info">
            Assigning a technician
            will update the request
            status to{" "}
            <strong>
              assigned
            </strong>
            .
          </Alert>

          <div className="d-flex justify-content-end gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                navigate(-1)
              }
            >
              Back
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={
                assigning ||
                !technicianId
              }
            >
              {assigning ? (
                <>
                  <Spinner
                    size="sm"
                    className="me-2"
                  />
                  Assigning...
                </>
              ) : (
                "Assign Technician"
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AssignTechnician;