import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLayout from "./admin/AdminLayout";
import ManageFoods from "./admin/ManageFoods";
import ManageOrders from "./admin/ManageOrders";
import ManageRestaurants from "./admin/ManageRestaurants";
import ManageUsers from "./admin/ManageUsers";
import ManageAnalytics from "./admin/ManageAnalytics";
import ManageNotifications from "./admin/ManageNotifications";
import ManageReviews from "./admin/ManageReviews";
import ManageSettings from "./admin/ManageSettings";
import Coupons from "./admin/Coupons";
import DeliveryPartners from "./admin/DeliveryPartners";
import Payments from "./admin/Payments";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import FoodDetails from "./pages/FoodDetails";
import Foods from "./pages/Foods";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import RestaurantFoods from "./pages/RestaurantFoods";
import ResetPassword from "./pages/ResetPassword";

const CustomerLayout = () => (
  <>
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);

const App = () => {
  return (
    <Routes>
      <Route path="/admin/payments" element={<AdminRoute><AdminLayout><Payments /></AdminLayout></AdminRoute>} />
      <Route path="/admin/delivery-partners" element={<AdminRoute><AdminLayout><DeliveryPartners /></AdminLayout></AdminRoute>} />
      <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><Coupons /></AdminLayout></AdminRoute>} />

      <Route
        path="/admin"
        element={
          <AdminRoute />
        }
      >
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="restaurants" element={<ManageRestaurants />} />
          <Route path="foods" element={<ManageFoods />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="analytics" element={<ManageAnalytics />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="notifications" element={<ManageNotifications />} />
          <Route path="settings" element={<ManageSettings />} />
        </Route>
      </Route>

      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/foods" element={<Foods />} />
        <Route path="/restaurants/:id/foods" element={<RestaurantFoods />} />
        <Route path="/foods/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword role="user" />} />
        <Route path="/reset-password" element={<ResetPassword role="user" />} />
        <Route path="/admin/login" element={<Navigate to="/admin-login" replace />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword role="admin" />} />
        <Route path="/admin/reset-password" element={<ResetPassword role="admin" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<Navigate to="/admin-signup" replace />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
