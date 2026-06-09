import { Building2, Eye, EyeOff, MapPin, Phone, ShieldPlus, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getPasswordStatus, passwordChecklist, passwordErrorMessage } from "../utils/passwordValidation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;

const strengthStyles = {
  Weak: "bg-red-50 text-red-700",
  Medium: "bg-amber-50 text-amber-700",
  Strong: "bg-emerald-50 text-emerald-700"
};

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [restaurantData, setRestaurantData] = useState({
    restaurantName: "",
    restaurantAddress: "",
    city: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const normalizedPassword = formData.password.trim();
  const passwordStatus = getPasswordStatus(normalizedPassword);
  const isEmailValid = emailPattern.test(formData.email.trim());
  const isPhoneValid = phonePattern.test(formData.phone.trim());

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRestaurantChange = (event) => {
    const { name, value } = event.target;
    setRestaurantData((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const requiredFields = [
      formData.name,
      formData.email,
      formData.phone,
      formData.password,
      formData.confirmPassword,
      restaurantData.restaurantName,
      restaurantData.restaurantAddress,
      restaurantData.city
    ];

    if (requiredFields.some((value) => !value.trim())) {
      toast.error("All fields are required");
      return false;
    }

    if (!isEmailValid) {
      toast.error("Enter a valid email address");
      return false;
    }

    if (!isPhoneValid) {
      toast.error("Enter valid 10 digit Indian mobile number");
      return false;
    }

    if (!passwordStatus.isValid) {
      toast.error(passwordErrorMessage);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    console.log("Password:", formData.password);
    console.log("Confirm Password:", formData.confirmPassword);

    if ((formData.password || "") !== (formData.confirmPassword || "")) {
      toast.error("Password and confirm password do not match");
      return;
    }

    if (!validate()) return;

    const adminData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: normalizedPassword,
      confirmPassword: formData.confirmPassword.trim(),
      restaurantName: restaurantData.restaurantName.trim(),
      restaurantAddress: restaurantData.restaurantAddress.trim(),
      city: restaurantData.city.trim()
    };

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/admin-register", adminData);
      setSession(data);
      toast.success("Account created successfully");
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-slate-50 py-10">
      <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-lg bg-ink p-8 text-white shadow-soft">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-brand-500">
            <ShieldPlus size={30} />
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight">Partner admin onboarding</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Create a restaurant admin account to manage menu items, track orders, and update delivery status from the FoodExpress dashboard.
          </p>
          <div className="mt-8 grid gap-4">
            {[
              [Building2, "Restaurant profile", "Register the restaurant name, address, and operating city."],
              [ShieldPlus, "Admin access", "Create an admin account with a secure password."],
              [MapPin, "Local operations", "Keep orders organized by restaurant location."]
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <Icon className="text-brand-500" />
                <h2 className="mt-3 font-black">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft md:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-brand-600">Admin Signup</p>
              <h2 className="mt-1 text-3xl font-black text-ink">Create restaurant admin account</h2>
              <p className="mt-2 text-sm text-slate-600">All fields are required for admin access.</p>
            </div>
            <Link to="/admin-login" className="btn-secondary shrink-0 py-2">
              Admin Login
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block" htmlFor="admin-signup-name">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <UserRound size={17} /> Full Name
              </span>
              <input
                id="admin-signup-name"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Sarah Johnson"
                required
              />
            </label>

            <label className="block" htmlFor="admin-signup-email">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
              <input
                id="admin-signup-email"
                name="email"
                className="input"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="admin@restaurant.com"
                required
              />
            </label>

            <label className="block" htmlFor="admin-signup-phone">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Phone size={17} /> Phone Number
              </span>
              <input
                id="admin-signup-phone"
                name="phone"
                className="input"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                placeholder="9876543210"
                required
              />
              {formData.phone && !isPhoneValid && (
                <span className="mt-2 block text-xs font-bold text-red-600">Enter valid 10 digit Indian mobile number</span>
              )}
            </label>

            <label className="block" htmlFor="restaurantName">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Building2 size={17} /> Restaurant Name
              </span>
              <input
                id="restaurantName"
                name="restaurantName"
                className="input"
                value={restaurantData.restaurantName}
                onChange={handleRestaurantChange}
                autoComplete="organization"
                placeholder="Urban Spice Kitchen"
                required
              />
            </label>

            <label className="block md:col-span-2" htmlFor="restaurantAddress">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <MapPin size={17} /> Restaurant Address
              </span>
              <input
                id="restaurantAddress"
                name="restaurantAddress"
                className="input"
                value={restaurantData.restaurantAddress}
                onChange={handleRestaurantChange}
                autoComplete="street-address"
                placeholder="120 Market Street, Suite 4"
                required
              />
            </label>

            <label className="block" htmlFor="city">
              <span className="mb-2 block text-sm font-bold text-slate-700">City</span>
              <input
                id="city"
                name="city"
                className="input"
                value={restaurantData.city}
                onChange={handleRestaurantChange}
                autoComplete="address-level2"
                placeholder="San Francisco"
                required
              />
            </label>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="admin-signup-password" className="text-sm font-bold text-slate-700">
                  Password
                </label>
                <span className={`rounded-md px-2 py-1 text-xs font-black ${strengthStyles[passwordStatus.strength]}`}>
                  {passwordStatus.strength}
                </span>
              </div>
              <div className="relative">
                <input
                  id="admin-signup-password"
                  name="password"
                  className="input pr-12"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 grid -translate-y-1/2 place-items-center text-slate-500 hover:text-ink"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-2">
                {passwordChecklist.map((item) => {
                  const isMet = passwordStatus.checks[item.key];
                  return (
                    <div key={item.key} className={isMet ? "text-emerald-700" : "text-slate-500"}>
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <label className="block" htmlFor="confirmPassword">
              <span className="mb-2 block text-sm font-bold text-slate-700">Confirm Password</span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className="input"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Confirm password"
                required
              />
              {formData.confirmPassword && (formData.password || "") !== (formData.confirmPassword || "") && (
                <span className="mt-2 block text-xs font-bold text-red-600">Password and confirm password do not match</span>
              )}
            </label>
          </div>

          <button type="submit" className="btn-primary mt-7 w-full" disabled={isSubmitting}>
            Create Account
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Signing up as a customer?{" "}
            <Link className="font-bold text-brand-600" to="/register">
              User Signup
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default AdminSignup;
