import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const initialForm = { platformName: "FoodExpress", logo: "", address: "", city: "", deliveryCharges: 0, openingTime: "09:00", closingTime: "23:00", taxPercentage: 5, supportEmail: "", supportPhone: "" };

const ManageSettings = () => {
  const [form, setForm] = useState(initialForm);
  useEffect(() => {
    api.get("/settings").then(({ data }) => setForm({ ...initialForm, ...data })).catch(() => toast.error("Unable to load settings"));
  }, []);
  const submit = async (event) => {
    event.preventDefault();
    await api.put("/settings", { ...form, deliveryCharges: Number(form.deliveryCharges), taxPercentage: Number(form.taxPercentage) });
    toast.success("Settings saved");
  };
  return (
    <section>
      <div className="mb-6"><h1 className="text-4xl font-black text-ink">Settings</h1><p className="mt-2 text-slate-600">Configure platform details, fees, taxes, timings, and support contacts.</p></div>
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Platform name" value={form.platformName} onChange={(e) => setForm({ ...form, platformName: e.target.value })} />
          <input className="input" placeholder="Logo URL" value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
          <input className="input md:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="input" type="number" placeholder="Delivery charges" value={form.deliveryCharges} onChange={(e) => setForm({ ...form, deliveryCharges: e.target.value })} />
          <input className="input" type="time" value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} />
          <input className="input" type="time" value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} />
          <input className="input" type="number" placeholder="Tax percentage" value={form.taxPercentage} onChange={(e) => setForm({ ...form, taxPercentage: e.target.value })} />
          <input className="input" type="email" placeholder="Support email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
          <input className="input" placeholder="Support phone" value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} />
        </div>
        <button className="btn-primary mt-5"><Save size={18} /> Save settings</button>
      </form>
    </section>
  );
};

export default ManageSettings;
