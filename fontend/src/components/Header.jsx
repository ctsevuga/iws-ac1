import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";

import {
  FaUser,
  FaClipboardList,
  FaTools,
  FaPlusCircle,
  FaBuilding,
  FaEdit,
  FaBell,
  FaUsers,
  FaFileInvoiceDollar,
  FaList,
  FaGlobe,
  FaMapMarkedAlt,
  FaCity,
} from "react-icons/fa";

import { FaBoxOpen } from "react-icons/fa";

import { LinkContainer } from "react-router-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";

import { useGetUnreadNotificationCountQuery } from "../slices/notificationApiSlice";

import logo from "../assets/logo.png";

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const role = userInfo?.role;
  const companyName = userInfo?.company?.name;

  // =========================================================
  // NOTIFICATION COUNT
  // =========================================================
  const { data: notificationData } = useGetUnreadNotificationCountQuery(
    undefined,
    {
      skip: role !== "technician",
      pollingInterval: 30000,
    },
  );

  const unreadCount = notificationData?.unreadCount || 0;

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
  const canManageUsers = isManager;

  const canViewCustomers = isManager || isDispatcher || isTechnician;
  const canCreateCustomers = isManager || isDispatcher;

  const canViewTechnicians = isManager || isDispatcher;
  const canCreateTechnicians = isManager || isDispatcher;

  const canViewServiceRequests = isManager || isDispatcher || isTechnician;
  const canCreateServiceRequests = isManager || isDispatcher;

  const canViewJobs = isManager || isDispatcher || isTechnician;
  const canCreateJobs = isManager || isDispatcher;

  const canViewInvoices = isManager || isDispatcher;

  const canViewItems = isManager || isDispatcher;
  const canCreateItem = isManager || isDispatcher;

  const canAccessCustomerPortal = isManager || isDispatcher;

  const canViewAreas = isAdmin || isManager || isDispatcher || isTechnician;
  const canCreateAreas = isAdmin || isManager;

  const canViewCities = isAdmin || isManager || isDispatcher || isTechnician;
  const canCreateCities = isAdmin || isManager;

  const canManageCompanyModule = isManager;
  // =========================================================
  // BILLING & SUBSCRIPTION MODULES
  // =========================================================

  const canAccessSubscription = isAdmin;
  const canAccessBillingDashboard = isAdmin;
  const canAccessBillingAdministration = isAdmin;
  const canAccessCompanyBilling = isManager;

  // =========================================================
  // LOGOUT
  // =========================================================
  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        <Container>
          {/* ================= LOGO ================= */}
          <LinkContainer to="/home">
            <Navbar.Brand className="d-flex align-items-center">
              <img
                src={logo}
                alt="Logo"
                style={{ width: "40px", marginRight: "10px" }}
              />

              <div className="d-flex flex-column">
                <span style={{ fontWeight: "600", lineHeight: "1.1" }}>
                  Service Management
                </span>

                {companyName && (
                  <small style={{ fontSize: "12px", opacity: 0.9 }}>
                    {companyName}
                  </small>
                )}
              </div>
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle />

          <Navbar.Collapse>
            <Nav className="ms-auto">
              {/* ================= ADMIN ================= */}
              {isAdmin && (
                <NavDropdown title="Admin" id="adminmenu">
                  <LinkContainer to="/companies">
                    <NavDropdown.Item>
                      <FaBuilding className="me-2" />
                      Companies
                    </NavDropdown.Item>
                  </LinkContainer>

                  <NavDropdown.Divider />

                  {/* CITIES (ADMIN) */}
                  {canViewCities && (
                    <LinkContainer to="/cities">
                      <NavDropdown.Item>
                        <FaCity className="me-2" />
                        Cities
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canCreateCities && (
                    <LinkContainer to="/cities/create">
                      <NavDropdown.Item>
                        <FaPlusCircle className="me-2" />
                        Create City
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  <NavDropdown.Divider />

                  {/* AREAS */}
                  {canViewAreas && (
                    <LinkContainer to="/areas">
                      <NavDropdown.Item>
                        <FaMapMarkedAlt className="me-2" />
                        Areas
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canCreateAreas && (
                    <LinkContainer to="/areas/create">
                      <NavDropdown.Item>
                        <FaPlusCircle className="me-2" />
                        Create Area
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}
                </NavDropdown>
              )}

              {/* ================= BILLING ================= */}
              {(canAccessBillingDashboard ||
                canAccessSubscription ||
                canAccessBillingAdministration ||
                canAccessCompanyBilling) && (
                <NavDropdown title="Billing" id="billingmenu">
                  {/* ADMIN MODULES */}

                  {canAccessBillingDashboard && (
                    <LinkContainer to="/billing-dashboard">
                      <NavDropdown.Item>
                        <FaClipboardList className="me-2" />
                        Billing Dashboard
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canAccessSubscription && (
                    <LinkContainer to="/subscriptions">
                      <NavDropdown.Item>
                        <FaList className="me-2" />
                        Subscriptions
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canAccessBillingAdministration && (
                    <LinkContainer to="/billing/invoices">
                      <NavDropdown.Item>
                        <FaFileInvoiceDollar className="me-2" />
                        Billing Invoices
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {/* MANAGER MODULE */}

                  {canAccessCompanyBilling && (
                    <>
                      {(canAccessBillingDashboard ||
                        canAccessSubscription ||
                        canAccessBillingAdministration) && (
                        <NavDropdown.Divider />
                      )}

                      <LinkContainer to="/company-billing/invoices">
                        <NavDropdown.Item>
                          <FaFileInvoiceDollar className="me-2" />
                          My Billing
                        </NavDropdown.Item>
                      </LinkContainer>
                    </>
                  )}
                </NavDropdown>
              )}

              {/* ================= OPERATIONS ================= */}
              {(isManager || isDispatcher || isTechnician) && (
                <NavDropdown title="Operations" id="opsmenu">
                  {/* COMPANY */}
                  {canManageCompanyModule && (
                    <>
                      <LinkContainer to="/company/profile">
                        <NavDropdown.Item>
                          <FaBuilding className="me-2" />
                          Company Profile
                        </NavDropdown.Item>
                      </LinkContainer>

                      <LinkContainer to="/company/edit">
                        <NavDropdown.Item>
                          <FaEdit className="me-2" />
                          Edit Company
                        </NavDropdown.Item>
                      </LinkContainer>

                      <NavDropdown.Divider />
                    </>
                  )}

                  {/* CUSTOMER PORTAL */}
                  {canAccessCustomerPortal && (
                    <>
                      <LinkContainer to="/customer-portal">
                        <NavDropdown.Item>
                          <FaGlobe className="me-2" />
                          Customer Portal
                        </NavDropdown.Item>
                      </LinkContainer>

                      <NavDropdown.Divider />
                    </>
                  )}

                  {/* JOBS */}
                  {canViewJobs && (
                    <LinkContainer to="/jobs">
                      <NavDropdown.Item>
                        <FaClipboardList className="me-2" />
                        Jobs
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canCreateJobs && (
                    <LinkContainer to="/jobs/create">
                      <NavDropdown.Item>
                        <FaPlusCircle className="me-2" />
                        Create Job
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  <NavDropdown.Divider />

                  {/* SERVICE REQUESTS */}
                  {canViewServiceRequests && (
                    <LinkContainer to="/service-requests">
                      <NavDropdown.Item>
                        <FaClipboardList className="me-2" />
                        Service Requests
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canCreateServiceRequests && (
                    <LinkContainer to="/service-requests/create">
                      <NavDropdown.Item>
                        <FaPlusCircle className="me-2" />
                        Create Request
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  <NavDropdown.Divider />

                  {/* CUSTOMERS */}
                  {canViewCustomers && (
                    <LinkContainer to="/customers">
                      <NavDropdown.Item>
                        <FaUsers className="me-2" />
                        Customers
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canCreateCustomers && (
                    <LinkContainer to="/customers/create">
                      <NavDropdown.Item>
                        <FaPlusCircle className="me-2" />
                        Create Customer
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  <NavDropdown.Divider />

                  {/* TECHNICIANS */}
                  {canViewTechnicians && (
                    <LinkContainer to="/technicians">
                      <NavDropdown.Item>
                        <FaTools className="me-2" />
                        Technicians
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canCreateTechnicians && (
                    <LinkContainer to="/technicians/create">
                      <NavDropdown.Item>
                        <FaPlusCircle className="me-2" />
                        Create Technician
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  <NavDropdown.Divider />

                  {/* ITEMS */}
                  {canViewItems && (
                    <LinkContainer to="/items">
                      <NavDropdown.Item>
                        <FaBoxOpen className="me-2" />
                        Items
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  {canCreateItem && (
                    <LinkContainer to="/items/create">
                      <NavDropdown.Item>
                        <FaPlusCircle className="me-2" />
                        Create Item
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  <NavDropdown.Divider />

                  {/* INVOICES */}
                  {canViewInvoices && (
                    <LinkContainer to="/invoices">
                      <NavDropdown.Item>
                        <FaFileInvoiceDollar className="me-2" />
                        Invoices
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}

                  <NavDropdown.Divider />

                  {/* USERS */}
                  {canManageUsers && (
                    <LinkContainer to="/manager/users">
                      <NavDropdown.Item>
                        <FaUsers className="me-2" />
                        Manage Users
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}
                </NavDropdown>
              )}
              {/* ================= NOTIFICATIONS ================= */}
              {isTechnician && (
                <LinkContainer to="/notifications">
                  <Nav.Link
                    className="d-flex align-items-center position-relative me-3"
                    title="Notifications"
                  >
                    <FaBell size={20} />

                    {/* Count beside bell */}
                    <span className="ms-2 fw-semibold">{unreadCount}</span>

                    {/* Red badge */}
                    {unreadCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{
                          fontSize: "0.65rem",
                          minWidth: "18px",
                        }}
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </Nav.Link>
                </LinkContainer>
              )}
              {/* ================= USER ================= */}
              {userInfo && (
                <NavDropdown title={userInfo.name} id="user-menu">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>

                  <NavDropdown.Divider />

                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
