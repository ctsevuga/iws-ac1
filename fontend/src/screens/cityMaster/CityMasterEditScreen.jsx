
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetCityMasterDetailsQuery,
  useUpdateCityMasterMutation,
} from "../../slices/cityMasterApiSlice";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import FormContainer from "../../components/FormContainer";

const CityMasterEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [isActive, setIsActive] = useState(true);

  const {
    data,
    isLoading: loadingDetails,
    error: detailsError,
  } = useGetCityMasterDetailsQuery(id);

  const [
    updateCityMaster,
    {
      isLoading: loadingUpdate,
      error: updateError,
      isSuccess,
    },
  ] = useUpdateCityMasterMutation();

  useEffect(() => {
    if (data?.data) {
      setName(data.data.name);
      setState(data.data.state);
      setCountry(data.data.country);
      setIsActive(data.data.isActive);
    }
  }, [data]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("City Master updated successfully");

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
      await updateCityMaster({
        cityMasterId: id,
        name,
        state,
        country,
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
          <h3>Edit City Master</h3>
        </Card.Header>

        <Card.Body>
          {(loadingDetails || loadingUpdate) && <Loader />}

          {detailsError && (
            <Message variant="danger">
              {detailsError?.data?.message || detailsError.error}
            </Message>
          )}

          {updateError && (
            <Message variant="danger">
              {updateError?.data?.message || updateError.error}
            </Message>
          )}

          {!loadingDetails && (
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
                    className="mb-3"
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
                    navigate("/admin/city-master")
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loadingUpdate}
                >
                  Update City Master
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default CityMasterEditScreen;

