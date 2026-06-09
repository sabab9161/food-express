import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const initialForm = { name: "", phone: "", email: "", vehicleType: "Bike", vehicleNumber: "", licenseNumber: "", status: "Offline", earnings: 0 };
const statuses = ["Online", "Offline", "Busy", "Blocked"];

const ManageDeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get("/delivery-partners").then(({ data }) => setPartners(data)).catch(() => toast.error("Unable to load delivery partners"));
  useEffect(load, []);

  const reset = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, earnings: Number(form.earnings) };
    try {
      editingId ? await api.put(`/delivery-partners/${editingId}`, payload) : await api.post("/delivery-partners", payload);
      toast.success(editingId ? "Delivery partner updated" : "Delivery partner added");
      reset();
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  const edit = (partner) => {
    setEditingId(partner._id);
    setForm({
      name: partner.name,
      phone: partner.phone,
      email: partner.email,
      vehicleType: partner.vehicleType,
      vehicleNumber: partner.vehicleNumber,
      licenseNumber: partner.licenseNumber,
      status: partner.status,
      earnings: partner.earnings
    });
  };

  const remove = async (id) => {
    if (!confirm("Delete this delivery partner?")) return;
    await api.delete(`/delivery-partners/${id}`);
    toast.success("Delivery partner deleted");
    load();
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-ink">Delivery partners</h1>
        <p className="mt-2 text-slate-600">Manage riders, availability, vehicles, licenses, assignments, and earnings.</p>
      </div>
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">{editingId ? "Edit partner" : "Add partner"}</h2>
          {editingId && <button type="button" className="btn-secondary py-2" onClick={reset}><X size={17} /> Cancel</button>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Vehicle type" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} required />
          <input className="input" placeholder="Vehicle number" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} required />
          <input className="input" placeholder="License number" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
          <input className="input" type="number" placeholder="Earnings" value={form.earnings} onChange={(e) => setForm({ ...form, earnings: e.target.value })} />
        </div>
        <button className="btn-primary mt-5"><Plus size={18} /> {editingId ? "Update partner" : "Add partner"}</button>
      </form>

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100"><tr><th className="p-4">Partner</th><th className="p-4">Vehicle</th><th className="p-4">License</th><th className="p-4">Status</th><th className="p-4">Earnings</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {partners.map((partner) => (
              <tr key={partner._id}>
                <td className="p-4"><p className="font-bold">{partner.name}</p><p className="text-xs text-slate-500">{partner.email} / {partner.phone}</p></td>
                <td className="p-4">{partner.vehicleType} - {partner.vehicleNumber}</td>
                <td className="p-4">{partner.licenseNumber}</td>
                <td className="p-4">{partner.status}</td>
                <td className="p-4 font-black">{formatPrice(partner.earnings)}</td>
                <td className="p-4"><div className="flex justify-end gap-2"><button className="rounded-lg border border-slate-200 p-2" onClick={() => edit(partner)} aria-label={`Edit ${partner.name}`} title={`Edit ${partner.name}`}><Edit3 size={17} /></button><button className="rounded-lg border border-red-200 p-2 text-red-600" onClick={() => remove(partner._id)} aria-label={`Delete ${partner.name}`} title={`Delete ${partner.name}`}><Trash2 size={17} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ManageDeliveryPartners;
