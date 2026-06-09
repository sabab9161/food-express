import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  getPasswordStatus,
  passwordChecklist,
  passwordErrorMessage,
} from "../utils/passwordValidation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;

const strengthStyles = {
  Weak: "bg-red-50 text-red-700",
  Medium: "bg-amber-50 text-amber-700",
  Strong: "bg-emerald-50 text-emerald-700",
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const passwordStatus = getPasswordStatus(formData.password.trim());
  const isEmailValid = emailPattern.test(formData.email.trim());
  const isPhoneValid = phonePattern.test(formData.phone.trim());

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const password = formData.password.trim();
    const confirmPassword = formData.confirmPassword.trim();

    if (!formData.name.trim()) {
      toast.error("Name is required");
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

    if (password !== confirmPassword) {
      toast.error("Password and confirm password do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;
    if (!validateForm()) return;

    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim(),
    };

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", registrationData);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft"
      >
        <div className="mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white">
            <UserPlus />
          </div>
          <h1 className="mt-4 text-3xl font-black text-ink">User Signup</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create a customer account with your email and password.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <input
            id="name"
            name="name"
            className="input sm:col-span-2"
            type="text"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            required
          />

          <input
            id="email"
            name="email"
            className="input"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <div>
            <input
              id="phone"
              name="phone"
              className="input"
              type="tel"
              placeholder="10 digit mobile number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              required
            />
            {formData.phone && !isPhoneValid && (
              <span className="mt-2 block text-xs font-bold text-red-600">
                Enter valid 10 digit Indian mobile number
              </span>
            )}
          </div>

          <div className="sm:col-span-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="password" className="text-sm font-bold text-slate-700">
                Password
              </label>

              <span
                className={`rounded-md px-2 py-1 text-xs font-black ${
                  strengthStyles[passwordStatus.strength]
                }`}
              >
                {passwordStatus.strength}
              </span>
            </div>

            <div className="relative">
              <input
                id="password"
                name="password"
                className="input pr-12"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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
                  <div
                    key={item.key}
                    className={isMet ? "text-emerald-700" : "text-slate-500"}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-bold text-slate-700"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              className="input"
              type="password"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />

            {formData.confirmPassword.trim() &&
              formData.password.trim() !== formData.confirmPassword.trim() && (
                <span className="mt-2 block text-xs font-bold text-red-600">
                  Password and confirm password do not match
                </span>
              )}
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary mt-5 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link className="font-bold text-brand-600" to="/login">
            Login
          </Link>
        </p>
      </form>
    </section>
  );
};

export default Register;
