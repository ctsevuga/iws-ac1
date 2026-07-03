import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../slices/authSlice";

import { Container, Row, Col, Card } from "react-bootstrap";

import {
  FaUsers,
  FaClipboardList,
  FaTools,
  FaPlusCircle,
  FaUser,
  FaSignOutAlt,
  FaBuilding,
  FaBell,
  FaFileInvoiceDollar,
  FaBoxOpen,
  FaList,
  FaEdit,
  FaSignInAlt,
  FaUserPlus,
  FaIdCard,
  FaGlobe, // add this
} from "react-icons/fa";

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const role = userInfo?.role;

  // =========================================================
  // ROLE FLAGS
  // =========================================================

  const isAdmin = role === "admin";
  const isManager = role === "manager";
  const isDispatcher = role === "dispatcher";
  const isTechnician = role === "technician";

  // =========================================================
  // ACCESS CONTROL
  // =========================================================

  const canManageCompanies = isAdmin;
  const canManageUsers = isManager;

  const canViewServiceRequests = isManager || isDispatcher || isTechnician;

  const canCreateServiceRequest = isManager || isDispatcher;

  const canEditServiceRequest = isManager || isDispatcher;

  const canConvertServiceRequest = isManager || isDispatcher;

  const canCloseServiceRequest = isManager || isDispatcher;

  const canViewCustomers = isManager || isDispatcher || isTechnician;

  const canCreateCustomer = isManager || isDispatcher;

  const canViewTechnicians = isManager || isDispatcher;

  const canCreateTechnician = isManager || isDispatcher;

  const canViewNotifications = isManager || isDispatcher || isTechnician;

  const canViewJobs = isManager || isDispatcher || isTechnician;

  const canCreateJobs = isManager || isDispatcher;

  const canViewInvoices = isManager || isDispatcher;

  const canCreateInvoice = isManager || isDispatcher;

  const canEditInvoice = isManager || isDispatcher;

  const canUpdateInvoiceStatus = isManager || isDispatcher;

  const canViewItems = isManager || isDispatcher;

  const canCreateItem = isManager || isDispatcher;
  const canAccessCustomerPortal = isManager || isDispatcher;

  const canViewAreas =
  isAdmin || isManager || isDispatcher || isTechnician;

const canCreateArea = isAdmin || isManager;

const canViewCities =
  isAdmin || isManager || isDispatcher || isTechnician;

