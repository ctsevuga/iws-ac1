import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";

import "./assets/styles/bootstrap.custom.css";
import "./assets/styles/index.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import store from "./store";

/**
 * Route Guards
 */
import PrivateRoute from "./components/routing/PrivateRoute";
import RoleRoute from "./components/routing/RoleRoute";
import CustomerPrivateRoute from "./components/routing/CustomerPrivateRoute";

/**
 * Auth Screens (Staff)
 */
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ChangePassword from "./screens/ChangePassword";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";

/**
 * Common Screens (Staff)
 */
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";

/**
 * Customer Auth Screens (Portal)
 */
import CustomerRegisterScreen from "./screens/customerAuth/CustomerRegisterScreen";
import CustomerLoginScreen from "./screens/customerAuth/CustomerLoginScreen";
import CustomerProfileScreen from "./screens/customerAuth/CustomerProfileScreen";
import CustomerProfileEditScreen from "./screens/customerAuth/CustomerProfileEditScreen";
import CustomerPortalDashboard from "./screens/customerAuth/CustomerPortalDashboard";
import CustomerForgotPasswordScreen from "./screens/customerAuth/CustomerForgotPasswordScreen";

/**
 * Customer Serice Screens (Portal)
 */
import CustomerCreateServiceRequestScreen from "./screens/customerService/CustomerCreateServiceRequestScreen";
import CustomerServiceRequestListScreen from "./screens/customerService/CustomerServiceRequestListScreen";
import CustomerServiceRequestDetailsScreen from "./screens/customerService/CustomerServiceRequestDetailsScreen";

/**
 * Customer Serice Screens (Portal)
 */
import CustomerPortalDashboardScreen from "./screens/customerPortal/CustomerPortalDashboardScreen";
import CustomerPortalSettingsScreen from "./screens/customerPortal/CustomerPortalSettingsScreen";
import CustomerPortalSettingsViewScreen from "./screens/customerPortal/CustomerPortalSettingsViewScreen";
import PortalSettingsEditScreen from "./screens/customerPortal/PortalSettingsEditScreen";
import AnnouncementsListScreen from "./screens/customerPortal/AnnouncementsListScreen";
import AddAnnouncementScreen from "./screens/customerPortal/AddAnnouncementScreen";
import ViewAnnouncementScreen from "./screens/customerPortal/ViewAnnouncementScreen";

/**
 * Company Screens
 */
import CompanyCreateScreen from "./screens/company/CompanyCreateScreen";
import CompanyDetailsScreen from "./screens/company/CompanyDetailsScreen";
import CompanyEditScreen from "./screens/company/CompanyEditScreen";
import CompanyListScreen from "./screens/company/CompanyListScreen";
import CompanyProfileScreen from "./screens/company/CompanyProfileScreen";
import StaffCompanyScreen from "./screens/company/StaffCompanyScreen";
import StaffCompanyEditScreen from "./screens/company/StaffCompanyEditScreen";

/**
 * City Screens
 */
import CreateCityForm from "./screens/city/CreateCityForm";
import CitiesList from "./screens/city/CitiesList";
import CityDetails from "./screens/city/CityDetails";
import UpdateCity from "./screens/city/UpdateCity";
/**
 * Area Screens
 */
import CreateAreaForm from "./screens/area/CreateAreaForm";
import AreasList from "./screens/area/AreasList";
import AreaDetails from "./screens/area/AreaDetails";
import UpdateArea from "./screens/area/UpdateArea";

/**
 * Customer Screens (Staff Module)
 */
import CustomerCreateScreen from "./screens/customer/CustomerCreateScreen";
import CustomerDetailsScreen from "./screens/customer/CustomerDetailsScreen";
import CustomerEditScreen from "./screens/customer/CustomerEditScreen";
import CustomerListScreen from "./screens/customer/CustomerListScreen";

/**
 * Technician Screens
 */
