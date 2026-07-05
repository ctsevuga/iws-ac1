import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Modal,
  Navbar,
  Alert,
  Badge,
  Accordion,
} from "react-bootstrap";

import {
  FaPhone,
  FaHeadset,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaClock,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobe,
  FaTools,
  FaSnowflake,
  FaBolt,
  FaShieldAlt,
  FaFan,
  FaTemperatureLow,
  FaWrench,
  FaLeaf,
  FaBuilding,
  FaHome,
  FaIndustry,
  FaClipboardCheck,
  FaCheckCircle,
} from "react-icons/fa";

import "../../css/CustomerLoginScreen.css";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { useLoginCustomerMutation } from "../../slices/customerAuthApiSlice";
import { setCustomerCredentials } from "../../slices/customerAuthApiSlice";

import { useGetPublicPortalSettingsQuery } from "../../slices/customerPortalApiSlice";

const CustomerLoginScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { slug } = useParams();

  const [showLogin, setShowLogin] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loginCustomer, { isLoading }] = useLoginCustomerMutation();

  const {
    data: portal,
    isLoading: portalLoading,
    error,
  } = useGetPublicPortalSettingsQuery(slug);
  

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!phone.trim()) return toast.error("Phone required");
    if (!password) return toast.error("Password required");

    try {
      const res = await loginCustomer({
        slug,
        data: {
          phone,
          password,
        },
      }).unwrap();

      dispatch(setCustomerCredentials(res));

      toast.success(`Welcome ${res.name}`);
      setShowLogin(false);

      if (res.company?.slug) {
        navigate(`/${res.company.slug}/dashboard`);
      }
    } catch (err) {
      toast.error(err?.data?.message || "Login failed");
    }
  };

  if (portalLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Portal not found or not configured.</Alert>
      </Container>
    );
  }

  const settings = portal?.settings || {};
  const company = portal?.company || {};
  const iconMap = {
  FaHeadset,
  FaPhone,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaClock,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobe,
  FaTools,
  FaSnowflake,
  FaBolt,
  FaShieldAlt,
  FaFan,
  FaTemperatureLow,
  FaWrench,
  FaLeaf,
  FaBuilding,
  FaHome,
  FaIndustry,
  FaClipboardCheck,
  FaCheckCircle,
};

const cta = settings.callToAction || {};
const CTAIcon = iconMap[cta.icon] || FaHeadset;

  const primaryColor = settings.primaryColor || "#0d6efd";
  const secondaryColor = settings.secondaryColor || "#6ea8fe";

  const services =
    settings.services
      ?.filter((s) => s.active)
      ?.sort((a, b) => a.displayOrder - b.displayOrder) || [];

  const specialServices =
    settings.specialServices?.filter((s) => s.active) || [];