const canCreateCity = isAdmin || isManager;

  // =========================================================
  // CUSTOMER TENANT SLUG
  // =========================================================

  const getSlug = () => {
    const host = window.location.hostname;
    const parts = host.split(".");
    return parts.length > 1 ? parts[0] : "company";
  };

  const slug = getSlug();

  // =========================================================
  // LOGOUT
  // =========================================================

  const logoutHandler = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  // =========================================================
  // BUTTON COMPONENT
  // =========================================================

  const GradientButton = ({ title, icon, onClick, gradient }) => (
    <Card
      className="option-card text-center p-3 shadow-sm h-100"
      style={{
        background: gradient,
        border: "none",
        color: "white",
        borderRadius: "12px",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <div className="d-flex flex-column align-items-center justify-content-center">
        <div style={{ fontSize: "1.8rem" }}>{icon}</div>
        <h6 className="fw-bold mb-0 mt-2">{title}</h6>
      </div>
    </Card>
  );

  // =========================================================
  // BUTTONS
  // =========================================================

  const buttons = [
    {
      title: "Profile",
      icon: <FaUser />,
      onClick: () => navigate("/profile"),
      gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
      show: true,
    },

    {
      title: "Companies",
      icon: <FaBuilding />,
      onClick: () => navigate("/companies"),
      gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
      show: canManageCompanies,
    },

    {
      title: "Company Profile",
      icon: <FaBuilding />,
      onClick: () => navigate("/company/profile"),
      gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
      show: canManageUsers,
    },
    {
      title: "Customer Portal",
      icon: <FaGlobe />,
      onClick: () => navigate("/customer-portal"),
      gradient: "linear-gradient(135deg, #4e54c8, #8f94fb)",
      show: canAccessCustomerPortal,
    },

    {
      title: "Edit Company",
      icon: <FaEdit />,
      onClick: () => navigate("/company/edit"),
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
      show: canManageUsers,
    },
    {
  title: "Cities",
  icon: <FaGlobe />,
  onClick: () => navigate("/cities"),
  gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
  show: canViewCities,
},
{
  title: "Create City",
  icon: <FaPlusCircle />,
  onClick: () => navigate("/cities/create"),
  gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
  show: canCreateCity,
},
    {
  title: "Areas",
  icon: <FaList />,
  onClick: () => navigate("/areas"),
  gradient: "linear-gradient(135deg, #4facfe, #00f2fe)",
  show: canViewAreas,
},
{
  title: "Create Area",
  icon: <FaPlusCircle />,
  onClick: () => navigate("/areas/create"),
  gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
  show: canCreateArea,
},

    {
      title: "Manage Users",
      icon: <FaUsers />,
      onClick: () => navigate("/manager/users"),
      gradient: "linear-gradient(135deg, #7f00ff, #e100ff)",
      show: canManageUsers,
    },

    {
      title: "Jobs",
      icon: <FaClipboardList />,
      onClick: () => navigate("/jobs"),
      gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
      show: canViewJobs,
    },

    {
      title: "Create Job",
      icon: <FaPlusCircle />,
      onClick: () => navigate("/jobs/create"),
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
      show: canCreateJobs,
    },

    {
      title: "Service Requests",
      icon: <FaClipboardList />,
      onClick: () => navigate("/service-requests"),
      gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
      show: canViewServiceRequests,
    },

    {
      title: "Create Request",
      icon: <FaPlusCircle />,
      onClick: () => navigate("/service-requests/create"),
      gradient: "linear-gradient(135deg, #ff9966, #ff5e62)",
      show: canCreateServiceRequest,
    },

    {
      title: "Customers",
      icon: <FaUsers />,
      onClick: () => navigate("/customers"),
      gradient: "linear-gradient(135deg, #00c6ff, #0072ff)",
      show: canViewCustomers,
    },

    {
      title: "Create Customer",
      icon: <FaPlusCircle />,
      onClick: () => navigate("/customers/create"),
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
      show: canCreateCustomer,
    },

    {
      title: "Technicians",
      icon: <FaTools />,
      onClick: () => navigate("/technicians"),
      gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
      show: canViewTechnicians,
    },

    {
      title: "Create Technician",
      icon: <FaPlusCircle />,
      onClick: () => navigate("/technicians/create"),
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
      show: canCreateTechnician,
    },

    {
      title: "Invoices",
      icon: <FaFileInvoiceDollar />,
      onClick: () => navigate("/invoices"),
      gradient: "linear-gradient(135deg, #667eea, #764ba2)",
      show: canViewInvoices,
    },

    {
      title: "Create Invoice",
      icon: <FaPlusCircle />,
      onClick: () => navigate("/invoices/create"),
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
      show: canCreateInvoice,
    },

    {
      title: "Items",
      icon: <FaBoxOpen />,
      onClick: () => navigate("/items"),
      gradient: "linear-gradient(135deg, #8e2de2, #4a00e0)",
      show: canViewItems,
    },

    {
      title: "Create Item",
      icon: <FaPlusCircle />,
      onClick: () => navigate("/items/create"),
      gradient: "linear-gradient(135deg, #11998e, #38ef7d)",
      show: canCreateItem,
    },

    {
      title: "Notifications",
      icon: <FaBell />,
      onClick: () => navigate("/notifications"),
      gradient: "linear-gradient(135deg, #ffb347, #ffcc33)",
      show: canViewNotifications,
    },

    {
      title: "Logout",
      icon: <FaSignOutAlt />,
      onClick: logoutHandler,
      gradient: "linear-gradient(135deg, #434343, #000000)",
      show: true,
    },
    // =========================================================
    // CUSTOMER SERVICE REQUEST MODULE
    // =========================================================
  ];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Container className="py-4 home-container">
      <div className="text-center mb-4">
        <h4 className="fw-bold text-primary">
          <FaUser className="me-2" />
          Welcome, {role?.toUpperCase()}
        </h4>
      </div>

      <Row className="g-3 justify-content-center">
        {buttons
          .filter((btn) => btn.show)
          .map((btn, index) => (
            <Col xs={6} md={4} lg={3} key={index}>
              <GradientButton {...btn} />
            </Col>
          ))}
      </Row>
    </Container>
  );
};

export default HomeScreen;
