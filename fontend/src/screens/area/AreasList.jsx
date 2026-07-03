import { useState } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
  Spinner,
  Pagination,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useGetAreasQuery } from "../../slices/areaApiSlice";

const AreasList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetAreasQuery({
    search,
    page,
    limit: 20,
  });

  const areas = data?.areas || [];
  const totalPages = data?.pages || 1;

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>

        {/* =========================
                HEADER
        ========================= */}
        <Row className="align-items-center mb-3">
          <Col>
            <h4 className="mb-0">Service Areas</h4>
          </Col>

          <Col md={4}>
            <Form.Control
              type="text"
              placeholder="Search by area or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Col>

          <Col md="auto">
            <Button
              variant="primary"
              onClick={() => navigate("/areas/create")}
            >
              + Create Area
            </Button>
          </Col>
        </Row>

        {/* =========================
                LOADING
        ========================= */}
        {isLoading && (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        )}

        {/* =========================
                ERROR
        ========================= */}
        {isError && (
          <div className="text-danger">
            Failed to load areas
          </div>
        )}

        {/* =========================
                TABLE
        ========================= */}
        {!isLoading && areas.length > 0 && (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Area Name</th>
                <th>City</th>
                <th>State</th>
                <th>Country</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {areas.map((area) => (
                <tr key={area._id}>
                  <td>{area.name}</td>

                  <td>{area.city?.name || "-"}</td>

                  {/* ✅ FIX: state now comes from city */}
                  <td>{area.city?.state || "-"}</td>

                  <td>{area.city?.country || "-"}</td>

                  <td>
                    {area.createdAt
                      ? new Date(area.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="info"
                      className="me-2"
                      onClick={() => navigate(`/areas/${area._id}`)}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() =>
                        navigate(`/areas/${area._id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* =========================
                EMPTY STATE
        ========================= */}
        {!isLoading && areas.length === 0 && (
          <div className="text-center py-4 text-muted">
            No areas found
          </div>
        )}

        {/* =========================
                PAGINATION
        ========================= */}
        {totalPages > 1 && (
          <Pagination className="justify-content-center mt-3">
            <Pagination.Prev
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
            />

            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={page === idx + 1}
                onClick={() => changePage(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
            />
          </Pagination>
        )}

      </Card.Body>
    </Card>
  );
};

export default AreasList;