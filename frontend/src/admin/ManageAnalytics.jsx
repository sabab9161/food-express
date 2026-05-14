import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const colors = ["#f97316", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6", "#f59e0b", "#64748b"];

const ChartCard = ({ title, children }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-lg font-black text-ink">{title}</h2>
    <div className="h-72">{children}</div>
  </div>
);

const ManageAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    dailyOrders: [],
    weeklyRevenue: [],
    monthlySales: [],
    topRestaurants: [],
    topFoods: [],
    orderStatusChart: [],
    paymentMethodChart: []
  });

  useEffect(() => {
    api.get("/admin/analytics").then(({ data }) => setAnalytics(data)).catch(() => toast.error("Unable to load analytics"));
  }, []);

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-ink">Analytics</h1>
        <p className="mt-2 text-slate-600">Daily orders, revenue trends, sales, top foods, restaurants, order status, and payment methods.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Daily orders">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.dailyOrders}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={3} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Weekly revenue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.weeklyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip formatter={(value) => formatPrice(value)} /><Bar dataKey="revenue" fill="#10b981" /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly sales">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.monthlySales}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip formatter={(value) => formatPrice(value)} /><Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} /></LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Top foods">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.topFoods}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="quantity" fill="#8b5cf6" /></BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Order status">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={analytics.orderStatusChart} dataKey="value" nameKey="name" outerRadius={95} label>{analytics.orderStatusChart.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payment methods">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={analytics.paymentMethodChart} dataKey="value" nameKey="name" outerRadius={95} label>{analytics.paymentMethodChart.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-ink">Top restaurants</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {analytics.topRestaurants.map((restaurant) => (
            <div key={restaurant.name} className="rounded-lg bg-slate-50 p-4">
              <p className="font-black">{restaurant.name}</p>
              <p className="mt-1 text-sm text-slate-600">{restaurant.foods} foods / {restaurant.rating} rating</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManageAnalytics;
