import { CheckCircle2, Circle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const statusOrder = ["Pending", "Accepted", "Preparing", "Ready for Pickup", "Out for Delivery", "Delivered"];

const allowedStatusOptions = {
  Pending: ["Accepted", "Cancelled"],
  Accepted: ["Preparing", "Cancelled"],
  Preparing: ["Ready for Pickup", "Cancelled"],
  "Ready for Pickup": ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
  Delivered: [],
  Cancelled: [],
  Refunded: []
};

const paymentStatusClasses = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Failed: "bg-red-50 text-red-700",
  Refunded: "bg-slate-100 text-slate-700"
};

const orderStatusClasses = {
  Delivered: "bg-emerald-50 text-emerald-700",
  Cancelled: "bg-red-50 text-red-700",
  Refunded: "bg-slate-100 text-slate-700"
};

const paymentMethodLabels = {
  COD: "Cash on Delivery",
  UPI: "UPI",
  Card: "Card",
  PayLater: "Pay Later"
};

const getPaymentDetail = (order) => {
  const details = order.paymentDetails || {};

  if (order.paymentMethod === "UPI") {
    return [details.upiApp, details.upiId].filter(Boolean).join(" / ") || "UPI";
  }

  if (order.paymentMethod === "Card") {
    return details.cardLast4 ? `Card ending ${details.cardLast4}` : "Card";
  }

  if (order.paymentMethod === "PayLater") {
    return details.payLaterProvider || "Pay Later";
  }

  return "COD";
};

