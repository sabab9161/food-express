import { UserRound } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", address: user?.address || "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const { data } = await api.put("/users/profile", payload);
      updateUser(data.user);
      toast.success("Profile updated");
      setForm((current) => ({ ...current, password: "" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  return (
    <section className="container-page grid min-h-[65vh] place-items-center py-12">
      <form onSubmit={submit} className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <UserRound className="text-brand-500" size={42} />
        <h1 className="mt-4 text-3xl font-black text-ink">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
        <div className="mt-6 grid gap-4">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
          <textarea className="input min-h-24" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
          <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="New password optional" />
        </div>
        <button className="btn-primary mt-5 w-full">Save changes</button>
      </form>
    </section>
  );
};

export default Profile;
