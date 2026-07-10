import React from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

import { useParams, useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import {
  useReGenerateInvoiceMutation,
  useGetInvoiceQuery,
} from "../../slices/billingApiSlice";

const InvoiceRegenerateScreen = () => {
  const { invoiceId } = useParams();

  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | GET EXISTING INVOICE
  |--------------------------------------------------------------------------
  */

  const {
    data,
    isLoading: invoiceLoading,
    error: invoiceError,
  } = useGetInvoiceQuery(invoiceId);

  const invoice = data?.data;

  /*
  |--------------------------------------------------------------------------
  | REGENERATE MUTATION
  |--------------------------------------------------------------------------
  */

  const [reGenerateInvoice, { isLoading: regenerateLoading }] =
    useReGenerateInvoiceMutation();

  /*
  |--------------------------------------------------------------------------
  | HANDLER
  |--------------------------------------------------------------------------
  */

  const regenerateHandler = async () => {
    try {
      await reGenerateInvoice(invoiceId).unwrap();

      toast.success("Invoice regenerated successfully");

      navigate(`/invoices/${invoiceId}`);
    } catch (err) {
      toast.error(err?.data?.message || "Invoice regeneration failed");
    }
  };

  if (invoiceLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner />
      </Container>
    );
  }

  if (invoiceError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {invoiceError?.data?.message || "Invoice not found"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h3 className="text-primary fw-bold mb-4">Regenerate Invoice</h3>

              <Card className="mb-4">
                <Card.Header className="fw-bold">Invoice Details</Card.Header>

                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>Invoice Number:</strong>

                        <br />

                        {invoice?.invoice?.invoiceNumber}
                      </p>

                      <p>
                        <strong>Company:</strong>

                        <br />

                        {invoice?.company?.name}
                      </p>
                    </Col>

                    <Col md={6}>
                      <p>
                        <strong>Current Status:</strong>

                        <br />

                        {invoice?.invoice?.status}
                      </p>

                      <p>
                        <strong>Current Total:</strong>
                        <br />₹{invoice?.summary?.total}
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Alert variant="warning">
                Regenerating this invoice will recalculate:
                <ul className="mb-0 mt-2">
                  <li>Current number of managers</li>

                  <li>Current number of dispatchers</li>

                  <li>Current number of technicians</li>

                  <li>Additional user charges</li>

                  <li>Invoice line items</li>

                  <li>Invoice total amount</li>
                </ul>
              </Alert>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => navigate(-1)}
                  disabled={regenerateLoading}
                >
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  onClick={regenerateHandler}
                  disabled={regenerateLoading}
                >
                  {regenerateLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate Invoice"
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InvoiceRegenerateScreen;
