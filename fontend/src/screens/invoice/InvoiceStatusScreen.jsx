// src/screens/invoices/InvoiceStatusScreen.jsx

import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetInvoiceDetailsQuery,
  useUpdateInvoiceStatusMutation,
} from "../../slices/invoiceApiSlice";

const InvoiceStatusScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: invoice,
    isLoading,
    error,
  } = useGetInvoiceDetailsQuery(id);

  const [
    updateStatus,
    { isLoading: loadingUpdate },
  ] = useUpdateInvoiceStatusMutation();

  const [status, setStatus] = useState("");

  /**
   * Hydrate status when data loads
   */
  useEffect(() => {
    if (invoice?.status) {
      setStatus(invoice.status);
    }
  }, [invoice]);

  /**
   * Status options (must match backend)
   */
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getBadgeVariant = (value) => {
    switch (value) {
      case "paid":
        return "success";
      case "sent":
        return "primary";
      case "draft":
        return "secondary";
      case "overdue":
        return "danger";
      case "cancelled":
        return "dark";
      default:
        return "light";
    }
  };

  /**
   * Submit status update
   */
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateStatus({
        id,
        data: { status },
      }).unwrap();

      toast.success("Invoice status updated");

      navigate(`/invoices/${id}`);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to update status"
      );
    }
  };

  return (
    <Row className="justify-content-center">
      <Col lg={6}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h2 className="mb-3">
              Update Invoice Status
            </h2>

            {isLoading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : error ? (
              <Alert variant="danger">
                {error?.data?.message ||
                  error.error}
              </Alert>
            ) : (
              <>
                {/* Invoice Info */}
                <div className="mb-4">
                  <h5>
                    {invoice.invoiceNumber}
                  </h5>

                  <div className="text-muted">
                    Current Status:{" "}
                    <Badge
                      bg={getBadgeVariant(
                        invoice.status
                      )}
                    >
                      {invoice.status}
                    </Badge>
                  </div>

                  <div className="mt-2">
                    Total:{" "}
                    <strong>
                      {invoice.currency}{" "}
                      {invoice.totalAmount?.toFixed(
                        2
                      )}
                    </strong>
                  </div>
                </div>

                {/* Status Form */}
                <Form onSubmit={submitHandler}>
                  <Form.Group className="mb-4">
                    <Form.Label>
                      Select New Status
                    </Form.Label>

                    <Form.Select
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value
                        )
                      }
                      required
                    >
                      {statusOptions.map(
                        (opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                          >
                            {opt.label}
                          </option>
                        )
                      )}
                    </Form.Select>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={
                        loadingUpdate
                      }
                    >
                      {loadingUpdate
                        ? "Updating..."
                        : "Update Status"}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() =>
                        navigate(
                          `/invoices/${id}`
                        )
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default InvoiceStatusScreen;