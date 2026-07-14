import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "../../css/ServicesSection.css";
const services = [
  {
    title: "AC Installation",
    image:
      "https://res.cloudinary.com/dsoi84tie/image/upload/v1781066056/Air_Conditionar_ahdt5t.jpg",
    description:
      "Professional installation for homes, apartments, offices and commercial buildings.",
  },
  {
    title: "AC Repair",
    image:
      "https://res.cloudinary.com/dsoi84tie/image/upload/v1781066808/Air_Conditionar_Service_agfsap.jpg",
    description:
      "Quick diagnosis and repair by experienced HVAC technicians in your area.",
  },
  {
    title: "Preventive Maintenance",
    image:
      "https://res.cloudinary.com/dsoi84tie/image/upload/v1781066870/Air_Conditionar_Service_-_02_bauc4y.jpg",
    description:
      "Extend the life of your cooling systems through scheduled maintenance visits.",
  },
  {
    title: "Smart AC Monitoring",
    image:
      "https://res.cloudinary.com/dsoi84tie/image/upload/v1781066659/Air_Conditionar_Remote_Control_nlvmp7.jpg",
    description:
      "Monitor equipment performance and raise service requests before failures occur.",
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="services-section"
    >
      <Container>

        <div className="section-heading">

          <span className="section-badge">
            HVAC Marketplace
          </span>

          <h2>
            Explore Professional HVAC Services
          </h2>

          <p>
            Whether you need a new installation, emergency repair,
            annual maintenance, or ongoing support,
            our platform connects you with trusted local HVAC companies
            ready to serve your area.
          </p>

        </div>

        <Row className="g-4 mt-4">

          {services.map((service, index) => (

            <Col
              lg={3}
              md={6}
              key={index}
            >

              <Card className="service-card">

                <div className="service-image">

                  <img
                    src={service.image}
                    alt={service.title}
                  />

                </div>

                <Card.Body>

                  <h4>{service.title}</h4>

                  <p>{service.description}</p>

                  {/* <Button
                    variant="primary"
                    className="w-100"
                  >
                    Find Providers
                  </Button> */}

                </Card.Body>

              </Card>

            </Col>

          ))}

        </Row>

        <div className="emergency-banner">

          <div>

            <h3>
              Need Immediate HVAC Assistance?
            </h3>

            <p>
              Search nearby HVAC companies,
              raise your request online,
              and receive faster technician response.
            </p>

          </div>

          <Button
            size="lg"
            variant="light"
          >
            Find Nearby Companies
          </Button>

        </div>

      </Container>
    </section>
  );
};

export default ServicesSection;