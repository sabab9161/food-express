import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const EmptyRow = ({ colSpan }) => (
  <tr>
    <td className="p-6 text-center font-bold text-slate-500" colSpan={colSpan}>
      No records found
    </td>
  </tr>
);

const getPaymentDetail = (payment) => {
  const details = payment.paymentDetails || payment.order?.paymentDetails || {};

  if (payment.paymentMethod === "UPI") {
    return [details.upiApp, details.upiId].filter(Boolean).join(" / ") || "-";
  }

  if (payment.paymentMethod === "Card") {
    return details.cardLast4 ? `Card ending ${details.cardLast4}` : "-";
  }

  if (payment.paymentMethod === "PayLater") {
    return details.payLaterProvider || "-";
  }

  return "Cash collection pending";
};

const statusClass = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-700",
  Refunded: "bg-slate-100 text-slate-700"
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/payments");
      setPayments(data);
    } catch (loadError) {
      const message = loadError.response?.data?.message || "Unable to load payments";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totals = useMemo(
    () => ({
      paid: payments.filter((payment) => payment.paymentStatus === "Paid").reduce((sum, payment) => sum + payment.amount, 0),
      pending: payments.filter((payment) => payment.paymentStatus === "Pending").reduce((sum, payment) => sum + payment.amount, 0),
      failed: payments.filter((payment) => payment.paymentStatus === "Failed").reduce((sum, payment) => sum + payment.amount, 0),
      refunded: payments.filter((payment) => payment.paymentStatus === "Refunded").reduce((sum, payment) => sum + payment.amount, 0)
    }),
    [payments]
  );

  const refundPayment = async (payment) => {
    try {
      await api.put(`/payments/${payment._id}/refund`);
      toast.success("Payment refunded");
      loadPayments();
    } catch (refundError) {
      toast.error(refundError.response?.data?.message || "Refund failed");
    }
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-ink">Payments</h1>
          <p className="mt-2 text-slate-600">View transactions, refund payments, and track revenue status.</p>
        </div>
        <button className="btn-secondary" onClick={loadPayments} disabled={loading}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Total paid</p><p className="mt-1 text-3xl font-black text-ink">{formatPrice(totals.paid)}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Total pending</p><p className="mt-1 text-3xl font-black text-ink">{formatPrice(totals.pending)}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Total failed</p><p className="mt-1 text-3xl font-black text-ink">{formatPrice(totals.failed)}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-bold text-slate-500">Total refunded</p><p className="mt-1 text-3xl font-black text-ink">{formatPrice(totals.refunded)}</p></div>
      </div>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Payment Details</th>
                <th className="p-4">Date</th>
                <th className="p-4">Refund</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <EmptyRow colSpan={8} />}
              {!loading && payments.map((payment) => (
                <tr key={payment._id}>
                  <td className="p-4 font-bold">#{(payment.order?._id || payment.order || payment._id).slice(-6).toUpperCase()}</td>
                  <td className="p-4">
                    <p className="font-bold">{payment.user?.name || "Customer"}</p>
                    <p className="text-xs text-slate-500">{payment.user?.email || "-"}</p>
                  </td>
                  <td className="p-4 font-black">{formatPrice(payment.amount)}</td>
                  <td className="p-4">{payment.paymentMethod}</td>
                  <td className="p-4">
                    <span className={`rounded-lg px-3 py-1 text-xs font-black ${statusClass[payment.paymentStatus] || "bg-slate-100 text-slate-700"}`}>
                      {payment.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-700">{getPaymentDetail(payment)}</td>
                  <td className="p-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {payment.paymentStatus !== "Refunded" ? (
                      <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700" onClick={() => refundPayment(payment)}>
                        Refund
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-500">Refunded</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && !payments.length && <EmptyRow colSpan={8} />}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Payments;
