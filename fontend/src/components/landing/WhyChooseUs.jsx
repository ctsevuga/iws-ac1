import { Container, Row, Col, Card } from "react-bootstrap";
import "../../css/WhyChooseUs.css";
const comparisons = [
  {
    traditional: "Search multiple websites",
    modern: "Find trusted HVAC companies in one place",
  },
  {
    traditional: "Call every company manually",
    modern: "Raise service requests online",
  },
  {
    traditional: "No idea who will respond",
    modern: "Automatic technician assignment",
  },
  {
    traditional: "No service status visibility",
    modern: "Track every service request in real time",
  },
  {
    traditional: "Paper-based job management",
    modern: "Complete digital workflow",
  },
];

const features = [
  {
    icon: "📍",
    title: "Local Business Discovery",
    description:
      "Discover verified HVAC companies operating in your city and neighborhood.",
  },
  {
    icon: "📝",
    title: "Online Service Requests",
    description:
      "Customers can register, request service, and monitor every stage online.",
  },
  {
    icon: "🚀",
    title: "Smart Technician Dispatch",
    description:
      "Service requests are automatically sent to technicians serving the customer's area.",
  },
  {
    icon: "📊",
    title: "Business Analytics",
    description:
      "Managers gain complete visibility into jobs, technicians, and company performance.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="whyus" className="why-section">
      <Container>

        <div className="section-header">
          <span className="section-tag">
            Why Choose HVAC Connect
          </span>

          <h2>
            A Smarter Way to Connect Customers,
            Companies and Technicians
          </h2>

          <p>
            Our platform is much more than a business directory.
            It is a complete HVAC ecosystem that connects discovery,
            booking, dispatch, and service management into one seamless experience.
          </p>
        </div>

        <Row className="comparison-box">

          <Col lg={6} className="traditional">

            <h3>Traditional Process</h3>

            {comparisons.map((item, index) => (
              <div
                key={index}
                className="compare-row"
              >
                <span className="cross">✖</span>

                {item.traditional}
              </div>
            ))}

          </Col>

          <Col lg={6} className="modern">

            <h3>With HVAC Connect</h3>

            {comparisons.map((item, index) => (
              <div
                key={index}
                className="compare-row"
              >
                <span className="check">✔</span>

                {item.modern}
              </div>
            ))}

          </Col>

        </Row>

        <Row className="g-4 mt-5">

          {features.map((feature, index) => (

            <Col
              lg={3}
              md={6}
              key={index}
            >

              <Card className="feature-card">

                <Card.Body>

                  <div className="feature-icon">
                    {feature.icon}
                  </div>

                  <h4>{feature.title}</h4>

                  <p>{feature.description}</p>

                </Card.Body>

              </Card>

            </Col>

          ))}

        </Row>

      </Container>
    </section>
  );
};

export default WhyChooseUs;