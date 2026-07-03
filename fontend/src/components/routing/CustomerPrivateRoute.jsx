import { Navigate, Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const CustomerPrivateRoute = () => {
  const { customerInfo } = useSelector(
    (state) => state.customerAuth
  );

  const { slug } = useParams();

  return customerInfo ? (
    <Outlet />
  ) : (
    <Navigate to={`/${slug}/login`} replace />
  );
};

export default CustomerPrivateRoute;