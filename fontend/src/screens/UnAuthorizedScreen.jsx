// screens/UnauthorizedScreen.jsx

import { Container, Alert } from "react-bootstrap";

const UnauthorizedScreen = () => {
  return (
    <Container className="py-5">
      <Alert variant="danger">
        <h4>Access Denied</h4>

        <p className="mb-0">
          You do not have permission to
          access this page.
        </p>
      </Alert>
    </Container>
  );
};

export default UnauthorizedScreen;