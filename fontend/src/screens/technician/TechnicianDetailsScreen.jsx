import React from "react";
import {
  Card,
  Row,
  Col,
  ListGroup,
  Badge,
  Button,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

import { useGetTechnicianDetailsQuery } from "../../slices/technicianApiSlice";

const TechnicianDetailsScreen = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  /**
   * =========================================================
   * FETCH TECHNICIAN
   * =========================================================
   */

  const {
    data: technician,
    isLoading,
    error,
  } = useGetTechnicianDetailsQuery(id);

  /**
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const editHandler = () => {
    navigate(`/technicians/${id}/edit`);
  };

  const backHandler = () => {
    navigate("/technicians");
  };

  /**
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <>
      <Row className="mb-4 align-items-center">
        <Col>
          <Button
            variant="light"
            onClick={backHandler}
          >
            ← Back
          </Button>
        </Col>

        <Col className="text-end">
          <Button
            variant="primary"
            onClick={editHandler}
          >
            Edit Technician
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message ||
            error?.error}
        </Message>
      ) : (
        <Row>
          {/* LEFT COLUMN */}

          <Col md={8}>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="mb-4">
                  Technician Information
                </Card.Title>

                <ListGroup variant="flush">
                  {/* NAME */}

                  <ListGroup.Item>
                    <strong>
                      Name:
                    </strong>{" "}
                    {technician.name}
                  </ListGroup.Item>

                  {/* PHONE */}

                  <ListGroup.Item>
                    <strong>
                      Phone:
                    </strong>{" "}
                    {technician.user?.phone}
                  </ListGroup.Item>

                  {/* EMAIL */}

                  <ListGroup.Item>
                    <strong>
                      Email:
                    </strong>{" "}
                    {technician.email ||
                      "-"}
                  </ListGroup.Item>

                  {/* AVAILABILITY */}

                  <ListGroup.Item>
                    <strong>
                      Availability:
                    </strong>{" "}
                    {technician.isAvailable ? (
                      <Badge bg="success">
                        Available
                      </Badge>
                    ) : (
                      <Badge bg="danger">
                        Unavailable
                      </Badge>
                    )}
                  </ListGroup.Item>

                  {/* CREATED */}

                  <ListGroup.Item>
                    <strong>
                      Created:
                    </strong>{" "}
                    {new Date(
                      technician.createdAt
                    ).toLocaleString()}
                  </ListGroup.Item>

                  {/* UPDATED */}

                  <ListGroup.Item>
                    <strong>
                      Last Updated:
                    </strong>{" "}
                    {new Date(
                      technician.updatedAt
                    ).toLocaleString()}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {/* SKILLS */}

            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="mb-4">
                  Skills
                </Card.Title>

                {technician.skills &&
                technician.skills.length >
                  0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {technician.skills.map(
                      (skill) => (
                        <Badge
                          key={skill}
                          bg="info"
                          className="p-2"
                        >
                          {skill}
                        </Badge>
                      )
                    )}
                  </div>
                ) : (
                  <p className="mb-0">
                    No skills assigned
                  </p>
                )}
              </Card.Body>
            </Card>

            {/* AREAS */}

            {/* AREAS */}

<Card className="shadow-sm">
  <Card.Body>
    <Card.Title className="mb-4">
      Service Areas
    </Card.Title>

    {technician.areas && technician.areas.length > 0 ? (
      <ListGroup variant="flush">
        {technician.areas.map((area) => (
          <ListGroup.Item key={area._id}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{area.name}</strong>

                {area.city && (
                  <div className="text-muted small">
                    {area.city.name}
                    {area.city.state && `, ${area.city.state}`}
                    {area.city.country && `, ${area.city.country}`}
                  </div>
                )}
              </div>

              <Badge bg="secondary">Area</Badge>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    ) : (
      <p className="mb-0">
        No service areas assigned
      </p>
    )}
  </Card.Body>
</Card>
          </Col>

          {/* RIGHT COLUMN */}

          <Col md={4}>
            {/* USER ACCOUNT */}

            <Card className="shadow-sm mb-4">
              <Card.Body>
                <Card.Title className="mb-4">
                  Linked User Account
                </Card.Title>

                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>
                      User Name:
                    </strong>{" "}
                    {
                      technician?.user
                        ?.name
                    }
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>
                      User Email:
                    </strong>{" "}
                    {
                      technician?.user
                        ?.email
                    }
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <strong>
                      Role:
                    </strong>{" "}
                    <Badge bg="dark">
                      {
                        technician?.user
                          ?.role
                      }
                    </Badge>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {/* LOCATION */}

            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="mb-4">
                  Current Location
                </Card.Title>

                {technician
                  ?.currentLocation
                  ?.lat &&
                technician
                  ?.currentLocation
                  ?.lng ? (
                  <>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>
                          Latitude:
                        </strong>{" "}
                        {
                          technician
                            .currentLocation
                            .lat
                        }
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>
                          Longitude:
                        </strong>{" "}
                        {
                          technician
                            .currentLocation
                            .lng
                        }
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>
                          Updated:
                        </strong>{" "}
                        {technician
                          ?.currentLocation
                          ?.updatedAt
                          ? new Date(
                              technician.currentLocation.updatedAt
                            ).toLocaleString()
                          : "-"}
                      </ListGroup.Item>
                    </ListGroup>
                  </>
                ) : (
                  <p className="mb-0">
                    No location available
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default TechnicianDetailsScreen;