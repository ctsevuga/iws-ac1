import { useState, useEffect } from "react";

import { Form, Row, Col, Card, Button } from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import {
  useGetCityMasterOptionsQuery,
  } from "../../slices/cityMasterApiSlice";

import {
    useGetCityAreaMastersQuery,
} from "../../slices/areaMasterApiSlice";

import { useGetCompanyServiceAreasQuery } from "../../slices/companyServiceAreaApiSlice";

const ServiceFinder = () => {
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  const navigate = useNavigate();

  /**
   * Get cities
   */
  const { data: cities = [], isLoading: citiesLoading } =
    useGetCityMasterOptionsQuery();

  /**
   * Get areas based on city
   */
  const { data: areas = [], isLoading: areasLoading } =
    useGetCityAreaMastersQuery(city, {
      skip: !city,
    });

  /**
   * Get companies serving selected area
   */
  const { data: companies = [], isLoading: companiesLoading } =
    useGetCompanyServiceAreasQuery(
      {
        city,
        area,
      },
      {
        skip: !city || !area,
      },
    );

  /**
   * Reset area when city changes
   */
  useEffect(() => {
    setArea("");
  }, [city]);

  const companyClickHandler = (slug) => {
    navigate(`/${slug}`);
  };

  return (
    <Card className="p-4 shadow">
      <h3 className="mb-4 text-center">Find HVAC Service Near You</h3>

      <Row>
        {/* City */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Select City</Form.Label>

            <Form.Select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Select City</option>

              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Area */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Select Area</Form.Label>

            <Form.Select
              disabled={!city}
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              <option value="">Select Area</option>

              {areas.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {companiesLoading && <p>Searching HVAC companies...</p>}

      {companies.length > 0 && (
        <>
          <h5 className="mt-4">Available HVAC Companies</h5>

          <div className="d-grid gap-2">
            {companies.map((item) => (
              <Button
                key={item._id}
                variant="primary"
                size="lg"
                onClick={() => companyClickHandler(item.company.slug)}
              >
                {item.company.name}
              </Button>
            ))}
          </div>
        </>
      )}

      {city && area && !companiesLoading && companies.length === 0 && (
        <p className="text-danger mt-3">
          No HVAC service provider found for this area.
        </p>
      )}
    </Card>
  );
};

export default ServiceFinder;
