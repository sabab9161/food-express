import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import OtpVerification from "../components/OtpVerification";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";
import { getPasswordStatus, passwordErrorMessage } from "../utils/passwordValidation";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "", address: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { sendSignupOtp, register } = useAuth();
  const navigate = useNavigate();
  const passwordStatus = getPasswordStatus(form.password);
  const isEmailValid = emailPattern.test(form.email.trim());
  const isPhoneValid = phonePattern.test(form.phone.trim());
  const isFormInvalid =
    !form.name.trim() ||
    !isEmailValid ||
    !isPhoneValid ||
    !passwordStatus.isValid ||
    form.password !== form.confirmPassword ||
    !form.address.trim();

  const sendOtp = async (event) => {
    event?.preventDefault();
    if (loading) return;

    if (!isEmailValid) {
      toast.error("Enter a valid email address");
      return;
    }

    if (!isPhoneValid) {
      toast.error("Enter valid 10 digit Indian mobile number");
      return;
    }

    if (!passwordStatus.isValid) {
      toast.error(passwordErrorMessage);
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Password and confirm password must match");
      return;
    }

    setLoading(true);
    try {
      await sendSignupOtp({ ...form, email: form.email.trim(), phone: form.phone.trim() }, "user");
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
      await register({ ...form, email: form.email.trim(), phone: form.phone.trim(), otp });
      toast.success("Account verified. Please log in.");
      navigate("/login", { replace: true });
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
            title="Verify customer signup"
            description="Enter the code sent to your email to create your FoodExpress account."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={sendOtp} className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white">
            <UserPlus />
          </div>
          <h1 className="mt-4 text-3xl font-black text-ink">User Signup</h1>
          <p className="mt-2 text-sm text-slate-600">Create a customer account. We will verify your email with an OTP.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input sm:col-span-2" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <label className="block">
            <input className="input" type="tel" placeholder="10 digit mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            {form.phone && !isPhoneValid && (
              <span className="mt-2 block text-xs font-bold text-red-600">Enter valid 10 digit Indian mobile number</span>
            )}
          </label>
          <div className="sm:col-span-2">
            <PasswordField
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-bold text-slate-700">Confirm Password</span>
            <div className="relative">
              <input
                className="input pr-12"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <span className="mt-2 block text-xs font-bold text-red-600">Passwords do not match</span>
            )}
          </label>
          <input className="input" placeholder="Delivery Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        </div>
        <button className="btn-primary mt-5 w-full" disabled={loading || isFormInvalid}>
          {loading ? "Sending OTP..." : "Send Signup OTP"}
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
