import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const initialForm = {
  name: "",
  description: "",
  image: "",
  logo: "",
  address: "",
  city: "",
  cuisineType: "",
  openingTime: "09:00",
  closingTime: "23:00",
  gstNumber: "",
  fssaiLicense: "",
  rating: 4.5,
  deliveryTime: 30,
  deliveryFee: 0,
  isOpen: true,
  isApproved: true,
  isBlocked: false
};

const ManageRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const loadRestaurants = () => {
    api.get("/restaurants").then(({ data }) => setRestaurants(data)).catch(() => toast.error("Unable to load restaurants"));
  };

  useEffect(loadRestaurants, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      rating: Number(form.rating),
      deliveryTime: Number(form.deliveryTime),
      deliveryFee: Number(form.deliveryFee)
    };

    try {
      if (editingId) {
        await api.put(`/restaurants/${editingId}`, payload);
        toast.success("Restaurant updated");
      } else {
        await api.post("/restaurants", payload);
        toast.success("Restaurant added");
      }
      resetForm();
      loadRestaurants();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  const editRestaurant = (restaurant) => {
    setEditingId(restaurant._id);
    setForm({
      name: restaurant.name,
      description: restaurant.description,
      image: restaurant.image,
      logo: restaurant.logo || "",
      address: restaurant.address,
      city: restaurant.city,
      cuisineType: restaurant.cuisineType || "",
      openingTime: restaurant.openingTime || "09:00",
      closingTime: restaurant.closingTime || "23:00",
      gstNumber: restaurant.gstNumber || "",
      fssaiLicense: restaurant.fssaiLicense || "",
      rating: restaurant.rating,
      deliveryTime: restaurant.deliveryTime,
      deliveryFee: restaurant.deliveryFee,
      isOpen: restaurant.isOpen,
      isApproved: restaurant.isApproved,
      isBlocked: restaurant.isBlocked
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateRestaurantFlags = async (restaurant, updates) => {
    try {
      await api.put(`/restaurants/${restaurant._id}`, { ...restaurant, ...updates });
      toast.success("Restaurant updated");
      loadRestaurants();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const deleteRestaurant = async (id) => {
    if (!confirm("Delete this restaurant? Foods linked to it should be moved or deleted first.")) return;
    try {
      await api.delete(`/restaurants/${id}`);
      toast.success("Restaurant deleted");
      loadRestaurants();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-ink">Manage restaurants</h1>
        <p className="mt-2 text-slate-600">Create, edit, and remove restaurant storefronts.</p>
      </div>

      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">{editingId ? "Edit restaurant" : "Add restaurant"}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary py-2">
              <X size={17} /> Cancel
            </button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Restaurant name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <input className="input" placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} required />
          <input className="input" placeholder="Cuisine type" value={form.cuisineType} onChange={(event) => setForm({ ...form, cuisineType: event.target.value })} />
          <input className="input md:col-span-2" placeholder="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} required />
          <input className="input md:col-span-2" placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
          <input className="input md:col-span-2" placeholder="Logo URL" value={form.logo} onChange={(event) => setForm({ ...form, logo: event.target.value })} />
          <input className="input" type="time" value={form.openingTime} onChange={(event) => setForm({ ...form, openingTime: event.target.value })} />
          <input className="input" type="time" value={form.closingTime} onChange={(event) => setForm({ ...form, closingTime: event.target.value })} />
          <input className="input" placeholder="GST number" value={form.gstNumber} onChange={(event) => setForm({ ...form, gstNumber: event.target.value })} />
          <input className="input" placeholder="FSSAI license" value={form.fssaiLicense} onChange={(event) => setForm({ ...form, fssaiLicense: event.target.value })} />
          <input className="input" type="number" step="0.1" placeholder="Rating" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} />
          <input className="input" type="number" placeholder="Delivery time" value={form.deliveryTime} onChange={(event) => setForm({ ...form, deliveryTime: event.target.value })} />
          <input className="input" type="number" step="1" placeholder="Delivery fee" value={form.deliveryFee} onChange={(event) => setForm({ ...form, deliveryFee: event.target.value })} />
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={form.isOpen} onChange={(event) => setForm({ ...form, isOpen: event.target.checked })} />
            Open
          </label>
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={form.isApproved} onChange={(event) => setForm({ ...form, isApproved: event.target.checked })} />
            Approved
          </label>
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={form.isBlocked} onChange={(event) => setForm({ ...form, isBlocked: event.target.checked })} />
            Blocked
          </label>
          <textarea className="input min-h-24 md:col-span-2" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        </div>
        <button className="btn-primary mt-5">
          <Plus size={18} /> {editingId ? "Update restaurant" : "Add restaurant"}
        </button>
      </form>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((restaurant) => (
          <article key={restaurant._id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <img src={restaurant.image} alt={restaurant.name} className="h-40 w-full object-cover" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-ink">{restaurant.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{restaurant.city}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${restaurant.isBlocked ? "bg-red-100 text-red-700" : restaurant.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {restaurant.isBlocked ? "Blocked" : restaurant.isApproved ? "Approved" : "Pending"}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-brand-600">{restaurant.cuisineType || "Multi cuisine"}</p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{restaurant.description}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-slate-700">
                <span>{restaurant.rating} rating</span>
                <span>{restaurant.deliveryTime} min</span>
                <span>{formatPrice(restaurant.deliveryFee)} fee</span>
                <span>{restaurant.openingTime} - {restaurant.closingTime}</span>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-black text-emerald-700" onClick={() => updateRestaurantFlags(restaurant, { isApproved: true, isBlocked: false })}>Approve</button>
                <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700" onClick={() => updateRestaurantFlags(restaurant, { isBlocked: !restaurant.isBlocked })}>{restaurant.isBlocked ? "Unblock" : "Block"}</button>
                <button className="rounded-lg border border-slate-200 p-2" onClick={() => editRestaurant(restaurant)}><Edit3 size={17} /></button>
                <button className="rounded-lg border border-red-200 p-2 text-red-600" onClick={() => deleteRestaurant(restaurant._id)}><Trash2 size={17} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ManageRestaurants;
