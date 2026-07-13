import { Card, Row, Col, Button, ListGroup } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useParams } from "react-router-dom";

import { useGetAreaMasterDetailsQuery } from "../../slices/areaMasterApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

const AreaMasterDetailsScreen = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useGetAreaMasterDetailsQuery(id);

  const area = data?.data;

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h2>Area Master Details</h2>
        </Col>

        <Col xs="auto">
          <LinkContainer to="/admin/area-master">
            <Button variant="secondary">Back to List</Button>
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
            <h4>{area?.name}</h4>
          </Card.Header>

          <Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Area Name:</strong> {area?.name}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>City:</strong> {area?.city?.name}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>State:</strong> {area?.city?.state}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Country:</strong> {area?.city?.country}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Status:</strong>{" "}
                {area?.isActive ? (
                  <span className="text-success fw-bold">Active</span>
                ) : (
                  <span className="text-danger fw-bold">Inactive</span>
                )}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Created:</strong>{" "}
                {new Date(area?.createdAt).toLocaleString()}
              </ListGroup.Item>

              <ListGroup.Item>
                <strong>Last Updated:</strong>{" "}
                {new Date(area?.updatedAt).toLocaleString()}
              </ListGroup.Item>
            </ListGroup>
          </Card.Body>

          <Card.Footer className="text-end">
            <LinkContainer to={`/admin/area-master/${area?._id}/edit`}>
              <Button variant="primary">Edit Area Master</Button>
            </LinkContainer>
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default AreaMasterDetailsScreen;
