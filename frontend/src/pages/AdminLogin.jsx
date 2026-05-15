import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import OtpVerification from "../components/OtpVerification";
import { useAuth } from "../context/AuthContext";

const otpSuccessMessage = (data, fallback = "OTP sent to email") =>
  data?.message?.includes("Email delivery failed")
    ? "OTP generated. If email does not arrive, check Render logs for development OTP."
    : data?.message || fallback;

const AdminLogin = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const { sendLoginOtp, login } = useAuth();
  const navigate = useNavigate();

  const sendOtp = async (event) => {
    event?.preventDefault();
    if (sendingOtp) return;
    setSendingOtp(true);
    try {
      const data = await sendLoginOtp(form, "admin");
      toast.success(otpSuccessMessage(data, "Admin login OTP sent to email"));
      setStep("otp");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (sendingOtp) return;
    setSendingOtp(true);
    try {
      const data = await sendLoginOtp(form, "admin");
      toast.success(data?.message?.includes("Email delivery failed") ? otpSuccessMessage(data) : "OTP resent successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (verifyingOtp) return;
    setVerifyingOtp(true);
    try {
      const user = await login({ email: form.email, otp, role: "admin" });
      if (user.role !== "admin") {
        toast.error("This login is for admin accounts only");
        return;
      }
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setVerifyingOtp(false);
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
            onResend={handleResendOtp}
            onBack={() => setStep("form")}
            sendingOtp={sendingOtp}
            verifyingOtp={verifyingOtp}
            title="Verify admin login"
            description="Enter the admin login code sent to your email."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={sendOtp} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
            <ShieldCheck />
          </div>
          <h1 className="mt-4 text-3xl font-black text-ink">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">Use an administrator account to manage FoodExpress.</p>
        </div>

        <div className="space-y-4">
          <input className="input" type="email" placeholder="Admin email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div className="flex justify-end">
            <Link className="text-sm font-bold text-brand-600" to="/admin/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={sendingOtp}>
            {sendingOtp ? "Sending OTP..." : "Send Admin Login OTP"}
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link className="font-bold text-brand-600" to="/login">User Login</Link>
          <Link className="font-bold text-brand-600" to="/admin-signup">Admin Signup</Link>
        </div>
      </form>
    </section>
  );
};

export default AdminLogin;
