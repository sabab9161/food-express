import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/admin-login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return children || <Outlet />;
};

export default AdminRoute;
