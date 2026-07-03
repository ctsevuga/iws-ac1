import { useState } from "react";
import { Form, Button, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import { useCreateItemMutation } from "../../slices/itemApiSlice";

const CreateItemForm = () => {
  const [createItem, { isLoading }] = useCreateItemMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    currency: "USD",
    taxRate: 0,
    unit: "pcs",
    category: "general",
    isTaxable: true,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name.trim()) {
        setError("Item name is required");
        return;
      }

      if (!formData.price) {
        setError("Item price is required");
        return;
      }

      await createItem({
        ...formData,
        price: Number(formData.price),
        taxRate: Number(formData.taxRate),
      }).unwrap();

      setSuccess("Item created successfully");

      // reset form
      setFormData({
        name: "",
        description: "",
        sku: "",
        price: "",
        currency: "USD",
        taxRate: 0,
        unit: "pcs",
        category: "general",
        isTaxable: true,
      });
    } catch (err) {
      setError(err?.data?.message || "Failed to create item");
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <h4 className="mb-3">Create Item</h4>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={submitHandler}>
        <Row>
          {/* Name */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Item Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter item name"
              />
            </Form.Group>
          </Col>

          {/* SKU */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>SKU</Form.Label>
              <Form.Control
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="Optional SKU"
              />
            </Form.Group>
          </Col>

          {/* Price */}
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Price *</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </Form.Group>
          </Col>

          {/* Tax Rate */}
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Tax Rate (%)</Form.Label>
              <Form.Control
                type="number"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Unit */}
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Unit</Form.Label>
              <Form.Select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              >
                <option value="pcs">pcs</option>
                <option value="hour">hour</option>
                <option value="kg">kg</option>
                <option value="service">service</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Category */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Currency */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Currency</Form.Label>
              <Form.Select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Description */}
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>

          {/* Taxable */}
          <Col md={12}>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is Taxable"
                name="isTaxable"
                checked={formData.isTaxable}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Creating...
            </>
          ) : (
            "Create Item"
          )}
        </Button>
      </Form>
    </Card>
  );
};

export default CreateItemForm;