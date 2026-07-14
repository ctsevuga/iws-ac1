import { Container, Row, Col, Card } from "react-bootstrap";

import "../../css/HowItWorks.css";

const customerSteps = [
  {
    number: "01",
    icon: "🔍",
    title: "Discover",
    description:
      "Search trusted HVAC companies operating in your city or service area.",
  },
  {
    number: "02",
    icon: "🏢",
    title: "Explore",
    description:
      "Visit the company's profile to view services, photos, contact details, and customer information.",
  },
  {
    number: "03",
    icon: "📝",
    title: "Request Service",
    description:
      "Register, raise a service request online, or contact the company directly by phone or WhatsApp.",
  },
  
];


const companySteps = [
  {
    icon: "📥",
    title: "Receive Request",
  },
  {
    icon: "🚀",
    title: "Smart Dispatch",
  },
  {
    icon: "🔧",
    title: "Technician Accepts",
  },
  {
    icon: "✅",
    title: "Complete Service",
  },
];
const companySteps_02 = [
  {
    icon: "📥",
    title: "Receive Request",
  },
  {
    icon: "🚀",
    title: "Smart Dispatch",
  },
  {
    icon: "🔧",
    title: "Technician Accepts",
  },
  {
    icon: "✅",
    title: "Complete Service",
  },
];

const HowItWorks = () => {
  return (
    <section id="workflow" className="workflow-section">
      <Container>

        <div className="workflow-header">

          <span className="workflow-tag">
            Simple. Smart. Seamless.
          </span>

          <h2>How HVAC Connect Works</h2>

          <p>
            From discovering a trusted HVAC company to completing the service,
            every step is managed digitally through one intelligent platform.
          </p>

        </div>

        {/* Customer Journey */}

        <h3 className="journey-title">
          Customer Journey
        </h3>

        <Row className="g-4 mt-2">

          {customerSteps.map((step) => (

            <Col
              // lg={2}
              md={4}
              sm={6}
              key={step.number}
            >

              <Card className="journey-card">

                <Card.Body>

                  <div className="step-number">
                    {step.number}
                  </div>

                  <div className="step-icon">
                    {step.icon}
                  </div>

                  <h5>{step.title}</h5>

                  <p>{step.description}</p>

                </Card.Body>

              </Card>

            </Col>

          ))}

        </Row>
        
        

        {/* Company Workflow */}

        <div className="company-workflow">

          <h3 className="journey-title">
            HVAC Company Workflow
          </h3>

          <div className="workflow-line">

            {companySteps.map((step, index) => (

              <div
                key={index}
                className="workflow-item"
              >

                <div className="workflow-icon">
                  {step.icon}
                </div>

                <h6>{step.title}</h6>

                {index < companySteps.length - 1 && (
                  <div className="workflow-arrow">
                    ➜
                  </div>
                )}

              </div>

            ))}

          </div>

        </div>

      </Container>
    </section>
  );
};

export default HowItWorks;