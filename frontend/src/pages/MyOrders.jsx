import { PackageCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const initialReviewForm = { rating: 5, comment: "" };

const reviewLabels = {
  food: "Food",
  restaurant: "Restaurant",
  deliveryPartner: "Delivery Partner"
};

const getFoodId = (item) => (typeof item.food === "object" ? item.food?._id : item.food);
const getPartnerId = (partner) => (typeof partner === "object" ? partner?._id : partner);

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeReview, setActiveReview] = useState(null);
  const [reviewForm, setReviewForm] = useState(initialReviewForm);
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = () => {
    api.get("/orders/my-orders").then(({ data }) => setOrders(data)).catch(() => toast.error("Unable to load orders"));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openReview = (order, reviewType) => {
    setActiveReview({ orderId: order._id, reviewType });
    setReviewForm(initialReviewForm);
  };

  const submitReview = async (order) => {
    if (!reviewForm.comment.trim()) {
      toast.error("Comment is required");
      return;
    }

    const firstItem = order.items[0];
    const payload = {
      order: order._id,
      reviewType: activeReview.reviewType,
      rating: Number(reviewForm.rating),
      comment: reviewForm.comment.trim()
    };

    if (activeReview.reviewType === "food") {
      payload.food = getFoodId(firstItem);
    }

    if (activeReview.reviewType === "deliveryPartner") {
      payload.deliveryPartner = getPartnerId(order.deliveryPartner);
    }

    setSubmitting(true);
    try {
      await api.post("/reviews", payload);
      toast.success(`${reviewLabels[activeReview.reviewType]} review submitted`);
      setActiveReview(null);
      setReviewForm(initialReviewForm);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-page py-10">
      <h1 className="text-4xl font-black text-ink">My orders</h1>
      <div className="mt-6 space-y-5">
        {orders.map((order) => {
          const canReview = order.status === "Delivered";
          const isActiveOrder = activeReview?.orderId === order._id;

          return (
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
                  <div key={getFoodId(item)} className="flex justify-between py-3 text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              {order.deliveryPartner && (
                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <strong>Delivery partner:</strong> {typeof order.deliveryPartner === "object" ? `${order.deliveryPartner.name} (${order.deliveryPartner.phone})` : "Assigned"}
                </div>
              )}
              <div className="mt-3 flex justify-end text-lg font-black">Total: {formatPrice(order.total)}</div>

              {canReview && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary py-2" onClick={() => openReview(order, "food")}>Review Food</button>
                    <button type="button" className="btn-secondary py-2" onClick={() => openReview(order, "restaurant")}>Review Restaurant</button>
                    <button type="button" className="btn-secondary py-2" onClick={() => openReview(order, "deliveryPartner")}>Review Delivery Partner</button>
                  </div>

                  {isActiveOrder && (
                    <div className="mt-4 rounded-lg border border-slate-200 p-4">
                      <h2 className="text-lg font-black">Review {reviewLabels[activeReview.reviewType]}</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            type="button"
                            key={rating}
                            className={`flex items-center gap-1 rounded-lg border px-3 py-2 font-black ${Number(reviewForm.rating) >= rating ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500"}`}
                            onClick={() => setReviewForm({ ...reviewForm, rating })}
                          >
                            <Star size={17} className={Number(reviewForm.rating) >= rating ? "fill-amber-400 text-amber-400" : ""} />
                            {rating}
                          </button>
                        ))}
                      </div>
                      <textarea
                        className="input mt-3 min-h-28"
                        placeholder="Write your review"
                        value={reviewForm.comment}
                        onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" className="btn-primary" disabled={submitting} onClick={() => submitReview(order)}>
                          {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                        <button type="button" className="btn-secondary" onClick={() => setActiveReview(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
        {!orders.length && <p className="rounded-lg border border-slate-200 bg-white p-8 text-center font-bold text-slate-500">No orders yet.</p>}
      </div>
    </section>
  );
};

export default MyOrders;
