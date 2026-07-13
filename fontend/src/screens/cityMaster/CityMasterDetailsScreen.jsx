
import { Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useParams } from "react-router-dom";

import { useGetCityMasterDetailsQuery } from "../../slices/cityMasterApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

const CityMasterDetailsScreen = () => {
  const { id } = useParams();

  const {
    data,
    isLoading,
    error,
  } = useGetCityMasterDetailsQuery(id);

  const city = data?.data;

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h2>City Master Details</h2>
        </Col>

        <Col xs="auto">
          <LinkContainer to="/admin/city-master">
            <Button variant="secondary">
              Back to List
            </Button>
          </LinkContainer>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Card>
          <Card.Header>
            <h4>{city?.name}</h4>
          </Card.Header>

          <Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>City Name:</strong>{" "}
                {city?.name}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>State:</strong>{" "}
                {city?.state}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Country:</strong>{" "}
                {city?.country}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Status:</strong>{" "}
                {city?.isActive ? (
                  <span className="text-success fw-bold">
                    Active
                  </span>
                ) : (
                  <span className="text-danger fw-bold">
                    Inactive
                  </span>
                )}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Created At:</strong>{" "}
                {city?.createdAt &&
                  new Date(city.createdAt).toLocaleString()}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Updated At:</strong>{" "}
                {city?.updatedAt &&
                  new Date(city.updatedAt).toLocaleString()}
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>

          <Card.Footer className="text-end">
            <LinkContainer
              to={`/admin/city-master/${city?._id}/edit`}
            >
              <Button variant="primary">
                Edit City Master
              </Button>
            </LinkContainer>
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default CityMasterDetailsScreen;

