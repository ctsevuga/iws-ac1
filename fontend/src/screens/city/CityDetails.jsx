import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";

import { useGetCityDetailsQuery } from "../../slices/cityApiSlice";

const CityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ---------------------------------------------------------------------- */
  /*                              FETCH CITY                                */
  /* ---------------------------------------------------------------------- */

  const {
    data: cityResponse,
    isLoading,
    isError,
  } = useGetCityDetailsQuery(id);

  const city = cityResponse?.data;

  /* ---------------------------------------------------------------------- */
  /*                              LOADING                                   */
  /* ---------------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /*                              ERROR                                     */
  /* ---------------------------------------------------------------------- */

  if (isError || !city) {
    return (
      <Alert variant="danger">
        City not found or failed to load.
      </Alert>
    );
  }

  /* ---------------------------------------------------------------------- */

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {/* HEADER */}
        <Row className="mb-3 align-items-center">
          <Col>
            <h4 className="mb-0">{city.name}</h4>
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
                navigate(`/cities/${city._id}/edit`)
              }
            >
              Edit
            </Button>
          </Col>
        </Row>

        <hr />

        {/* DETAILS */}
        <Row className="mb-3">
          <Col md={6}>
            <h6>State</h6>
            <p>{city.state || "-"}</p>
          </Col>

          <Col md={6}>
            <h6>Country</h6>
            <p>{city.country || "India"}</p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <h6>Created At</h6>
            <p>
              {city.createdAt
                ? new Date(city.createdAt).toLocaleString()
                : "-"}
            </p>
          </Col>

          <Col md={6}>
            <h6>Updated At</h6>
            <p>
              {city.updatedAt
                ? new Date(city.updatedAt).toLocaleString()
                : "-"}
            </p>
          </Col>
        </Row>

        {/* STATUS BADGE */}
        <div className="mt-3">
          <Badge bg="primary">Active City</Badge>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CityDetails;