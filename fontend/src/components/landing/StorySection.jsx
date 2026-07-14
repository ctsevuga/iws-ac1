import { Container, Row, Col, Card } from "react-bootstrap";
import "../../css/StorySection.css";

const StorySection = () => {
    return (
        <section
            id="story"
            className="story-section"
        >
            <Container>

                <Row className="align-items-center">

                    {/* Image */}

                    <Col
                        lg={6}
                        className="mb-5"
                    >
                        <img
                            src="https://res.cloudinary.com/dsoi84tie/image/upload/v1781066870/Air_Conditionar_Service_-_02_bauc4y.jpg"
                            alt="HVAC Service"
                            className="story-image"
                        />
                    </Col>

                    {/* Story */}

                    <Col lg={6}>

                        <span className="story-tag">
                            A Better Way to Connect Customers & HVAC Companies
                        </span>

                        <h2 className="story-title">
                            Every Great Service Begins with
                            Finding the Right Professional.
                        </h2>

                        <p className="story-description">

                            Imagine it's the hottest afternoon of summer.
                            Your air conditioner suddenly stops working.

                            You search online and find dozens of HVAC companies,
                            but you're left wondering:

                        </p>

                        <ul className="story-list">

                            <li>Which company serves my area?</li>

                            <li>Who can respond the fastest?</li>

                            <li>Can I track my service request?</li>

                            <li>How do I know the technician is assigned?</li>

                        </ul>

                        <p className="story-description">

                            That's exactly why we built this platform.

                            We don't just help customers discover nearby HVAC
                            companies—we provide an end-to-end digital experience
                            where customers can explore company profiles,
                            request services online, receive real-time updates,
                            and track every job until completion.

                        </p>

                    </Col>

                </Row>

                <Row className="mt-5 g-4">

                    <Col md={4}>

                        <Card className="story-card">

                            <Card.Body>

                                <div className="story-icon">
                                    🔍
                                </div>

                                <h4>Discover</h4>

                                <p>

                                    Search trusted HVAC companies
                                    operating in your city and area.

                                </p>

                            </Card.Body>

                        </Card>

                    </Col>

                    <Col md={4}>

                        <Card className="story-card">

                            <Card.Body>

                                <div className="story-icon">
                                    📅
                                </div>

                                <h4>Book</h4>

                                <p>

                                    Raise service requests online,
                                    contact companies directly,
                                    or book services in minutes.

                                </p>

                            </Card.Body>

                        </Card>

                    </Col>

                    <Col md={4}>

                        <Card className="story-card">

                            <Card.Body>

                                <div className="story-icon">
                                    🚀
                                </div>

                                <h4>Track</h4>

                                <p>

                                    Monitor technician assignment,
                                    job progress,
                                    and service completion
                                    from your dashboard.

                                </p>

                            </Card.Body>

                        </Card>

                    </Col>

                </Row>

            </Container>
        </section>
    );
};

export default StorySection;