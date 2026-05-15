import { Building2, Eye, EyeOff, MapPin, Phone, ShieldPlus, UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import OtpVerification from "../components/OtpVerification";
import PasswordField from "../components/PasswordField";
import { useAuth } from "../context/AuthContext";
import { getPasswordStatus, passwordErrorMessage } from "../utils/passwordValidation";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  restaurantName: "",
  restaurantAddress: "",
  city: ""
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[6-9]\d{9}$/;
const otpSuccessMessage = (data, fallback = "OTP sent to email") =>
  data?.message?.includes("Email delivery failed")
    ? "OTP generated. If email does not arrive, check Render logs for development OTP."
    : data?.message || fallback;

const AdminSignup = () => {
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("form");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { sendSignupOtp, registerAdmin } = useAuth();
  const navigate = useNavigate();
  const passwordStatus = getPasswordStatus(form.password);
  const isEmailValid = emailPattern.test(form.email.trim());
  const isPhoneValid = phonePattern.test(form.phone.trim());
  const isFormInvalid =
    Object.values(form).some((value) => !value.trim()) ||
    !isEmailValid ||
    !isPhoneValid ||
    !passwordStatus.isValid ||
    form.password !== form.confirmPassword;

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const values = Object.values(form).map((value) => value.trim());

    if (values.some((value) => !value)) {
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

    if (form.password !== form.confirmPassword) {
      toast.error("Password and confirm password must match");
      return false;
    }

    return true;
  };

  const getSignupPayload = () => ({
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    password: form.password,
    confirmPassword: form.confirmPassword,
    restaurantName: form.restaurantName.trim(),
    restaurantAddress: form.restaurantAddress.trim(),
    city: form.city.trim()
  });

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (sendingOtp) return;
    if (!validate()) return;

    setSendingOtp(true);

    try {
      const data = await sendSignupOtp(getSignupPayload(), "admin");
      toast.success(otpSuccessMessage(data, "Admin signup OTP sent to email"));

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
      const data = await sendSignupOtp(getSignupPayload(), "admin");
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
      await registerAdmin({
        ...getSignupPayload(),
        otp
      });

      toast.success("Admin account verified. Please log in.");
      navigate("/admin-login", { replace: true });
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
            title="Verify admin signup"
            description="Enter the code sent to your email to create the admin account."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-10">
      <div className="container-page grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="rounded-lg bg-ink p-8 text-white shadow-soft">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-brand-500">
            <ShieldPlus size={30} />
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight">Partner admin onboarding</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Create a verified restaurant admin account to manage menu items, track orders, and update delivery status from the FoodExpress dashboard.
          </p>
          <div className="mt-8 grid gap-4">
            {[
              [Building2, "Restaurant profile", "Register the restaurant name, address, and operating city."],
              [ShieldPlus, "Verified access", "Create an admin account and verify ownership through email OTP."],
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
              <p className="mt-2 text-sm text-slate-600">All fields are required for admin verification.</p>
            </div>
            <Link to="/admin-login" className="btn-secondary shrink-0 py-2">
              Admin Login
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <UserRound size={17} /> Full Name
              </span>
              <input className="input" value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Sarah Johnson" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
              <input className="input" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="admin@restaurant.com" required />
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Phone size={17} /> Phone Number
              </span>
              <input className="input" type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="9876543210" required />
              {form.phone && !isPhoneValid && (
                <span className="mt-2 block text-xs font-bold text-red-600">Enter valid 10 digit Indian mobile number</span>
              )}
            </label>

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Building2 size={17} /> Restaurant Name
              </span>
              <input className="input" value={form.restaurantName} onChange={(e) => updateField("restaurantName", e.target.value)} placeholder="Urban Spice Kitchen" required />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <MapPin size={17} /> Restaurant Address
              </span>
              <input className="input" value={form.restaurantAddress} onChange={(e) => updateField("restaurantAddress", e.target.value)} placeholder="120 Market Street, Suite 4" required />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">City</span>
              <input className="input" value={form.city} onChange={(e) => updateField("city", e.target.value)} placeholder="San Francisco" required />
            </label>

            <div className="md:col-span-2">
              <PasswordField
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
              />
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Confirm Password</span>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="Re-enter password"
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
          </div>

          <button type="submit" className="btn-primary mt-7 w-full" disabled={sendingOtp || isFormInvalid}>
            {sendingOtp ? "Sending OTP..." : "Submit Admin Signup"}
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
