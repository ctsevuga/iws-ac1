import { useState } from "react";
import { Table, Button, Card, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import {
  useGetItemsQuery,
  useDeleteItemMutation,
} from "../../slices/itemApiSlice";

const ItemList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch } = useGetItemsQuery({
    search,
    page,
    limit: 20,
  });

  const [deleteItem, { isLoading: deleting }] = useDeleteItemMutation();

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteItem(id).unwrap();
        refetch();
      } catch (err) {
        alert(err?.data?.message || "Failed to delete item");
      }
    }
  };

  return (
    <Card className="p-3 shadow-sm">
      <Row className="align-items-center mb-3">
        <Col>
          <h4>Items</h4>
        </Col>

        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </Col>

        <Col md="auto">
          <Button onClick={() => navigate("/items/create")}>
            + Create Item
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
          {error?.data?.message || "Failed to load items"}
        </Alert>
      )}

      {/* Table */}
      {data?.items?.length > 0 && (
        <Table striped hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Tax %</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.sku || "-"}</td>
                <td>
                  {item.currency} {item.price}
                </td>
                <td>{item.taxRate}%</td>
                <td>{item.category}</td>
                <td>{item.unit}</td>
                <td>
                  {item.isActive ? (
                    <span className="text-success">Active</span>
                  ) : (
                    <span className="text-danger">Inactive</span>
                  )}
                </td>

                <td>
                  <div className="d-flex gap-2">
                    {/* View */}
                    <Button
                      size="sm"
                      variant="info"
                      onClick={() => navigate(`/items/${item._id}`)}
                    >
                      View
                    </Button>

                    {/* Edit */}
                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => navigate(`/items/${item._id}/edit`)}
                    >
                      Edit
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={deleting}
                      onClick={() => deleteHandler(item._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Empty state */}
      {data?.items?.length === 0 && !isLoading && (
        <Alert variant="secondary">No items found</Alert>
      )}

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <Button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Previous
          </Button>

          <span>
            Page {data.page} of {data.pages}
          </span>

          <Button
            disabled={page >= data.pages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ItemList;