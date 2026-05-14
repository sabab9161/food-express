import { Ban, CheckCircle2, Clock, DollarSign, ShoppingBag, Store, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalFoods: 0, totalOrders: 0, totalRevenue: 0 });
  const paidRevenue = Number(stats.totalRevenue || 0);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setStats(data)).catch(() => toast.error("Unable to load dashboard"));
  }, []);

  const cards = [
    { label: "Total orders", value: stats.totalOrders, icon: ShoppingBag, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Paid revenue", value: formatPrice(paidRevenue), icon: DollarSign, tone: "bg-violet-50 text-violet-700" },
    { label: "Total users", value: stats.totalUsers, icon: Users, tone: "bg-blue-50 text-blue-700" },
    { label: "Total restaurants", value: stats.totalRestaurants, icon: Store, tone: "bg-brand-100 text-brand-700" },
    { label: "Pending orders", value: stats.pendingOrders, icon: Clock, tone: "bg-amber-50 text-amber-700" },
    { label: "Delivered orders", value: stats.deliveredOrders, icon: CheckCircle2, tone: "bg-green-50 text-green-700" },
    { label: "Cancelled orders", value: stats.cancelledOrders, icon: Ban, tone: "bg-red-50 text-red-700" }
  ];

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-4xl font-black text-ink">Admin dashboard</h1>
        <p className="mt-2 text-slate-600">Monitor FoodExpress performance and manage operations.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`grid h-12 w-12 place-items-center rounded-lg ${tone}`}>
              <Icon />
            </div>
            <p className="mt-5 text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-ink">Top selling foods</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">Food</th>
                <th className="p-3">Quantity sold</th>
                <th className="p-3">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(stats.topSellingFoods || []).map((food) => (
                <tr key={food._id}>
                  <td className="p-3 font-bold">{food._id}</td>
                  <td className="p-3">{food.quantity}</td>
                  <td className="p-3 font-black">{formatPrice(food.revenue)}</td>
                </tr>
              ))}
              {!stats.topSellingFoods?.length && (
                <tr>
                  <td className="p-4 text-center font-bold text-slate-500" colSpan={3}>No sales data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
