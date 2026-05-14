import {
  BadgeIndianRupee,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const paymentMethods = [
  { id: "UPI", title: "UPI", subtitle: "Google Pay, PhonePe, Paytm, BHIM", icon: QrCode },
  { id: "Card", title: "Card Payment", subtitle: "Credit or debit card", icon: CreditCard },
  { id: "COD", title: "Cash on Delivery", subtitle: "Pay when food arrives", icon: Banknote },
  { id: "PayLater", title: "Pay Later", subtitle: "LazyPay, Simpl and more", icon: Clock3 }
];

const upiApps = [
  { id: "Google Pay", initials: "GPay", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "PhonePe", initials: "Pe", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "Paytm", initials: "Paytm", color: "bg-sky-50 text-sky-700 border-sky-200" },
  { id: "BHIM UPI", initials: "BHIM", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
];

const payLaterProviders = ["LazyPay", "Amazon Pay Later", "Simpl", "Mobikwik Zip"];

const methodLabel = {
  UPI: "UPI",
  Card: "Card",
  COD: "Cash on Delivery",
  PayLater: "Pay Later"
};

const Checkout = () => {
  const { user } = useAuth();
  const { items, subtotal, deliveryFee, clearCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    deliveryAddress: user?.address || "",
    phone: user?.phone || "",
    paymentMethod: "UPI"
  });
  const [paymentDetails, setPaymentDetails] = useState({
    upiApp: "Google Pay",
    upiId: "",
    cardNumber: "",
    cardHolderName: "",
    expiry: "",
    cvv: "",
    payLaterProvider: ""
  });

  const couponDiscount = coupon?.discountAmount || 0;
  const discountedSubtotal = Math.max(subtotal - couponDiscount, 0);
  const finalTotal = discountedSubtotal + deliveryFee;

  const restaurantId = items.find((item) => item.restaurant)?.restaurant?._id || items.find((item) => item.restaurant)?.restaurant || "";

  const updatePaymentDetail = (key, value) => {
    setPaymentDetails((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const selectMethod = (paymentMethod) => {
    setForm((current) => ({ ...current, paymentMethod }));
    setErrors({});
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Enter coupon code");
      return;
    }

    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    setCouponLoading(true);
    try {
      const { data } = await api.post("/coupons/apply", {
        code: couponCode.trim(),
        cartItems: items.map((item) => ({
          _id: item._id,
          food: item._id,
          restaurant: item.restaurant?._id || item.restaurant,
          restaurantId: item.restaurant?._id || item.restaurant,
          quantity: item.quantity,
          price: item.price
        })),
        restaurantId,
        totalAmount: subtotal
      });
      setCoupon({ code: couponCode.trim().toUpperCase(), ...data });
      toast.success(data.message || "Coupon applied successfully");
    } catch (error) {
      setCoupon(null);
      toast.error(error.response?.data?.message || "Unable to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode("");
  };

  const validatePayment = () => {
    const nextErrors = {};
    const cardDigits = paymentDetails.cardNumber.replace(/\D/g, "");

    if (form.paymentMethod === "UPI" && !paymentDetails.upiId.trim()) {
      nextErrors.upiId = "UPI ID is required";
    }

    if (form.paymentMethod === "Card") {
      if (cardDigits.length !== 16) nextErrors.cardNumber = "Card number must be 16 digits";
      if (!paymentDetails.cardHolderName.trim()) nextErrors.cardHolderName = "Card holder name is required";
      if (!paymentDetails.expiry.trim()) nextErrors.expiry = "Expiry is required";
      if (!/^\d{3}$/.test(paymentDetails.cvv)) nextErrors.cvv = "CVV must be 3 digits";
    }

    if (form.paymentMethod === "PayLater" && !paymentDetails.payLaterProvider) {
      nextErrors.payLaterProvider = "Select a pay later provider";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getPaymentPayload = () => {
    if (form.paymentMethod === "UPI") {
      return {
        upiApp: paymentDetails.upiApp,
        upiId: paymentDetails.upiId.trim()
      };
    }

    if (form.paymentMethod === "Card") {
      return {
        cardNumber: paymentDetails.cardNumber.replace(/\D/g, ""),
        cardHolderName: paymentDetails.cardHolderName.trim(),
        expiry: paymentDetails.expiry.trim(),
        cvv: paymentDetails.cvv
      };
    }

    if (form.paymentMethod === "PayLater") {
      return {
        payLaterProvider: paymentDetails.payLaterProvider
      };
    }

    return {};
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    if (!items.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!validatePayment()) {
      toast.error("Check payment details");
      return;
    }

    setProcessing(true);
    try {
      if (form.paymentMethod !== "COD") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const paymentStatus = ["UPI", "Card", "PayLater"].includes(form.paymentMethod) ? "Paid" : "Pending";

      await api.post("/orders", {
        ...form,
        paymentStatus,
        paymentDetails: getPaymentPayload(),
        couponCode: coupon?.code || "",
        couponDiscount,
        items: items.map((item) => ({ food: item._id, quantity: item.quantity }))
      });
      clearCart();
      toast.success(form.paymentMethod === "COD" ? "Order placed. Pay on delivery." : "Payment successful. Order placed.");
      navigate("/my-orders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to place order");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <form onSubmit={placeOrder} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">Checkout</h1>
            <p className="mt-1 text-sm font-bold text-slate-500">Demo payment simulation. No real money will be transferred.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
            <ShieldCheck size={16} /> Secure demo
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 font-bold"><MapPin size={18} /> Delivery address</span>
            <textarea className="input min-h-28" value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} required />
          </label>
          <label className="block">
            <span className="mb-2 block font-bold">Phone</span>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </label>
        </div>

        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink"><BadgeIndianRupee size={20} /> Payment method</h2>
            <span className="text-sm font-black text-ink">{formatPrice(finalTotal)}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const selected = form.paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => selectMethod(method.id)}
                  className={`flex min-h-24 items-center gap-3 rounded-lg border p-4 text-left transition ${
                    selected ? "border-orange-500 bg-orange-50 shadow-sm" : "border-slate-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${selected ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700"}`}>
                    <Icon size={21} />
                  </span>
                  <span>
                    <span className="block font-black text-ink">{method.title}</span>
                    <span className="mt-1 block text-xs font-bold text-slate-500">{method.subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            {form.paymentMethod === "UPI" && (
              <div className="space-y-4">
                <div>
                  <p className="mb-3 text-sm font-black text-slate-700">Choose UPI app</p>
                  <div className="grid gap-3 sm:grid-cols-4">
                    {upiApps.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => updatePaymentDetail("upiApp", app.id)}
                        className={`rounded-lg border p-3 text-center text-sm font-black transition ${
                          paymentDetails.upiApp === app.id ? `${app.color} ring-2 ring-orange-200` : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <span className="block">{app.initials}</span>
                        <span className="mt-1 block text-[11px] font-bold">{app.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold"><Smartphone size={16} /> UPI ID</span>
                  <input className="input" placeholder="name@upi" value={paymentDetails.upiId} onChange={(e) => updatePaymentDetail("upiId", e.target.value)} />
                  {errors.upiId && <span className="mt-1 block text-xs font-bold text-red-600">{errors.upiId}</span>}
                </label>
              </div>
            )}

            {form.paymentMethod === "Card" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold">Card number</span>
                  <input className="input" inputMode="numeric" maxLength={19} placeholder="1234 5678 9012 3456" value={paymentDetails.cardNumber} onChange={(e) => updatePaymentDetail("cardNumber", e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())} />
                  {errors.cardNumber && <span className="mt-1 block text-xs font-bold text-red-600">{errors.cardNumber}</span>}
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-2 block text-sm font-bold">Card holder name</span>
                  <input className="input" placeholder="Name on card" value={paymentDetails.cardHolderName} onChange={(e) => updatePaymentDetail("cardHolderName", e.target.value)} />
                  {errors.cardHolderName && <span className="mt-1 block text-xs font-bold text-red-600">{errors.cardHolderName}</span>}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">Expiry date</span>
                  <input className="input" placeholder="MM/YY" maxLength={5} value={paymentDetails.expiry} onChange={(e) => updatePaymentDetail("expiry", e.target.value)} />
                  {errors.expiry && <span className="mt-1 block text-xs font-bold text-red-600">{errors.expiry}</span>}
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold">CVV</span>
                  <input className="input" inputMode="numeric" maxLength={3} placeholder="123" value={paymentDetails.cvv} onChange={(e) => updatePaymentDetail("cvv", e.target.value.replace(/\D/g, ""))} />
                  {errors.cvv && <span className="mt-1 block text-xs font-bold text-red-600">{errors.cvv}</span>}
                </label>
                <p className="rounded-lg bg-white p-3 text-xs font-bold text-slate-500 sm:col-span-2">
                  Only the last 4 digits are saved for this demo. Full card number and CVV are never stored.
                </p>
              </div>
            )}

            {form.paymentMethod === "COD" && (
              <div className="flex gap-3 rounded-lg bg-white p-4">
                <CheckCircle2 className="mt-0.5 text-emerald-600" size={22} />
                <div>
                  <p className="font-black text-ink">Pay by cash when your order arrives</p>
                  <p className="mt-1 text-sm text-slate-600">Payment status will remain Pending until collection at delivery.</p>
                </div>
              </div>
            )}

            {form.paymentMethod === "PayLater" && (
              <div>
                <p className="mb-3 text-sm font-black text-slate-700">Choose pay later provider</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {payLaterProviders.map((provider) => (
                    <button
                      key={provider}
                      type="button"
                      onClick={() => updatePaymentDetail("payLaterProvider", provider)}
                      className={`rounded-lg border p-4 text-left font-black transition ${
                        paymentDetails.payLaterProvider === provider ? "border-orange-500 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {provider}
                    </button>
                  ))}
                </div>
                {errors.payLaterProvider && <span className="mt-2 block text-xs font-bold text-red-600">{errors.payLaterProvider}</span>}
              </div>
            )}
          </div>
        </div>

        <button className="btn-primary mt-6 w-full" disabled={processing}>
          {processing ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Processing {methodLabel[form.paymentMethod]} payment...
            </>
          ) : (
            <>Place Order - {formatPrice(finalTotal)}</>
          )}
        </button>
      </form>

      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Order total</h2>
        <div className="mt-5 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item._id} className="flex justify-between gap-4">
              <span>{item.name} x {item.quantity}</span>
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="border-t border-slate-200 pt-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Coupon code</span>
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Enter coupon"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  disabled={Boolean(coupon)}
                />
                {coupon ? (
                  <button type="button" className="btn-secondary shrink-0" onClick={removeCoupon}>Remove</button>
                ) : (
                  <button type="button" className="btn-primary shrink-0" onClick={applyCoupon} disabled={couponLoading}>
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                )}
              </div>
            </label>
            {coupon && <p className="mt-2 text-xs font-bold text-emerald-700">{coupon.message}</p>}
          </div>
          <div className="border-t border-slate-200 pt-3">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
            <div className="mt-2 flex justify-between text-emerald-700"><span>Coupon Discount</span><strong>-{formatPrice(couponDiscount)}</strong></div>
            <div className="mt-2 flex justify-between"><span>Delivery</span><strong>{formatPrice(deliveryFee)}</strong></div>
            <div className="mt-3 flex justify-between text-lg font-black"><span>Final Total</span><span>{formatPrice(finalTotal)}</span></div>
          </div>
        </div>
      </aside>
    </section>
  );
};

export default Checkout;