const StatusTimeline = ({ status }) => {
  const activeIndex = statusOrder.indexOf(status);

  return (
    <div className="mt-3 min-w-72">
      <div className="flex items-center">
        {statusOrder.map((step, index) => {
          const completed = activeIndex >= index;
          return (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${completed ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                {completed ? <CheckCircle2 size={14} /> : <Circle size={12} />}
              </span>
              {index < statusOrder.length - 1 && <span className={`h-1 flex-1 ${activeIndex > index ? "bg-orange-500" : "bg-slate-200"}`} />}
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-6 gap-1 text-[10px] font-bold text-slate-500">
        {statusOrder.map((step) => (
          <span key={step} className={step === status ? "text-orange-700" : ""}>{step}</span>
        ))}
      </div>
    </div>
  );
};

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedPartners, setSelectedPartners] = useState({});

  const loadOrders = () => {
    api.get("/orders").then(({ data }) => setOrders(data)).catch(() => toast.error("Unable to load orders"));
  };

  useEffect(() => {
    loadOrders();
    api.get("/delivery-partners").then(({ data }) => setPartners(data)).catch(() => setPartners([]));
  }, []);

  const updateOrder = async (id, updates) => {
    try {
      const currentOrder = orders.find((order) => order._id === id);
      const { data } = await api.put(`/orders/${id}/status`, {
        status: currentOrder.status,
        ...updates
      });
      setOrders((current) => current.map((order) => (order._id === id ? data : order)));
      toast.success("Order updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const assignDeliveryPartner = async (order) => {
    const deliveryPartner = selectedPartners[order._id];

    if (!deliveryPartner) {
      toast.error("Select a delivery partner");
      return;
    }

    try {
      const { data } = await api.put(`/orders/${order._id}/assign-delivery-partner`, { deliveryPartnerId: deliveryPartner });
      setOrders((current) => current.map((currentOrder) => (currentOrder._id === order._id ? data : currentOrder)));
      setSelectedPartners((current) => ({ ...current, [order._id]: "" }));
      toast.success("Delivery partner assigned");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to assign delivery partner");
    }
  };

  const showAssignmentLockedMessage = () => {
    toast.error("Once you assign partner, you cannot change or unassign partner.");
  };

  const printInvoice = (order) => {
    const lines = order.items.map((item) => `${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join("\n");
    const invoice = `FoodExpress Invoice\nOrder #${order._id.slice(-6).toUpperCase()}\nCustomer: ${order.user?.name || "User"}\n\n${lines}\n\nTotal: ${formatPrice(order.total)}`;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<pre style="font-family:Inter,Arial;padding:24px">${invoice}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-ink">Manage orders</h1>
          <p className="mt-2 text-slate-600">View orders and update delivery status.</p>
        </div>
        <button onClick={loadOrders} className="btn-secondary">
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment Type</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Delivery Partner</th>
                <th className="p-4">Assignment Status</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const options = allowedStatusOptions[order.status] || [];
                const terminal = ["Delivered", "Cancelled", "Refunded"].includes(order.status);
                const canCancel = options.includes("Cancelled");
                const assignedPartner = order.deliveryPartner;

                return (
                  <tr key={order._id}>
                    <td className="p-4 font-bold">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="font-bold">{order.user?.name || "User"}</p>
                      <p className="text-xs text-slate-500">{order.user?.email}</p>
                      <p className="text-xs text-slate-500">{order.user?.phone}</p>
                    </td>
                    <td className="p-4 font-black">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <p className="font-black text-ink">{paymentMethodLabels[order.paymentMethod] || order.paymentMethod || "COD"}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">{getPaymentDetail(order)}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-black ${paymentStatusClasses[order.paymentStatus] || "bg-slate-100 text-slate-700"}`}>
                        {order.paymentStatus || "Pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      {assignedPartner ? (
                        <button type="button" className="block w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left" onClick={showAssignmentLockedMessage}>
                          <p className="font-black text-ink">{assignedPartner.name}</p>
                          <p className="mt-1 text-xs font-bold text-slate-500">{assignedPartner.phone || "-"}</p>
                          <p className="mt-1 text-xs font-bold text-slate-500">{assignedPartner.vehicleNumber || assignedPartner.vehicleType || "-"}</p>
                          <span className={`mt-2 inline-flex rounded-lg px-2 py-1 text-[11px] font-black ${
                            assignedPartner.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
                          }`}>
                            {assignedPartner.status || "Assigned"}
                          </span>
                        </button>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <select
                            className="input min-w-44 py-2"
                            value={selectedPartners[order._id] || ""}
                            onChange={(e) => setSelectedPartners((current) => ({ ...current, [order._id]: e.target.value }))}
                          >
                            <option value="">Select partner</option>
                            {partners.map((partner) => <option key={partner._id} value={partner._id}>{partner.name}</option>)}
                          </select>
                          <button className="rounded-lg border border-orange-200 px-3 py-2 text-xs font-black text-orange-700" onClick={() => assignDeliveryPartner(order)}>
                            Assign
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {assignedPartner ? (
                        <div>
                          <button type="button" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700" onClick={showAssignmentLockedMessage}>
                            Partner Assigned
                          </button>
                          <p className="mt-2 text-xs font-black text-slate-600">Cannot change or unassign partner</p>
                          {order.deliveryPartnerAssignedAt && <p className="mt-2 text-xs font-bold text-slate-500">{new Date(order.deliveryPartnerAssignedAt).toLocaleString()}</p>}
                        </div>
                      ) : (
                        <span className="inline-flex rounded-lg bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Not assigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      {terminal ? (
                        <span className={`inline-flex rounded-lg px-3 py-2 text-xs font-black ${orderStatusClasses[order.status] || "bg-slate-100 text-slate-700"}`}>
                          {order.status}
                        </span>
                      ) : (
                        <select className="input min-w-52 py-2" value={order.status} onChange={(e) => updateOrder(order._id, { status: e.target.value })}>
                          <option value={order.status} disabled>{order.status}</option>
                          {options.map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      )}
                      <StatusTimeline status={order.status} />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black" onClick={() => printInvoice(order)}>Print</button>
                        {canCancel && (
                          <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700" onClick={() => updateOrder(order._id, { status: "Cancelled" })}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ManageOrders;
