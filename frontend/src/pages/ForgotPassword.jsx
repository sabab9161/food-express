import { KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = ({ role = "user" }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isAdmin = role === "admin";
  const loginPath = isAdmin ? "/admin-login" : "/login";
  const resetPath = isAdmin ? "/admin/reset-password" : "/reset-password";

  const sendResetOtp = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", {
        email: normalizedEmail,
        role
      });
      toast.success(data.message || "Password reset OTP sent to email");
      navigate(resetPath, { state: { email: normalizedEmail, role } });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={sendResetOtp} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className={`grid h-12 w-12 place-items-center rounded-lg text-white ${isAdmin ? "bg-ink" : "bg-brand-500"}`}>
            <KeyRound />
          </div>
          <h1 className="mt-4 text-3xl font-black text-ink">{isAdmin ? "Admin Forgot Password" : "Forgot Password"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter your registered email address and we will send a password reset OTP.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Mail size={17} /> Email
          </span>
          <input
            className="input"
            type="email"
            placeholder={isAdmin ? "Admin email" : "Email"}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <button className="btn-primary mt-5 w-full" disabled={loading || !email.trim()}>
          {loading ? "Sending OTP..." : "Send Reset OTP"}
        </button>

        <p className="mt-5 text-center text-sm text-slate-600">
          Remembered your password?{" "}
          <Link className="font-bold text-brand-600" to={loginPath}>
            Back to login
          </Link>
        </p>
      </form>
    </section>
  );
};

export default ForgotPassword;
