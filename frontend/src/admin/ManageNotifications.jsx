import { Bell, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const initialForm = { title: "", message: "", type: "Offer", targetAudience: "All" };

const ManageNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(initialForm);
  const load = () => api.get("/notifications").then(({ data }) => setNotifications(data)).catch(() => toast.error("Unable to load notifications"));
  useEffect(load, []);
  const submit = async (event) => {
    event.preventDefault();
    await api.post("/notifications", form);
    toast.success("Notification sent");
    setForm(initialForm);
    load();
  };
  const remove = async (id) => {
    await api.delete(`/notifications/${id}`);
    toast.success("Notification deleted");
    load();
  };

  return (
    <section>
      <div className="mb-6"><h1 className="text-4xl font-black text-ink">Notifications</h1><p className="mt-2 text-slate-600">Send offer and order update notifications and review notification history.</p></div>
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option>Offer</option><option>Order Update</option><option>System</option></select>
          <select className="input" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}><option>All</option><option>Users</option><option>Admins</option><option>Delivery Partners</option></select>
          <textarea className="input min-h-24 md:col-span-2" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        </div>
        <button className="btn-primary mt-5"><Bell size={18} /> Send notification</button>
      </form>
      <div className="mt-8 grid gap-4">
        {notifications.map((notification) => (
          <article key={notification._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div><p className="font-black">{notification.title}</p><p className="mt-1 text-sm text-slate-600">{notification.message}</p><p className="mt-2 text-xs font-bold text-brand-600">{notification.type} / {notification.targetAudience}</p></div>
              <button className="rounded-lg border border-red-200 p-2 text-red-600" onClick={() => remove(notification._id)}><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ManageNotifications;
