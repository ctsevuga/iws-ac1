import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";

import {
  useGetAreaDetailsQuery,
} from "../../slices/areaApiSlice";

const AreaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // AREA DETAILS (POPULATED CITY)
  // =========================
  const {
    data: area,
    isLoading,
    isError,
  } = useGetAreaDetailsQuery(id);

  // =========================
  // LOADING
  // =========================
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (isError || !area) {
    return (
      <Alert variant="danger">
        Area not found or failed to load.
      </Alert>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>

        {/* =========================
                HEADER
        ========================= */}
        <Row className="mb-3 align-items-center">
          <Col>
            <h4 className="mb-0">{area.name}</h4>

            {/* CITY BADGE (NEW STRUCTURE) */}
            {area.city && (
              <Badge bg="primary" className="mt-2">
                {area.city.name}
              </Badge>
            )}
          </Col>

          <Col md="auto">
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>

            <Button
              variant="warning"
              onClick={() =>
                navigate(`/areas/${area._id}/edit`)
              }
            >
              Edit
            </Button>
          </Col>
        </Row>

        <hr />

        {/* =========================
                DETAILS
        ========================= */}
        <Row className="mb-3">
          <Col md={6}>
            <h6>City</h6>
            <p>{area.city?.name || "-"}</p>
          </Col>

          <Col md={6}>
            <h6>State</h6>
            <p>{area.city?.state || "-"}</p>
          </Col>

          <Col md={6}>
            <h6>Country</h6>
            <p>{area.city?.country || "-"}</p>
          </Col>

          <Col md={6}>
            <h6>Created At</h6>
            <p>
              {area.createdAt
                ? new Date(area.createdAt).toLocaleString()
                : "-"}
            </p>
          </Col>
        </Row>

      </Card.Body>
    </Card>
  );
};

export default AreaDetails;