const companyName = slug
  ?.split("-")
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const faqs = [
  {
    question: `${companyName} என்னென்ன சேவைகளை வழங்குகிறது?`,
    answer: `${companyName} நிறுவனம் ஏசி பழுதுபார்ப்பு, லேப்டாப் சேவை, பிளம்பிங், பூச்சி கட்டுப்பாடு, சோஃபா சுத்தம் செய்தல் உள்ளிட்ட பல்வேறு வீட்டு சேவைகளை வழங்குகிறது.`,
  },
  {
    question: `${companyName} நிறுவனத்தை வீட்டு சேவைகளுக்காக எவ்வாறு தொடர்புகொள்வது?`,
    answer: `${companyName} நிறுவனத்தை எங்கள் இணையதளம் அல்லது வாடிக்கையாளர் சேவை எண்ணின் மூலம் தொடர்புகொள்ளலாம். எங்கள் தொடர்பு பக்கத்தைப் பார்வையிடுங்கள் அல்லது நேரடியாக அழைத்து சேவையை முன்பதிவு செய்யலாம்.`,
  },
  {
    question: `${companyName} நிறுவனத்தின் தொழில்நுட்ப நிபுணர்கள் தங்கள் துறையில் அனுபவமுள்ளவர்களா?`,
    answer: `ஆம். ${companyName} நிறுவனத்தின் அனைத்து தொழில்நுட்ப நிபுணர்களும் தங்கள் துறையில் பயிற்சி பெற்ற மற்றும் அனுபவமிக்க வல்லுநர்கள் ஆவர்.`,
  },
  {
    question: `${companyName} நிறுவனம் போட்டித்திறன் கொண்ட விலையில் சேவைகளை வழங்குகிறதா?`,
    answer: `ஆம். உயர்தரமான வீட்டு சேவைகளை நியாயமான மற்றும் வெளிப்படையான கட்டணத்தில் வழங்கி, உங்கள் பணத்திற்கு சிறந்த மதிப்பை உறுதி செய்கிறோம்.`,
  },
  {
    question: `${companyName} நிறுவனத்தில் சேவையை எவ்வாறு முன்பதிவு செய்வது?`,
    answer: `எங்கள் இணையதளத்தின் மூலம் அல்லது வாடிக்கையாளர் சேவை எண்ணை அழைப்பதன் மூலம் எளிதாக சேவையை முன்பதிவு செய்யலாம். சில நிமிடங்களில் முன்பதிவு செய்து முடிக்கலாம்.`,
  },
  {
    question: `${companyName} நிறுவனம் தனது சேவைகளுக்கு உத்தரவாதம் வழங்குகிறதா?`,
    answer: `ஆம். வாடிக்கையாளர்களின் முழுமையான திருப்தியை உறுதி செய்ய எங்கள் சேவைகளுக்கு உத்தரவாதம் வழங்குகிறோம். எங்கள் சேவையில் நீங்கள் திருப்தியடையாவிட்டால், அதை சரிசெய்ய தேவையான நடவடிக்கைகளை எடுப்போம்.`,
  },
  {
    question: `${companyName} நிறுவனத்தின் சேவைகள் வார இறுதி நாட்களிலும் அரசு விடுமுறை நாட்களிலும் கிடைக்குமா?`,
    answer: `ஆம். உங்கள் வசதிக்காக வார இறுதி நாட்கள் மற்றும் அரசு விடுமுறை நாட்களிலும் சேவைகளை வழங்குகிறோம்.`,
  },
  {
    question: `${companyName} நிறுவனம் வீடுகளுக்கும் வணிக நிறுவனங்களுக்கும் சேவைகளை வழங்குகிறதா?`,
    answer: `ஆம். ${companyName} நிறுவனம் தனியார் வீடுகள் மற்றும் வணிக நிறுவனங்கள் ஆகிய இரண்டிற்கும் தேவைக்கேற்ற சேவைத் திட்டங்களை வழங்குகிறது.`,
  },
];
  return (
    <>
      {/* ================= HEADER ================= */}
      <Navbar bg="white" className="shadow-sm py-2">
        <Container>
          <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold">
            {settings.companyLogo && (
              <img
                src={settings.companyLogo}
                alt="logo"
                style={{ height: 42 }}
              />
            )}
            <div>
              <div className="fw-bold">
                {settings.portalTitle || company.name}
              </div>
              <small className="text-muted">Customer Service Portal</small>
            </div>
          </Navbar.Brand>

          <div className="d-none d-md-flex align-items-center text-muted">
            <FaPhone className="me-2" />
            {settings.contactPhone}
          </div>
        </Container>
      </Navbar>

      {/* ================= HERO ================= */}
      <section
        style={{
          "--primary-color": primaryColor,
          "--secondary-color": secondaryColor,
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="fw-bold">{settings.portalTitle}</h1>

              <p className="lead">{settings.portalSubtitle}</p>

              <p>{settings.welcomeMessage}</p>

              {/* CONTACT STRIP */}
              <div className="d-flex flex-wrap gap-3 mt-3">
                <Badge bg="light" text="dark">
                  <FaPhone /> {settings.contactPhone}
                </Badge>

                <Badge bg="light" text="dark">
                  <FaEnvelope /> {settings.supportEmail}
                </Badge>

                <Badge bg="light" text="dark">
                  <FaGlobe /> {settings.website}
                </Badge>
              </div>

              <Button
  className="portal-btn-primary"
  onClick={() => setShowLogin(true)}
>
  {cta.buttonText || "Raise Service Request"}
</Button>
            </Col>

            <Col lg={6}>
              {settings.heroImage && (
                <img
                  src={settings.heroImage}
                  alt="hero"
                  className="img-fluid rounded shadow"
                />
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= QUICK HELP ================= */}
{cta.enabled && (
  <section className="py-4">
    <Container>
      <Card
        className="border-0 shadow-lg"
        style={{
          borderLeft: `6px solid ${primaryColor}`,
          borderRadius: "16px",
          backgroundColor: cta.backgroundColor || "#fff",
        }}
      >
        <Card.Body className="p-4">
          <Row className="align-items-center">
            {/* English */}
            <Col lg={cta.showTamil ? 6 : 12} className="mb-4 mb-lg-0">
              <div className="d-flex align-items-center mb-3">
                <CTAIcon
    size={32}
    style={{ color: primaryColor }}
    className="me-3"
/>

                <h4
                  className="fw-bold mb-0"
                  style={{ color: primaryColor }}
                >
                  {cta.title}
                </h4>
              </div>

              <p
                className="fs-5"
                style={{
                  whiteSpace: "pre-line",
                }}
              >
                {cta.description}
              </p>

              <div className="d-flex flex-wrap gap-2 mt-4">
                {settings.contactPhone && (
                  <Badge bg="success" className="p-2 fs-6">
                    <FaPhone className="me-2" />
                    Call
                  </Badge>
                )}

                {settings.enableWhatsappButton &&
                  settings.whatsappPhone && (
                    <Badge bg="success" className="p-2 fs-6">
                      WhatsApp
                    </Badge>
                  )}

                <Badge bg="primary" className="p-2 fs-6">
                  {cta.buttonText}
                </Badge>
              </div>
            </Col>

            {/* Tamil */}
            {cta.showTamil && (
              <Col lg={6}>
                <div className="d-flex align-items-center mb-3">
                  <FaCheckCircle
                    size={30}
                    className="text-success me-3"
                  />

                  <h4 className="fw-bold text-success mb-0">
                    {cta.titleTamil}
                  </h4>
                </div>

                <p
                  className="fs-5"
                  style={{
                    whiteSpace: "pre-line",
                  }}
                >
                  {cta.descriptionTamil}
                </p>

                <Button
                  className="portal-btn-primary mt-3"
                  onClick={() => setShowLogin(true)}
                >
                  {cta.buttonTextTamil || cta.buttonText}
                </Button>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  </section>
)}

      {/* ================= SERVICES ================= */}
      {services.length > 0 && (
        <section className="py-5 bg-light">
          <Container>
            <h2 className="text-center mb-4">Services</h2>

            <Row>
              {services.map((s, i) => (
                <Col md={4} key={i} className="mb-4">
                  <Card className="service-card">
                    {s.image && (
                      <Card.Img
                        src={s.image}
                        style={{
                          height: 200,
                          objectFit: "cover",
                        }}
                      />
                    )}

                    <Card.Body>
                      <Card.Title>{s.title}</Card.Title>
                      <Card.Text>{s.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      )}
      {/* ================= SPECIAL SERVICES ================= */}
      <h2 className="special-service-card">Special Services</h2>
      <Row className="flex-nowrap overflow-auto pb-3">
        {specialServices.map((service, index) => {
          const Icon = iconMap[service.icon] || FaCheckCircle;

          return (
            <Col
              key={index}
              xs="auto"
              className="d-flex"
              style={{ minWidth: "320px" }}
            >
              <Card
                className="w-100 border-0 shadow-sm text-center"
                style={{
                  borderRadius: "15px",
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center justify-content-start">
                    <Icon size={40} color={primaryColor} className="me-3" />

                    <div className="text-start">
                      <h5
                        className="fw-bold mb-1"
                        style={{ color: primaryColor }}
                      >
                        {service.title}
                      </h5>

                      <p className="text-muted mb-0">{service.description}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-5">
        <Container>
          <Row className="text-center">
            <Col md={3}>
              <FaCheckCircle size={35} className="text-success mb-2" />
              Certified Techs
            </Col>
            <Col md={3}>
              <FaClock size={35} className="text-primary mb-2" />
              Fast Response
            </Col>
            <Col md={3}>
              <FaShieldAlt size={35} className="text-warning mb-2" />
              Reliable Service
            </Col>
            <Col md={3}>
              <FaSnowflake size={35} className="text-info mb-2" />
              Cooling Experts
            </Col>
          </Row>
        </Container>
      </section>

      {/* ================= ANNOUNCEMENTS ================= */}
      {settings.announcements?.length > 0 && (
        <section className="py-4 bg-light">
          <Container>
            <h3 className="mb-3">Announcements</h3>

            {settings.announcements
              .filter((a) => a.active)
              .map((a, i) => (
                <Alert key={i} variant="warning">
                  <strong>{a.title}</strong>
                  <div>{a.message}</div>
                </Alert>
              ))}
          </Container>
        </section>
      )}

      {/* ================= FAQ ================= */}
<section className="py-5 bg-light">
  <Container>
    <div className="text-center mb-5">
      <h2 className="fw-bold">Frequently Asked Questions</h2>
      <p className="text-muted fs-5">
        Find quick answers to your most common questions
      </p>
    </div>

    <Accordion flush>
      {faqs.map((faq, index) => (
        <Accordion.Item eventKey={String(index)} key={index}>
          <Accordion.Header>{faq.question}</Accordion.Header>
          <Accordion.Body
            style={{
              whiteSpace: "pre-line",
              fontSize: "1rem",
              lineHeight: "1.7",
            }}
          >
            {faq.answer}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  </Container>
</section>

      {/* ================= CTA ================= */}
      <section
        className="py-5 text-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <Container>
          <h2>{cta.title}</h2>

<p>{settings.serviceRequestInstructions}</p>

<Button
  variant="light"
  onClick={() => setShowLogin(true)}
>
  {cta.buttonText || "Customer Login"}
</Button>
        </Container>
      </section>

      {/* ================= LOGIN MODAL ================= */}
      <Modal
        show={showLogin}
        onHide={() => setShowLogin(false)}
        centered
        dialogClassName="portal-login-modal"
      >
        <Modal.Header
          closeButton
          closeVariant="white"
          className="portal-modal-header"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
            color: "#fff",
            borderBottom: "none",
          }}
        >
          <div className="d-flex align-items-center">
            {settings.companyLogo && (
              <img
                src={settings.companyLogo}
                alt="Company Logo"
                style={{
                  width: 45,
                  height: 45,
                  objectFit: "contain",
                  borderRadius: "10px",
                  background: "#fff",
                  padding: "4px",
                  marginRight: "12px",
                }}
              />
            )}

            <div>
              <Modal.Title className="fw-bold mb-0">Customer Login</Modal.Title>

              <small className="text-white-50">
                Sign in to access your service portal
              </small>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <FaPhone className="me-2 text-primary" />
                Phone Number
              </Form.Label>

              <Form.Control
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                <FaLock className="me-2 text-primary" />
                Password
              </Form.Label>

              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <div className="d-grid gap-2 d-md-flex mt-4">
              <Button
                variant="outline-secondary"
                className="portal-cancel-btn flex-fill"
                onClick={() => setShowLogin(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="portal-login-btn flex-fill"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="me-2" />
                    Login
                  </>
                )}
              </Button>
            </div>

            {settings.enableRegistration && (
              <>
                <hr className="my-4" />

                <div className="text-center">
                  <Button
                    variant="link"
                    className="portal-link-btn"
                    onClick={() => navigate(`/${slug}/register`)}
                  >
                    <FaUserPlus className="me-2" />
                    Create New Account
                  </Button>

                  <Button
                    variant="link"
                    className="portal-link-btn"
                    onClick={() => navigate(`/${slug}/forget-password`)}
                  >
                    <FaLock className="me-2" />
                    Forgot Password?
                  </Button>
                </div>
              </>
            )}
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CustomerLoginScreen;
