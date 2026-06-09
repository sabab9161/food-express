import { Edit3, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const initialForm = {
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: 0,
  expiryDate: "",
  isActive: true,
  applicableType: "all",
  restaurantIds: [],
  foodIds: []
};

const selectedOptions = (event) => Array.from(event.target.selectedOptions).map((option) => option.value);

const getNames = (items = []) => items.map((item) => item.name).join(", ") || "All";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/coupons");
      setCoupons(data);
    } catch (loadError) {
      const message = loadError.response?.data?.message || "Unable to load coupons";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
    Promise.all([api.get("/restaurants"), api.get("/foods")])
      .then(([restaurantResponse, foodResponse]) => {
        setRestaurants(restaurantResponse.data);
        setFoods(foodResponse.data);
      })
      .catch(() => toast.error("Unable to load restaurants or foods"));
  }, []);

  const stats = useMemo(
    () => ({
      total: coupons.length,
      active: coupons.filter((coupon) => coupon.isActive).length,
      scoped: coupons.filter((coupon) => coupon.applicableType !== "all").length
    }),
    [coupons]
  );

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const buildPayload = () => ({
    ...form,
    discountValue: Number(form.discountValue),
    minOrderAmount: Number(form.minOrderAmount),
    maxDiscountAmount: Number(form.maxDiscountAmount),
    restaurantIds: form.applicableType === "restaurants" ? form.restaurantIds : [],
    foodIds: form.applicableType === "foods" ? form.foodIds : []
  });

  const submit = async (event) => {
    event.preventDefault();

    if (form.applicableType === "restaurants" && !form.restaurantIds.length) {
      toast.error("Select at least one restaurant");
      return;
    }

    if (form.applicableType === "foods" && !form.foodIds.length) {
      toast.error("Select at least one food item");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/coupons/${editingId}`, buildPayload());
        toast.success("Coupon updated");
      } else {
        await api.post("/coupons", buildPayload());
        toast.success("Coupon added");
      }
      resetForm();
      loadCoupons();
    } catch (saveError) {
      toast.error(saveError.response?.data?.message || "Save failed");
    }
  };

  const editCoupon = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      expiryDate: coupon.expiryDate?.slice(0, 10),
      isActive: coupon.isActive,
      applicableType: coupon.applicableType,
      restaurantIds: (coupon.restaurantIds || []).map((restaurant) => restaurant._id || restaurant),
      foodIds: (coupon.foodIds || []).map((food) => food._id || food)
    });
  };

  const updateCoupon = async (coupon, updates) => {
    try {
      await api.put(`/coupons/${coupon._id}`, {
        ...coupon,
        restaurantIds: (coupon.restaurantIds || []).map((restaurant) => restaurant._id || restaurant),
        foodIds: (coupon.foodIds || []).map((food) => food._id || food),
        ...updates
      });
      toast.success("Coupon updated");
      loadCoupons();
    } catch (updateError) {
      toast.error(updateError.response?.data?.message || "Update failed");
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await api.delete(`/coupons/${coupon._id}`);
      toast.success("Coupon deleted");
      loadCoupons();
    } catch (deleteError) {
      toast.error(deleteError.response?.data?.message || "Delete failed");
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-ink">Coupons</h1>
        <p className="mt-2 text-slate-600">Create offers for all items, selected restaurants, or selected food items.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Total coupons</p><p className="mt-1 text-3xl font-black">{stats.total}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Active</p><p className="mt-1 text-3xl font-black">{stats.active}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Scoped offers</p><p className="mt-1 text-3xl font-black">{stats.scoped}</p></div>
      </div>

      <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-black">{editingId ? "Edit coupon" : "Add coupon"}</h2>
          {editingId && <button type="button" className="btn-secondary py-2" onClick={resetForm}><X size={17} /> Cancel</button>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Coupon Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
          <select className="input" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
          <input className="input" type="number" placeholder="Discount Value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} required />
          <input className="input" type="number" placeholder="Minimum Order Amount" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
          <input className="input" type="number" placeholder="Maximum Discount Amount" value={form.maxDiscountAmount} onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })} />
          <input className="input" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          <select className="input" value={form.applicableType} onChange={(e) => setForm({ ...form, applicableType: e.target.value, restaurantIds: [], foodIds: [] })}>
            <option value="all">All restaurants and food items</option>
            <option value="restaurants">Selected Restaurants</option>
            <option value="foods">Selected Food Items</option>
          </select>
          <label className="flex items-center gap-2 font-bold">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>

          {form.applicableType === "restaurants" && (
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Select restaurants</span>
              <select className="input min-h-40" multiple value={form.restaurantIds} onChange={(e) => setForm({ ...form, restaurantIds: selectedOptions(e) })}>
                {restaurants.map((restaurant) => <option key={restaurant._id} value={restaurant._id}>{restaurant.name}</option>)}
              </select>
            </label>
          )}

          {form.applicableType === "foods" && (
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-bold text-slate-700">Select food items</span>
              <select className="input min-h-40" multiple value={form.foodIds} onChange={(e) => setForm({ ...form, foodIds: selectedOptions(e) })}>
                {foods.map((food) => <option key={food._id} value={food._id}>{food.name}</option>)}
              </select>
            </label>
          )}
        </div>

        <button className="btn-primary mt-5"><Plus size={18} /> {editingId ? "Update coupon" : "Add coupon"}</button>
      </form>

      {error && <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Applicable On</th>
                <th className="p-4">Selected Restaurants/Foods</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td className="p-6 text-center font-bold text-slate-500" colSpan={8}>Loading coupons...</td></tr>}
              {!loading && coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="p-4 font-black">{coupon.code}</td>
                  <td className="p-4">{coupon.discountType === "percentage" ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}{coupon.maxDiscountAmount > 0 && <div className="text-xs text-slate-500">Max {formatPrice(coupon.maxDiscountAmount)}</div>}</td>
                  <td className="p-4">{coupon.applicableType === "all" ? "All" : coupon.applicableType === "restaurants" ? "Selected Restaurants" : "Selected Food Items"}</td>
                  <td className="p-4">{coupon.applicableType === "restaurants" ? getNames(coupon.restaurantIds) : coupon.applicableType === "foods" ? getNames(coupon.foodIds) : "All restaurants and foods"}</td>
                  <td className="p-4">{formatPrice(coupon.minOrderAmount)}</td>
                  <td className="p-4">{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4">{coupon.isActive ? "Active" : "Inactive"}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-black text-amber-700" onClick={() => updateCoupon(coupon, { isActive: !coupon.isActive })}>{coupon.isActive ? "Deactivate" : "Activate"}</button>
                      <button className="rounded-lg border border-slate-200 p-2" onClick={() => editCoupon(coupon)} aria-label={`Edit coupon ${coupon.code}`} title={`Edit coupon ${coupon.code}`}><Edit3 size={17} /></button>
                      <button className="rounded-lg border border-red-200 p-2 text-red-600" onClick={() => deleteCoupon(coupon)} aria-label={`Delete coupon ${coupon.code}`} title={`Delete coupon ${coupon.code}`}><Trash2 size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !coupons.length && <tr><td className="p-6 text-center font-bold text-slate-500" colSpan={8}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Coupons;