import TechnicianCreateScreen from "./screens/technician/TechnicianCreateScreen";
import TechnicianDetailsScreen from "./screens/technician/TechnicianDetailsScreen";
import TechnicianEditScreen from "./screens/technician/TechnicianEditScreen";
import TechnicianListScreen from "./screens/technician/TechnicianListScreen";
import TechnicianAvailabilityScreen from "./screens/technician/TechnicianAvailabilityScreen";
import TechnicianLocationScreen from "./screens/technician/TechnicianLocationScreen";

/**
 * Service Requests
 */
import CreateServiceRequest from "./screens/serviceRequest/CreateServiceRequest";
import ServiceRequestDetailsScreen from "./screens/serviceRequest/ServiceRequestDetailsScreen";
import ServiceRequestList from "./screens/serviceRequest/ServiceRequestList";
import EditServiceRequestScreen from "./screens/serviceRequest/EditServiceRequestScreen";
import ConvertServiceRequestScreen from "./screens/serviceRequest/ConvertServiceRequestScreen";
import CloseServiceRequest from "./screens/serviceRequest/CloseServiceRequest";
import AssignTechnician from "./screens/serviceRequest/AssignTechnician";

/**
 * Notifications
 */
import NotificationsListScreen from "./screens/notification/NotificationsListScreen";
import NotificationDetailsScreen from "./screens/notification/NotificationDetailsScreen";

/**
 * Jobs
 */
import JobCreateForm from "./screens/job/JobCreateForm";
import JobListScreen from "./screens/job/JobListScreen";
import JobDetailsScreen from "./screens/job/JobDetailsScreen";
import JobEditScreen from "./screens/job/JobEditScreen";
import JobStatusUpdateScreen from "./screens/job/JobStatusUpdateScreen";
import AcceptServiceRequestScreen from "./screens/job/AcceptServiceRequestScreen";

/**
 * Invoices
 */
import CreateInvoiceScreen from "./screens/invoice/CreateInvoiceScreen";
import InvoiceListScreen from "./screens/invoice/InvoiceListScreen";
import InvoiceDetailsScreen from "./screens/invoice/InvoiceDetailsScreen";
import InvoiceEditScreen from "./screens/invoice/InvoiceEditScreen";
import InvoiceStatusScreen from "./screens/invoice/InvoiceStatusScreen";

/**
 * Items
 */
import CreateItemForm from "./screens/item/CreateItemForm";
import ItemDetails from "./screens/item/ItemDetails";
import ItemList from "./screens/item/ItemList";
import EditItem from "./screens/item/EditItem";

/**
 * Manager Module
 */
import UserListScreen from "./screens/manager/UserListScreen";
import CreateUserScreen from "./screens/manager/CreateUserScreen";
import AssignUserRoleScreen from "./screens/manager/AssignUserRoleScreen";

/**
 * Subscription Module
 */
import SubscriptionCreateScreen from "./screens/subscription/SubscriptionCreateScreen";
import SubscriptionDetailsScreen from "./screens/subscription/SubscriptionDetailsScreen";
import SubscriptionEditScreen from "./screens/subscription/SubscriptionEditScreen";
import SubscriptionDashboardScreen from "./screens/Dashboards/SubscriptionDashboardScreen";
/**
 * Billing Module
 */
import GenerateInvoiceScreen from "./screens/billing/GenerateInvoiceScreen";
import BillingInvoiceDetailsScreen from "./screens/billing/BillingInvoiceDetailsScreen";

import BillingInvoiceListScreen from "./screens/billing/BillingInvoiceListScreen";
import InvoiceRegenerateScreen from "./screens/billing/InvoiceRegenerateScreen";

/**
 * Billing Dashboard Modeules
 */
import BillingDashboardScreen from "./screens/billingDashboard/BillingDashboardScreen";
import CompanyBillingHistoryScreen from "./screens/billingDashboard/CompanyBillingHistoryScreen";
import MonthlyRevenueScreen from "./screens/billingDashboard/MonthlyRevenueScreen";
import OutstandingInvoicesScreen from "./screens/billingDashboard/OutstandingInvoicesScreen";

/**
 * Company Billing Modeules
 */
