import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
  Spinner,
  Pagination,
  Badge,
} from "react-bootstrap";

import {
  useGetCitiesQuery,
  useDeleteCityMutation,
} from "../../slices/cityApiSlice";

const CitiesList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* ---------------------------------------------------------------------- */
  /*                              DATA FETCH                                */
  /* ---------------------------------------------------------------------- */

  const { data, isLoading, isError } = useGetCitiesQuery({
    search,
    page,
    limit: 20,
  });

  const [deleteCity, { isLoading: deleting }] =
    useDeleteCityMutation();

  const cities = data?.data || [];
  const totalPages = data?.pages || 1;

  /* ---------------------------------------------------------------------- */
  /*                              DELETE HANDLER                            */
  /* ---------------------------------------------------------------------- */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this city?"
    );

    if (!confirmDelete) return;

    try {
      await deleteCity(id).unwrap();
    } catch (err) {
      alert(err?.data?.message || "Failed to delete city");
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                              PAGINATION                                */
  /* ---------------------------------------------------------------------- */

  const changePage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  /* ---------------------------------------------------------------------- */

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {/* HEADER */}
        <Row className="align-items-center mb-3">
          <Col>
            <h4 className="mb-0">Cities</h4>
          </Col>

          <Col md={4}>
            <Form.Control
              placeholder="Search city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Col>

          <Col md="auto">
            <Button
              onClick={() => navigate("/cities/create")}
            >
              + Create City
            </Button>
          </Col>
        </Row>

        {/* LOADING */}
        {isLoading && (
          <div className="text-center py-4">
            <Spinner animation="border" />
          </div>
        )}

        {/* ERROR */}
        {isError && (
          <div className="text-danger">
            Failed to load cities
          </div>
        )}

        {/* TABLE */}
        {!isLoading && cities.length > 0 && (
          <Table responsive hover>
            <thead>
              <tr>
                <th>City</th>
                <th>State</th>
                <th>Country</th>
                <th>Created</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {cities.map((city) => (
                <tr key={city._id}>
                  <td>
                    <strong>{city.name}</strong>
                  </td>

                  <td>
                    {city.state ? (
                      <Badge bg="secondary">
                        {city.state}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>{city.country || "India"}</td>

                  <td>
                    {new Date(
                      city.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="text-end">
                    {/* VIEW */}
                    <Button
                      size="sm"
                      variant="info"
                      className="me-2"
                      onClick={() =>
                        navigate(`/cities/${city._id}`)
                      }
                    >
                      View
                    </Button>

                    {/* EDIT */}
                    <Button
                      size="sm"
                      variant="warning"
                      className="me-2"
                      onClick={() =>
                        navigate(
                          `/cities/${city._id}/edit`
                        )
                      }
                    >
                      Edit
                    </Button>

                    {/* DELETE */}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        handleDelete(city._id)
                      }
                      disabled={deleting}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* EMPTY STATE */}
        {!isLoading && cities.length === 0 && (
          <div className="text-center py-4 text-muted">
            No cities found
          </div>
        )}

        {/* PAGINATION */}
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

export default CitiesList;