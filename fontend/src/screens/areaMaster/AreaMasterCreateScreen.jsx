import { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCreateAreaMasterMutation } from "../../slices/areaMasterApiSlice";
import { useGetCityMasterOptionsQuery } from "../../slices/cityMasterApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import FormContainer from "../../components/FormContainer";

const AreaMasterCreateScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const {
    data: cityOptions,
    isLoading: loadingCities,
    error: cityError,
  } = useGetCityMasterOptionsQuery();

  const [
    createAreaMaster,
    { isLoading: loadingCreate, error: createError, isSuccess },
  ] = useCreateAreaMasterMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success("Area Master created successfully");
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
      await createAreaMaster({
        name,
        city,
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <Card>
        <Card.Header>
          <h3>Create Area Master</h3>
        </Card.Header>

        <Card.Body>
          {(loadingCreate || loadingCities) && <Loader />}

          {createError && (
            <Message variant="danger">
              {createError?.data?.message || createError.error}
            </Message>
          )}

          {cityError && (
            <Message variant="danger">
              {cityError?.data?.message || cityError.error}
            </Message>
          )}

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

                    {cityOptions?.cities?.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.name}
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
            </Row>

            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                onClick={() => navigate("/admin/area-master")}
              >
                Cancel
              </Button>

              <Button type="submit" variant="primary" disabled={loadingCreate}>
                Create Area Master
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default AreaMasterCreateScreen;
