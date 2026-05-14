import { Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField";
import api from "../services/api";
import { getPasswordStatus, passwordErrorMessage } from "../utils/passwordValidation";

const ResetPassword = ({ role = "user" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const loginPath = isAdmin ? "/admin-login" : "/login";
  const forgotPath = isAdmin ? "/admin/forgot-password" : "/forgot-password";
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordStatus = getPasswordStatus(form.newPassword);
  const isFormInvalid =
    !form.email.trim() ||
    !form.otp.trim() ||
    !passwordStatus.isValid ||
    form.newPassword !== form.confirmPassword;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetPassword = async (event) => {
    event.preventDefault();

    if (!passwordStatus.isValid) {
      toast.error(passwordErrorMessage);
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Password and confirm password must match");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", {
        email: form.email.trim(),
        otp: form.otp.trim(),
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
        role
      });
      toast.success(data.message || "Password reset successful");
      navigate(loginPath, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={resetPassword} className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className={`grid h-12 w-12 place-items-center rounded-lg text-white ${isAdmin ? "bg-ink" : "bg-brand-500"}`}>
            <KeyRound />
          </div>
          <h1 className="mt-4 text-3xl font-black text-ink">{isAdmin ? "Reset Admin Password" : "Reset Password"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter the OTP sent to your email and choose a new strong password.
          </p>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Mail size={17} /> Email
            </span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">OTP</span>
            <input
              className="input"
              inputMode="numeric"
              maxLength={6}
              placeholder="6 digit OTP"
              value={form.otp}
              onChange={(event) => updateField("otp", event.target.value.replace(/\D/g, ""))}
              required
            />
          </label>

          <PasswordField
            label="New Password"
            value={form.newPassword}
            onChange={(event) => updateField("newPassword", event.target.value)}
            placeholder="Create a new strong password"
          />

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">Confirm Password</span>
            <div className="relative">
              <input
                className="input pr-12"
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                placeholder="Re-enter new password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 grid -translate-y-1/2 place-items-center text-slate-500 hover:text-ink"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <span className="mt-2 block text-xs font-bold text-red-600">Passwords do not match</span>
            )}
          </label>
        </div>

        <button className="btn-primary mt-6 w-full" disabled={loading || isFormInvalid}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link className="font-bold text-brand-600" to={forgotPath}>
            Send OTP again
          </Link>
          <Link className="font-bold text-brand-600" to={loginPath}>
            Back to login
          </Link>
        </div>
      </form>
    </section>
  );
};

export default ResetPassword;
