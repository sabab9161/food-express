import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminLogin = () => {
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
        role: "admin"
      });
      if (data.user.role !== "admin") {
        toast.error("This login is for admin accounts only");
        return;
      }
      setSession(data);
      toast.success(`Welcome back, ${data.user.name}`);
      navigate("/admin/dashboard", { replace: true });
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
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-ink text-white">
            <ShieldCheck />
          </div>
          <h1 className="mt-4 text-3xl font-black text-ink">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">Use an administrator account to manage FoodExpress.</p>
        </div>

        <div className="space-y-4">
          <input
            id="admin-email"
            name="email"
            className="input"
            type="email"
            placeholder="Admin email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
          <input
            id="admin-password"
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
            <Link className="text-sm font-bold text-brand-600" to="/admin/forgot-password">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            Login
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
