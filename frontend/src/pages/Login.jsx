import { LogIn } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
        role: "user"
      });
      setSession(data);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="container-page grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-6">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-500 text-white">
            <LogIn />
          </div>
          <h1 className="mt-4 text-3xl font-black text-ink">User Login</h1>
          <p className="mt-2 text-sm text-slate-600">Enter your email and password to access your account.</p>
        </div>
        <div className="space-y-4">
          <input
            id="email"
            name="email"
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <input
            id="password"
            name="password"
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end">
            <Link className="text-sm font-bold text-brand-600" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            Login
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
