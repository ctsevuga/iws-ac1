import { Button, Container, Row, Col, Badge } from "react-bootstrap";
import "../../css/HeroSection.css";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="hero-section"
    >
      <div className="hero-overlay"></div>

      <Container fluid className="hero-content">

        <Row className="align-items-center">

          {/* Left Content */}

          <Col
            lg={7}
            md={12}
            className="hero-left"
          >
            <Badge
              bg="light"
              text="primary"
              className="hero-badge"
            >
              Smart HVAC Marketplace & SaaS Platform
            </Badge>

            <h1 className="hero-title">
              Find Trusted HVAC Professionals.
              <br />
              Book Services.
              <br />
              Track Every Job.
            </h1>

            <p className="hero-description">
              Discover verified HVAC companies operating in your area,
              explore their services, raise service requests online,
              and track every stage of your service journey.
              <br /><br />
              Whether you're a homeowner looking for reliable AC service
              or an HVAC company managing hundreds of technicians,
              our platform connects everyone through one intelligent ecosystem.
            </p>

            <div className="hero-buttons">

              <Button
                size="lg"
                variant="primary"
              >
                Find HVAC Companies
              </Button>

              <Button
                size="lg"
                variant="outline-light"
              >
                Become a Partner
              </Button>

            </div>

          </Col>

          {/* Right Side */}

          <Col
            lg={5}
            md={12}
            className="hero-right"
          >

            <div className="hero-card">

              <h3>Why Choose HVAC Connect?</h3>

              <ul>

                <li>✔ Discover Local HVAC Companies</li>

                <li>✔ Raise Online Service Requests</li>

                <li>✔ Smart Technician Dispatch</li>

                <li>✔ Real-Time Job Tracking</li>

                <li>✔ Company Portals</li>

                <li>✔ Customer Login</li>

                <li>✔ WhatsApp & Phone Support</li>

                <li>✔ Reports & Analytics</li>

              </ul>

            </div>

          </Col>

        </Row>

      </Container>

    </section>
  );
};

export default HeroSection;