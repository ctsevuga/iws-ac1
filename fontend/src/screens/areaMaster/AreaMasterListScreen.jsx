import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { FaEye, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import {
  useGetAreaMastersQuery,
  useDeleteAreaMasterMutation,
} from "../../slices/areaMasterApiSlice";

import { useGetCityMasterOptionsQuery } from "../../slices/cityMasterApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import Paginate from "../../components/Paginate";

const AreaMasterListScreen = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");

  const { data, isLoading, error, refetch, isFetching } =
    useGetAreaMastersQuery({
  page: pageNumber,
  limit: 20,
  search,
  city,
});

  const [deleteAreaMaster, { isLoading: loadingDelete }] =
    useDeleteAreaMasterMutation();
  const {
  data: cityOptions,
  isLoading: loadingCities,
} = useGetCityMasterOptionsQuery();
  const deleteHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Area Master?")) {
      return;
    }

    try {
      await deleteAreaMaster(id).unwrap();

      toast.success("Area Master deleted successfully");

     
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
  <>
    <Row className="align-items-center mb-3">
      <Col>
        <h2>Area Masters</h2>
      </Col>

      <Col xs="auto">
        <LinkContainer to="/admin/area-master/create">
          <Button variant="primary">
            <FaPlus className="me-2" />
            Create Area Master
          </Button>
        </LinkContainer>
      </Col>
    </Row>

    <Card className="mb-3">
      <Card.Body>
        <Row className="g-3 align-items-end">
          <Col md={6}>
            <Form.Group controlId="searchArea">
              <Form.Label>Search</Form.Label>

              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search Area..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPageNumber(1);
                  }}
                />

                {isFetching && (
                  <InputGroup.Text>
                    <Spinner animation="border" size="sm" />
                  </InputGroup.Text>
                )}
              </InputGroup>
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group controlId="cityFilter">
              <Form.Label>City</Form.Label>

              <Form.Select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setPageNumber(1);
                }}
              >
                <option value="">All Cities</option>

                {cityOptions?.cities?.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>

    {loadingDelete && <Loader />}

    {isLoading ? (
      <Loader />
    ) : error ? (
      <Message variant="danger">
        {error?.data?.message || error.error}
      </Message>
    ) : (
      <>
        <Table striped bordered hover responsive className="align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>AREA</th>
              <th>CITY</th>
              <th>STATE</th>
              <th>COUNTRY</th>
              <th>STATUS</th>
              <th style={{ width: "180px" }}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {data?.areas?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  No Area Masters Found
                </td>
              </tr>
            ) : (
              data.areas.map((area, index) => (
                <tr key={area._id}>
                  <td>{(pageNumber - 1) * 20 + index + 1}</td>

                  <td>{area.name}</td>

                  <td>{area.city?.name}</td>

                  <td>{area.city?.state}</td>

                  <td>{area.city?.country}</td>

                  <td>
                    {area.isActive ? (
                      <span className="text-success fw-bold">
                        Active
                      </span>
                    ) : (
                      <span className="text-danger fw-bold">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td>
                    <LinkContainer to={`/admin/area-master/${area._id}`}>
                      <Button
                        variant="light"
                        className="btn-sm me-2"
                      >
                        <FaEye />
                      </Button>
                    </LinkContainer>

                    <LinkContainer
                      to={`/admin/area-master/${area._id}/edit`}
                    >
                      <Button
                        variant="success"
                        className="btn-sm me-2"
                      >
                        <FaEdit />
                      </Button>
                    </LinkContainer>

                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(area._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <Paginate
          pages={data?.pages}
          page={data?.page}
          onPageChange={(page) => setPageNumber(page)}
        />
      </>
    )}
  </>
);
};

export default AreaMasterListScreen;
