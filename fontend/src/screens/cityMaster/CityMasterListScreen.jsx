
import { Button, Col, Row, Table } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { FaEye, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import {
  useGetCityMastersQuery,
  useDeleteCityMasterMutation,
} from "../../slices/cityMasterApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";

const CityMasterListScreen = () => {
  const {
    data,
    isLoading,
    error,
  } = useGetCityMastersQuery();

  const [
    deleteCityMaster,
    {
      isLoading: loadingDelete,
    },
  ] = useDeleteCityMasterMutation();

  const deleteHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this City Master?")) {
      return;
    }

    try {
      await deleteCityMaster(id).unwrap();

      toast.success("City Master deleted successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h2>City Masters</h2>
        </Col>

        <Col xs="auto">
          <LinkContainer to="/admin/city-master/create">
            <Button variant="primary">
              <FaPlus className="me-2" />
              Create City Master
            </Button>
          </LinkContainer>
        </Col>
      </Row>

      {loadingDelete && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Table
          striped
          bordered
          hover
          responsive
          className="align-middle"
        >
          <thead>
            <tr>
              <th>#</th>
              <th>CITY</th>
              <th>STATE</th>
              <th>COUNTRY</th>
              <th>STATUS</th>
              <th style={{ width: "180px" }}>
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.data?.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center"
                >
                  No City Masters Found
                </td>
              </tr>
            ) : (
              data?.data?.map((city, index) => (
                <tr key={city._id}>
                  <td>
                    {index + 1}
                  </td>

                  <td>
                    {city.name}
                  </td>

                  <td>
                    {city.state}
                  </td>

                  <td>
                    {city.country}
                  </td>

                  <td>
                    {city.isActive ? (
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
                    <LinkContainer
                      to={`/admin/city-master/${city._id}`}
                    >
                      <Button
                        variant="light"
                        className="btn-sm me-2"
                        title="View"
                      >
                        <FaEye />
                      </Button>
                    </LinkContainer>

                    <LinkContainer
                      to={`/admin/city-master/${city._id}/edit`}
                    >
                      <Button
                        variant="success"
                        className="btn-sm me-2"
                        title="Edit"
                      >
                        <FaEdit />
                      </Button>
                    </LinkContainer>

                    <Button
                      variant="danger"
                      className="btn-sm"
                      title="Delete"
                      onClick={() =>
                        deleteHandler(city._id)
                      }
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default CityMasterListScreen;

