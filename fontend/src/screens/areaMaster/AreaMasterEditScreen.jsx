
import { useState, useEffect } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetAreaMasterDetailsQuery,
  useUpdateAreaMasterMutation,
} from "../../slices/areaMasterApiSlice";

import { useGetCityMasterOptionsQuery } from "../../slices/cityMasterApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import FormContainer from "../../components/FormContainer";

const AreaMasterEditScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [isActive, setIsActive] = useState(true);

  const {
    data,
    isLoading,
    error,
  } = useGetAreaMasterDetailsQuery(id);

  const {
    data: cityOptions,
    isLoading: loadingCities,
    error: cityError,
  } = useGetCityMasterOptionsQuery();

  const [
    updateAreaMaster,
    {
      isLoading: loadingUpdate,
      error: updateError,
      isSuccess,
    },
  ] = useUpdateAreaMasterMutation();

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name);
      setCity(data.data.city?._id || "");
      setIsActive(data.data.isActive);
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Area Master updated successfully");
      navigate("/admin/area-master");
    }
  }, [isSuccess, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Area name is required");
      return;
    }

    if (!city) {
      toast.error("Please select a city");
      return;
    }

    try {
      await updateAreaMaster({
        areaMasterId: id,
        name,
        city,
        isActive,
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <Card>
        <Card.Header>
          <h3>Edit Area Master</h3>
        </Card.Header>

        <Card.Body>
          {(isLoading || loadingCities || loadingUpdate) && <Loader />}

          {error && (
            <Message variant="danger">
              {error?.data?.message || error.error}
            </Message>
          )}

          {cityError && (
            <Message variant="danger">
              {cityError?.data?.message || cityError.error}
            </Message>
          )}

          {updateError && (
            <Message variant="danger">
              {updateError?.data?.message || updateError.error}
            </Message>
          )}

          {!isLoading && (
            <Form onSubmit={submitHandler}>
              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3" controlId="city">
                    <Form.Label>City</Form.Label>

                    <Form.Select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value="">Select City</option>

                      {cityOptions?.cities?.map((cityItem) => (
                        <option
                          key={cityItem._id}
                          value={cityItem._id}
                        >
                          {cityItem.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Area Name</Form.Label>

                    <Form.Control
                      type="text"
                      placeholder="Enter Area Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group
                    className="mb-4"
                    controlId="isActive"
                  >
                    <Form.Check
                      type="switch"
                      label="Active"
                      checked={isActive}
                      onChange={(e) =>
                        setIsActive(e.target.checked)
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-between">
                <Button
                  variant="secondary"
                  onClick={() =>
                    navigate("/admin/area-master")
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loadingUpdate}
                >
                  Update Area Master
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default AreaMasterEditScreen;

