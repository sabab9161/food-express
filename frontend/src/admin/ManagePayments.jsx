import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const load = () => api.get("/payments").then(({ data }) => setPayments(data)).catch(() => toast.error("Unable to load payments"));
  useEffect(load, []);
  const revenue = useMemo(() => payments.filter((payment) => payment.paymentStatus === "Paid").reduce((sum, payment) => sum + payment.amount, 0), [payments]);
  const refunds = useMemo(() => payments.filter((payment) => payment.paymentStatus === "Refunded").reduce((sum, payment) => sum + payment.amount, 0), [payments]);
  const refund = async (id) => {
    await api.put(`/payments/${id}/refund`);
    toast.success("Payment refunded");
    load();
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-4xl font-black text-ink">Payments</h1><p className="mt-2 text-slate-600">Track transactions, methods, payment status, refunds, and revenue.</p></div>
        <button className="btn-secondary" onClick={load}><RefreshCw size={18} /> Refresh</button>
      </div>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">Paid revenue</p><p className="text-3xl font-black">{formatPrice(revenue)}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">Refunded</p><p className="text-3xl font-black">{formatPrice(refunds)}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-sm font-bold text-slate-500">Transactions</p><p className="text-3xl font-black">{payments.length}</p></div>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-100"><tr><th className="p-4">Transaction</th><th className="p-4">Customer</th><th className="p-4">Method</th><th className="p-4">Amount</th><th className="p-4">Status</th><th className="p-4">Date</th><th className="p-4">Action</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="p-4 font-bold">{payment.transactionId || payment._id.slice(-8).toUpperCase()}</td>
                <td className="p-4">{payment.user?.name || "Customer"}<div className="text-xs text-slate-500">{payment.user?.email}</div></td>
                <td className="p-4">{payment.paymentMethod}</td>
                <td className="p-4 font-black">{formatPrice(payment.amount)}</td>
                <td className="p-4">{payment.paymentStatus}</td>
                <td className="p-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                <td className="p-4">{payment.paymentStatus !== "Refunded" && <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700" onClick={() => refund(payment._id)}>Refund</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ManagePayments;
