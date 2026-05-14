import { LogIn } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import OtpVerification from "../components/OtpVerification";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const { sendLoginOtp, login } = useAuth();
  const navigate = useNavigate();

  const sendOtp = async (event) => {
    event?.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await sendLoginOtp(form, "user");
      setStep("otp");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ email: form.email, otp, role: "user" });
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <section className="container-page grid min-h-[70vh] place-items-center py-12">
        <div className="w-full max-w-md">
          <OtpVerification
            email={form.email}
            otp={otp}
            setOtp={setOtp}
            onVerify={verifyOtp}
            onResend={sendOtp}
            onBack={() => setStep("form")}
            loading={loading}
            title="Verify user login"
            description="Enter the login code sent to your email."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={sendOtp} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white">
            <LogIn />
          </div>
          <h1 className="mt-4 text-3xl font-black text-ink">User Login</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your password first, then verify your email OTP.</p>
        </div>
        <div className="space-y-4">
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div className="flex justify-end">
            <Link className="text-sm font-bold text-brand-600" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Sending OTP..." : "Send Login OTP"}
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-bold text-brand-600" to="/register">
            User Signup
          </Link>
        </p>
      </form>
    </section>
  );
};

export default Login;
