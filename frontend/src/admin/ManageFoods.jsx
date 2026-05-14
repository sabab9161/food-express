import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const initialForm = {
  restaurant: "",
  name: "",
  description: "",
  price: "",
  offerPrice: "",
  category: "",
  foodType: "Veg",
  image: "",
  rating: 4.5,
  preparationTime: 25,
  stock: 100,
  isAvailable: true
};

const ManageFoods = () => {
  const [foods, setFoods] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const loadFoods = () => {
    api.get("/foods").then(({ data }) => setFoods(data)).catch(() => toast.error("Unable to load foods"));
  };

  const loadRestaurants = () => {
    api.get("/restaurants").then(({ data }) => setRestaurants(data)).catch(() => toast.error("Unable to load restaurants"));
  };

  useEffect(() => {
    loadFoods();
    loadRestaurants();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      offerPrice: Number(form.offerPrice || 0),
      rating: Number(form.rating),
      preparationTime: Number(form.preparationTime),
      stock: Number(form.stock)
    };
    try {
      if (editingId) {
        await api.put(`/foods/${editingId}`, payload);
        toast.success("Food updated");
      } else {
        await api.post("/foods", payload);
        toast.success("Food added");
      }
      resetForm();
      loadFoods();
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    }
  };

  const editFood = (food) => {
    setEditingId(food._id);
    setForm({
      restaurant: food.restaurant?._id || food.restaurant || "",
      name: food.name,
      description: food.description,
      price: food.price,
      offerPrice: food.offerPrice || "",
      category: food.category,
      foodType: food.foodType || "Veg",
      image: food.image,
      rating: food.rating,
      preparationTime: food.preparationTime,
      stock: food.stock ?? 100,
      isAvailable: food.isAvailable
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteFood = async (id) => {
    if (!confirm("Delete this food item?")) return;
    try {
      await api.delete(`/foods/${id}`);
      toast.success("Food deleted");
      loadFoods();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-ink">Manage foods</h1>
        <p className="mt-2 text-slate-600">Create, edit, and remove menu items.</p>
      </div>
      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">{editingId ? "Edit food" : "Add food"}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary py-2">
              <X size={17} /> Cancel
            </button>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <select className="input md:col-span-2" value={form.restaurant} onChange={(e) => setForm({ ...form, restaurant: e.target.value })} required>
            <option value="">Select restaurant</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>
            ))}
          </select>
          <input className="input" placeholder="Food name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <input className="input" type="number" step="1" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          <input className="input" type="number" step="1" placeholder="Offer price" value={form.offerPrice} onChange={(e) => setForm({ ...form, offerPrice: e.target.value })} />
          <select className="input" value={form.foodType} onChange={(e) => setForm({ ...form, foodType: e.target.value })}>
            <option>Veg</option>
            <option>Non-Veg</option>
          </select>
          <input className="input" type="number" step="0.1" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          <input className="input" type="number" placeholder="Preparation time" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} />
          <input className="input" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input className="input" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
          <textarea className="input min-h-24 md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} />
            Available
          </label>
        </div>
        <button className="btn-primary mt-5">
          <Plus size={18} /> {editingId ? "Update food" : "Add food"}
        </button>
      </form>

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-4">Food</th>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {foods.map((food) => (
                <tr key={food._id}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={food.image} alt={food.name} className="h-12 w-12 rounded-lg object-cover" />
                      <span className="font-bold">{food.name}</span>
                    </div>
                  </td>
                  <td className="p-4">{food.restaurant?.name || "Unassigned"}</td>
                  <td className="p-4">{food.category} <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs">{food.foodType}</span></td>
                  <td className="p-4">
                    <div className="font-black">{formatPrice(food.offerPrice || food.price)}</div>
                    {food.offerPrice > 0 && <div className="text-xs text-slate-500 line-through">{formatPrice(food.price)}</div>}
                  </td>
                  <td className="p-4">{food.stock}</td>
                  <td className="p-4">{food.isAvailable && food.stock > 0 ? "Available" : "Out of stock"}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg border border-slate-200 p-2" onClick={() => editFood(food)}><Edit3 size={17} /></button>
                      <button className="rounded-lg border border-red-200 p-2 text-red-600" onClick={() => deleteFood(food._id)}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ManageFoods;
