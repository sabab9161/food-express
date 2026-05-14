import { PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/my-orders").then(({ data }) => setOrders(data)).catch(() => toast.error("Unable to load orders"));
  }, []);

  return (
    <section className="container-page py-10">
      <h1 className="text-4xl font-black text-ink">My orders</h1>
      <div className="mt-6 space-y-5">
        {orders.map((order) => (
          <article key={order._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <PackageCheck className="text-brand-500" />
                <div>
                  <p className="font-black">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700">{order.status}</span>
            </div>
            <div className="mt-4 divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.food} className="flex justify-between py-3 text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end text-lg font-black">Total: {formatPrice(order.total)}</div>
          </article>
        ))}
        {!orders.length && <p className="rounded-lg border border-slate-200 bg-white p-8 text-center font-bold text-slate-500">No orders yet.</p>}
      </div>
    </section>
  );
};

export default MyOrders;
