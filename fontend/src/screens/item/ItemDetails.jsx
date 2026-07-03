import { Card, Row, Col, Badge, Spinner, Alert, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useGetItemDetailsQuery } from "../../slices/itemApiSlice";

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: item, isLoading, error } = useGetItemDetailsQuery(id);

  return (
    <Card className="p-4 shadow-sm">
      {/* Header */}
      <Row className="mb-3 align-items-center">
        <Col>
          <h4>Item Details</h4>
        </Col>

        <Col md="auto">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Col>
      </Row>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger">
          {error?.data?.message || "Failed to load item"}
        </Alert>
      )}

      {/* Content */}
      {item && (
        <>
          <Row className="mb-3">
            <Col md={6}>
              <strong>Name:</strong> {item.name}
            </Col>

            <Col md={6}>
              <strong>SKU:</strong> {item.sku || "-"}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>Price:</strong>{" "}
              {item.currency} {item.price}
            </Col>

            <Col md={6}>
              <strong>Tax Rate:</strong> {item.taxRate}%
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>Unit:</strong> {item.unit}
            </Col>

            <Col md={6}>
              <strong>Category:</strong> {item.category}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>Taxable:</strong>{" "}
              {item.isTaxable ? (
                <Badge bg="success">Yes</Badge>
              ) : (
                <Badge bg="secondary">No</Badge>
              )}
            </Col>

            <Col md={6}>
              <strong>Status:</strong>{" "}
              {item.isActive ? (
                <Badge bg="success">Active</Badge>
              ) : (
                <Badge bg="danger">Inactive</Badge>
              )}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <strong>Description:</strong>
              <div className="mt-1">
                {item.description || "No description provided"}
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <strong>Created At:</strong>{" "}
              {new Date(item.createdAt).toLocaleString()}
            </Col>
          </Row>

          {/* Actions */}
          <div className="d-flex gap-2 mt-3">
            <Button
              variant="warning"
              onClick={() => navigate(`/items/${item._id}/edit`)}
            >
              Edit Item
            </Button>

            <Button variant="secondary" onClick={() => navigate("/items")}>
              Back to List
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default ItemDetails;