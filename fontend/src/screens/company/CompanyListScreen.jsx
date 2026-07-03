import React, { useState } from "react";

import {
  Table,
  Button,
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Badge,
  Pagination,
} from "react-bootstrap";

import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaBuilding,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useGetCompaniesQuery,
  useDeleteCompanyMutation,
} from "../../slices/companyApiSlice";

const CompanyListScreen = () => {
  const navigate = useNavigate();

  const [pageNumber, setPageNumber] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useGetCompaniesQuery({
    page: pageNumber,
    limit,
  });

  const [deleteCompany, { isLoading: loadingDelete }] =
    useDeleteCompanyMutation();

  // =========================
  // DELETE HANDLER
  // =========================
  const deleteHandler = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this company?"
    );

    if (!confirmDelete) return;

    try {
      await deleteCompany(id).unwrap();
      toast.success("Company deleted successfully");
      refetch();
    } catch (err) {
      toast.error(
        err?.data?.message ||
          err?.error ||
          "Failed to delete company"
      );
    }
  };

  // =========================
  // PLAN BADGE COLOR
  // =========================
  const getPlanVariant = (plan) => {
    switch (plan) {
      case "enterprise":
        return "dark";
      case "pro":
        return "success";
      case "basic":
        return "primary";
      default:
        return "secondary";
    }
  };

  const companies = data?.companies || [];

  return (
    <Container className="py-4">
      {/* HEADER */}
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="fw-bold text-primary">
            <FaBuilding className="me-2" />
            Companies
          </h3>
        </Col>

        <Col className="text-end">
          <Button
            variant="primary"
            onClick={() => navigate("/companies/create")}
          >
            <FaPlus className="me-2" />
            Create Company
          </Button>
        </Col>
      </Row>

      {/* TABLE CARD */}
      <Card className="shadow-sm border-0">
        <Card.Body>
          {isLoading || loadingDelete ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <div className="text-danger text-center py-3">
              {error?.data?.message || "Something went wrong"}
            </div>
          ) : (
            <>
              <Table responsive hover bordered className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {companies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No companies found
                      </td>
                    </tr>
                  ) : (
                    companies.map((company) => (
                      <tr key={company._id}>
                        {/* COMPANY */}
                        <td>
                          <div className="fw-bold">
                            {company.name}
                          </div>

                          {company.legalName && (
                            <small className="text-muted">
                              {company.legalName}
                            </small>
                          )}

                          {/* NEW: slug (SaaS routing) */}
                          <div>
                            <small className="text-muted">
                              /{company.slug}
                            </small>
                          </div>

                          {/* OPTIONAL: domain */}
                          {company.domain && (
                            <div>
                              <small className="text-muted">
                                {company.domain}
                              </small>
                            </div>
                          )}
                        </td>

                        {/* CONTACT */}
                        <td>
                          <div>{company.email}</div>
                          <small className="text-muted">
                            {company.phone}
                          </small>
                        </td>

                        {/* LOCATION */}
                        <td>
                          <div>
                            {company?.address?.city}
                            {company?.address?.state &&
                              `, ${company.address.state}`}
                          </div>

                          <small className="text-muted">
                            {company?.address?.country}
                          </small>
                        </td>

                        {/* PLAN */}
                        <td>
                          <Badge bg={getPlanVariant(company.plan)}>
                            {company.plan?.toUpperCase()}
                          </Badge>
                        </td>

                        {/* STATUS */}
                        <td>
                          <Badge
                            bg={company.isActive ? "success" : "danger"}
                          >
                            {company.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>

                        {/* ACTIONS */}
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {/* VIEW (use slug preferred) */}
                            <Button
                              variant="light"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/companies/${company.slug || company._id}`
                                )
                              }
                            >
                              <FaEye />
                            </Button>

                            {/* EDIT */}
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/companies/${company._id}/edit`
                                )
                              }
                            >
                              <FaEdit />
                            </Button>

                            {/* DELETE */}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                deleteHandler(company._id)
                              }
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* PAGINATION */}
              {data?.pages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    {[...Array(data.pages).keys()].map((x) => (
                      <Pagination.Item
                        key={x + 1}
                        active={x + 1 === pageNumber}
                        onClick={() => setPageNumber(x + 1)}
                      >
                        {x + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CompanyListScreen;