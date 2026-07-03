// components/routing/RoleRoute.jsx

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const RoleRoute = ({
  allowedRoles = [],
}) => {
  const { userInfo } = useSelector(
    (state) => state.auth
  );

  // Not logged in
  if (!userInfo) {
    return (
      <Navigate to="/" replace />
    );
  }

  // Role denied
  if (
    !allowedRoles.includes(
      userInfo.role
    )
  ) {
    return (
      <Navigate
        to="/home"
        replace
      />
    );
  }

  return <Outlet />;
};

export default RoleRoute;