import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  useGetItemDetailsQuery,
  useUpdateItemMutation,
} from "../../slices/itemApiSlice";

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: item, isLoading, error } = useGetItemDetailsQuery(id);
  const [updateItem, { isLoading: updating }] = useUpdateItemMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    currency: "USD",
    taxRate: 0,
    unit: "pcs",
    category: "general",
    isActive: true,
    isTaxable: true,
  });

  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Populate form when data loads
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        sku: item.sku || "",
        price: item.price ?? "",
        currency: item.currency || "USD",
        taxRate: item.taxRate ?? 0,
        unit: item.unit || "pcs",
        category: item.category || "general",
        isActive: item.isActive ?? true,
        isTaxable: item.isTaxable ?? true,
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSuccess(null);

    try {
      if (!formData.name.trim()) {
        setFormError("Item name is required");
        return;
      }

      if (formData.price === "" || formData.price === null) {
        setFormError("Item price is required");
        return;
      }

      await updateItem({
        itemId: id,
        ...formData,
        price: Number(formData.price),
        taxRate: Number(formData.taxRate),
      }).unwrap();

      setSuccess("Item updated successfully");

      setTimeout(() => {
        navigate("/items");
      }, 1000);
    } catch (err) {
      setFormError(err?.data?.message || "Failed to update item");
    }
  };

  return (
    <Card className="p-4 shadow-sm">
      <h4 className="mb-3">Edit Item</h4>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger">
          {error?.data?.message || "Failed to load item"}
        </Alert>
      )}

      {/* Form Error / Success */}
      {formError && <Alert variant="danger">{formError}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Form */}
      {item && (
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

            {/* Toggles */}
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Is Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </Col>

            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Is Taxable"
                name="isTaxable"
                checked={formData.isTaxable}
                onChange={handleChange}
              />
            </Col>
          </Row>

          {/* Actions */}
          <div className="d-flex gap-2 mt-3">
            <Button type="submit" disabled={updating}>
              {updating ? "Updating..." : "Update Item"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/items")}
            >
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Card>
  );
};

export default EditItem;