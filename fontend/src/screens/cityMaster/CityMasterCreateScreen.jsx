
import { useState, useEffect } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useCreateCityMasterMutation } from "../../slices/cityMasterApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import FormContainer from "../../components/FormContainer";

const CityMasterCreateScreen = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");

  const [
    createCityMaster,
    {
      isLoading,
      error,
      isSuccess,
    },
  ] = useCreateCityMasterMutation();

  useEffect(() => {
    if (isSuccess) {
      toast.success("City Master created successfully");

      navigate("/admin/city-master");
    }
  }, [isSuccess, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("City name is required");
      return;
    }

    if (!state.trim()) {
      toast.error("State is required");
      return;
    }

    try {
      await createCityMaster({
        name,
        state,
        country,
      }).unwrap();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <FormContainer>
      <Card>
        <Card.Header>
          <h3>Create City Master</h3>
        </Card.Header>

        <Card.Body>
          {isLoading && <Loader />}

          {error && (
            <Message variant="danger">
              {error?.data?.message || error.error}
            </Message>
          )}

          <Form onSubmit={submitHandler}>
            <Row>
              <Col md={12}>
                <Form.Group
                  className="mb-3"
                  controlId="cityName"
                >
                  <Form.Label>
                    City Name
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="Enter City Name"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group
                  className="mb-3"
                  controlId="state"
                >
                  <Form.Label>
                    State
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="Enter State Name"
                    value={state}
                    onChange={(e) =>
                      setState(e.target.value)
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group
                  className="mb-4"
                  controlId="country"
                >
                  <Form.Label>
                    Country
                  </Form.Label>

                  <Form.Control
                    type="text"
                    placeholder="Enter Country Name"
                    value={country}
                    onChange={(e) =>
                      setCountry(e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                onClick={() =>
                  navigate("/admin/city-master")
                }
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                Create City Master
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default CityMasterCreateScreen;

