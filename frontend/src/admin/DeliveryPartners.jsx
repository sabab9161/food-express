import { Edit3, Plus, Star, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const initialForm = { name: "", phone: "", email: "", vehicleType: "Bike", vehicleNumber: "", licenseNumber: "", status: "Offline", earnings: 0 };
const statuses = ["Online", "Offline", "Busy", "Blocked"];

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPartners = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/delivery-partners");
      const partnersWithRatings = await Promise.all(
        data.map(async (partner) => {
          try {
            const { data: ratingData } = await api.get(`/reviews/delivery-partner/${partner._id}`);
            return {
              ...partner,
              averageRating: ratingData.averageRating || 0,
              totalReviews: ratingData.totalReviews || 0
            };
          } catch {
            return { ...partner, averageRating: 0, totalReviews: 0 };
          }
        })
      );
      setPartners(partnersWithRatings);
    } catch (loadError) {
      const message = loadError.response?.data?.message || "Unable to load delivery partners";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = { ...form, earnings: Number(form.earnings) };
    try {
      if (editingId) {
        await api.put(`/delivery-partners/${editingId}`, payload);
        toast.success("Delivery partner updated");
      } else {
        await api.post("/delivery-partners", payload);
        toast.success("Delivery partner added");
      }
      resetForm();
      loadPartners();
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Save failed");
    }
  };

  const editPartner = (partner) => {
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

  const deletePartner = async (partner) => {
    if (!confirm(`Delete ${partner.name}?`)) return;
    try {
      await api.delete(`/delivery-partners/${partner._id}`);
      toast.success("Delivery partner deleted");
      loadPartners();
    } catch (deleteError) {
      toast.error(deleteError.response?.data?.message || "Delete failed");
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-ink">Delivery Partners</h1>
        <p className="mt-2 text-slate-600">Add riders, update availability, manage vehicle details, and track earnings.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Total partners</p><p className="mt-1 text-3xl font-black">{partners.length}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Online</p><p className="mt-1 text-3xl font-black">{partners.filter((partner) => partner.status === "Online").length}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Total earnings</p><p className="mt-1 text-3xl font-black">{formatPrice(partners.reduce((sum, partner) => sum + partner.earnings, 0))}</p></div>
      </div>

      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">{editingId ? "Edit delivery partner" : "Add delivery partner"}</h2>
          {editingId && <button type="button" className="btn-secondary py-2" onClick={resetForm}><X size={17} /> Cancel</button>}
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

      {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Email</th><th className="p-4">Vehicle Type</th><th className="p-4">Vehicle Number</th><th className="p-4">Status</th><th className="p-4">Rating</th><th className="p-4">Earnings</th><th className="p-4">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td className="p-6 text-center font-bold text-slate-500" colSpan={9}>Loading delivery partners...</td></tr>}
              {!loading && partners.map((partner) => (
                <tr key={partner._id}>
                  <td className="p-4 font-bold">{partner.name}</td>
                  <td className="p-4">{partner.phone}</td>
                  <td className="p-4">{partner.email}</td>
                  <td className="p-4">{partner.vehicleType}</td>
                  <td className="p-4">{partner.vehicleNumber}</td>
                  <td className="p-4">{partner.status}</td>
                  <td className="p-4">
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-black text-amber-700">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      {partner.averageRating || 0}
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-500">{partner.totalReviews || 0} reviews</p>
                  </td>
                  <td className="p-4 font-black">{formatPrice(partner.earnings)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black" onClick={() => toast("Assign order flow coming soon")}>Assign order</button>
                      <button className="rounded-lg border border-slate-200 p-2" onClick={() => editPartner(partner)}><Edit3 size={17} /></button>
                      <button className="rounded-lg border border-red-200 p-2 text-red-600" onClick={() => deletePartner(partner)}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !partners.length && <tr><td className="p-6 text-center font-bold text-slate-500" colSpan={9}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default DeliveryPartners;