import CurrentPlanScreen from "./screens/companyBilling/CurrentPlanScreen";
import CurrentUsageScreen from "./screens/companyBilling/CurrentUsageScreen";
import MyInvoicesScreen from "./screens/companyBilling/MyInvoicesScreen";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* =====================================================
          PUBLIC STAFF ROUTES
      ===================================================== */}
      <Route index element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/forgot-password" element={<ForgotPasswordScreen />} />

      {/* =====================================================
          CUSTOMER PUBLIC ROUTES (MULTI-TENANT)
      ===================================================== */}
      <Route path="/:slug" element={<CustomerLoginScreen />} />

      <Route path="/:slug/register" element={<CustomerRegisterScreen />} />
      <Route
        path="/:slug/forget-password"
        element={<CustomerForgotPasswordScreen />}
      />

      {/* =====================================================
    CUSTOMER PROTECTED ROUTES (MULTI-TENANT)
===================================================== */}
      <Route element={<CustomerPrivateRoute />}>
        {/* Profile */}
        <Route path="/:slug/profile" element={<CustomerProfileScreen />} />

        <Route
          path="/:slug/profile/edit"
          element={<CustomerProfileEditScreen />}
        />

        {/* =========================================
      SERVICE REQUEST MODULE (CUSTOMER PORTAL)
  ========================================= */}

        {/* Create Service Request */}
        <Route
          path="/:companySlug/service-requests/create"
          element={<CustomerCreateServiceRequestScreen />}
        />

        {/* List Service Requests */}
        <Route
          path="/:companySlug/service-requests"
          element={<CustomerServiceRequestListScreen />}
        />

        {/* Service Request Details */}
        <Route
          path="/:companySlug/service-requests/:id"
          element={<CustomerServiceRequestDetailsScreen />}
        />

        {/* Customer Dashboard */}
        <Route path="/:slug/dashboard" element={<CustomerPortalDashboard />} />
      </Route>

      {/* =====================================================
    CUSTOMER PORTAL MODULE
===================================================== */}

      {/* Dashboard + View */}
      <Route element={<RoleRoute allowedRoles={["manager", "dispatcher"]} />}>
        <Route
          path="/customer-portal"
          element={<CustomerPortalDashboardScreen />}
        />

        <Route
          path="/customer-portal/view"
          element={<CustomerPortalSettingsViewScreen />}
        />
        <Route path="/announcements/add" element={<AddAnnouncementScreen />} />
        <Route path="/announcementList" element={<AnnouncementsListScreen />} />
        <Route path="/announcements/:id" element={<ViewAnnouncementScreen />} />
      </Route>

      {/* Create + Edit (Manager Only) */}
      <Route element={<RoleRoute allowedRoles={["manager"]} />}>
        <Route
          path="/customer-portal/create"
          element={<CustomerPortalSettingsScreen />}
        />

        <Route
          path="/customer-portal/edit"
          element={<PortalSettingsEditScreen />}
        />
      </Route>

      {/* =====================================================
          AUTHENTICATED STAFF ROUTES
      ===================================================== */}
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        {/* =====================================================
            NOTIFICATIONS MODULE
        ===================================================== */}
        <Route
          element={
            <RoleRoute allowedRoles={["technician", "manager", "dispatcher"]} />
          }
        >
          <Route path="/notifications" element={<NotificationsListScreen />} />
          <Route
            path="/notifications/:id"
            element={<NotificationDetailsScreen />}
          />
        </Route>
        {/* =====================================================
            SERVICE REQUESTS
        ===================================================== */}
        <Route
          element={
            <RoleRoute allowedRoles={["manager", "dispatcher", "technician"]} />
          }
        >
          <Route path="/service-requests" element={<ServiceRequestList />} />
          <Route
            path="/service-requests/:id"
            element={<ServiceRequestDetailsScreen />}
          />
        </Route>
        <Route element={<RoleRoute allowedRoles={["manager", "dispatcher"]} />}>
          <Route
            path="/service-requests/create"
            element={<CreateServiceRequest />}
          />
          <Route
            path="/service-requests/:id/edit"
            element={<EditServiceRequestScreen />}
          />
          <Route
            path="/service-requests/:id/convert"
            element={<ConvertServiceRequestScreen />}
          />
          <Route
            path="/service-requests/:id/close"
            element={<CloseServiceRequest />}
          />
          <Route
            path="/service-requests/:id/assign"
            element={<AssignTechnician />}
          />
        </Route>
        {/* =====================================================
            JOBS MODULE
        ===================================================== */}
        <Route
          element={
            <RoleRoute
              allowedRoles={["admin", "manager", "dispatcher", "technician"]}
            />
          }
        >
          <Route path="/jobs" element={<JobListScreen />} />
          <Route path="/jobs/:id" element={<JobDetailsScreen />} />
          <Route path="/jobs/:id/status" element={<JobStatusUpdateScreen />} />
        </Route>
        <Route
          element={
            <RoleRoute allowedRoles={["admin", "manager", "dispatcher"]} />
          }
        >
          <Route path="/jobs/create" element={<JobCreateForm />} />
          <Route path="/jobs/:id/edit" element={<JobEditScreen />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["technician"]} />}>
          <Route
            path="/jobs/accept/:serviceRequestId"
            element={<AcceptServiceRequestScreen />}
          />
        </Route>
        {/* =====================================================
            INVOICES MODULE
        ===================================================== */}
        <Route element={<RoleRoute allowedRoles={["manager", "dispatcher"]} />}>
          <Route path="/invoices" element={<InvoiceListScreen />} />
          <Route path="/invoices/create" element={<CreateInvoiceScreen />} />
          <Route path="/invoices/:id" element={<InvoiceDetailsScreen />} />
          <Route path="/invoices/:id/edit" element={<InvoiceEditScreen />} />
          <Route
            path="/invoices/:id/status"
            element={<InvoiceStatusScreen />}
          />
        </Route>
        {/* =====================================================
            ITEMS MODULE
        ===================================================== */}
        <Route element={<RoleRoute allowedRoles={["manager", "dispatcher"]} />}>
          <Route path="/items" element={<ItemList />} />
          <Route path="/items/create" element={<CreateItemForm />} />
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route path="/items/:id/edit" element={<EditItem />} />
        </Route>
        {/* =====================================================
            ADMIN MODULE
        ===================================================== */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/companies" element={<CompanyListScreen />} />
          <Route path="/companies/create" element={<CompanyCreateScreen />} />
          <Route path="/companies/:id" element={<CompanyDetailsScreen />} />
          <Route path="/companies/:id/edit" element={<CompanyEditScreen />} />
        </Route>
        {/* =====================================================
            BILLING DASHBOARD MODULE
        ===================================================== */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route
            path="/billing-dashboard"
            element={<BillingDashboardScreen />}
          />

          <Route
            path="/billing-dashboard/company/:companyId/history"
            element={<CompanyBillingHistoryScreen />}
          />

          <Route
            path="/billing-dashboard/monthly-revenue"
            element={<MonthlyRevenueScreen />}
          />

          <Route
            path="/billing-dashboard/outstanding-invoices"
            element={<OutstandingInvoicesScreen />}
          />
        </Route>
        {/* =====================================================
            SUBSCRIPTION MODULE
        ===================================================== */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route
            path="/subscriptions"
            element={<SubscriptionDashboardScreen />}
          />
          <Route
            path="/subscriptions/create"
            element={<SubscriptionCreateScreen />}
          />

          <Route
            path="/subscriptions/:companyId"
            element={<SubscriptionDetailsScreen />}
          />

          <Route
            path="/subscriptions/:companyId/edit"
            element={<SubscriptionEditScreen />}
          />
        </Route>
        {/* =====================================================
            BILLING MODULE
        ===================================================== */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/billing/invoices" element={<BillingInvoiceListScreen />} />

          <Route
  path="/billing/invoices/generate"
  element={<GenerateInvoiceScreen />}
/>

          <Route
            path="/billing/invoices/:invoiceId"
            element={<BillingInvoiceDetailsScreen />}
          />

          <Route
            path="/billing/invoices/:invoiceId/regenerate"
            element={<InvoiceRegenerateScreen />}
          />
        </Route>
        {/* =====================================================
            MANAGER MODULE
        ===================================================== */}
        <Route element={<RoleRoute allowedRoles={["manager"]} />}>
          <Route path="/company/profile" element={<CompanyProfileScreen />} />
          <Route path="/company/edit" element={<CompanyEditScreen />} />
          <Route path="/company/staff" element={<StaffCompanyScreen />} />
          <Route
            path="/company/staff/edit"
            element={<StaffCompanyEditScreen />}
          />

          <Route path="/manager/users" element={<UserListScreen />} />
          <Route path="/manager/create-user" element={<CreateUserScreen />} />
          <Route
            path="/manager/users/assign-role"
            element={<AssignUserRoleScreen />}
          />
        </Route>
        {/* =====================================================
    COMPANY BILLING MODULE
===================================================== */}
        <Route element={<RoleRoute allowedRoles={["manager"]} />}>
          <Route
            path="/company-billing/current-plan"
            element={<CurrentPlanScreen />}
          />

          <Route
            path="/company-billing/current-usage"
            element={<CurrentUsageScreen />}
          />

          <Route
            path="/company-billing/invoices"
            element={<MyInvoicesScreen />}
          />
        </Route>
        {/* =====================================================
    CITY MODULE
===================================================== */}
        /* View Cities */
        <Route
          element={
            <RoleRoute
              allowedRoles={["admin", "manager", "dispatcher", "technician"]}
            />
          }
        >
          <Route path="/cities" element={<CitiesList />} />
          <Route path="/cities/:id" element={<CityDetails />} />
        </Route>
        /* Create / Update Cities */
        <Route element={<RoleRoute allowedRoles={["admin", "manager"]} />}>
          <Route path="/cities/create" element={<CreateCityForm />} />
          <Route path="/cities/:id/edit" element={<UpdateCity />} />
        </Route>
        {/* =====================================================
    AREA MODULE
===================================================== */}
        {/* View Areas */}
        <Route
          element={
            <RoleRoute
              allowedRoles={["admin", "manager", "dispatcher", "technician"]}
            />
          }
        >
          <Route path="/areas" element={<AreasList />} />

          <Route path="/areas/:id" element={<AreaDetails />} />
        </Route>
        {/* Create / Update Areas */}
        <Route element={<RoleRoute allowedRoles={["admin", "manager"]} />}>
          <Route path="/areas/create" element={<CreateAreaForm />} />

          <Route path="/areas/:id/edit" element={<UpdateArea />} />
        </Route>
        {/* =====================================================
            CUSTOMER (STAFF MODULE)
        ===================================================== */}
        <Route
          element={
            <RoleRoute allowedRoles={["manager", "dispatcher", "technician"]} />
          }
        >
          <Route path="/customers" element={<CustomerListScreen />} />
          <Route path="/customers/:id" element={<CustomerDetailsScreen />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["manager", "dispatcher"]} />}>
          <Route path="/customers/create" element={<CustomerCreateScreen />} />
          <Route path="/customers/:id/edit" element={<CustomerEditScreen />} />
        </Route>
        {/* =====================================================
            TECHNICIAN MODULE
        ===================================================== */}
        <Route element={<RoleRoute allowedRoles={["manager", "dispatcher"]} />}>
          <Route path="/technicians" element={<TechnicianListScreen />} />
          <Route
            path="/technicians/create"
            element={<TechnicianCreateScreen />}
          />
          <Route
            path="/technicians/:id"
            element={<TechnicianDetailsScreen />}
          />
          <Route
            path="/technicians/:id/edit"
            element={<TechnicianEditScreen />}
          />
        </Route>
        <Route
          element={
            <RoleRoute allowedRoles={["manager", "dispatcher", "technician"]} />
          }
        >
          <Route
            path="/technicians/:id/availability"
            element={<TechnicianAvailabilityScreen />}
          />
          <Route
            path="/technicians/:id/location"
            element={<TechnicianLocationScreen />}
          />
        </Route>
      </Route>
    </Route>,
  ),
);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);

reportWebVitals();
