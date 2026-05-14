import { Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const typeLabels = {
  food: "Food",
  restaurant: "Restaurant",
  deliveryPartner: "Delivery Partner"
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reviews");
      setReviews(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveReply = async (id) => {
    await api.put(`/reviews/${id}/reply`, { reply: replies[id] || "" });
    toast.success("Reply saved");
    setReplies((current) => ({ ...current, [id]: "" }));
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this review?")) return;
    await api.delete(`/reviews/${id}`);
    toast.success("Review deleted");
    load();
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-ink">Reviews</h1>
        <p className="mt-2 text-slate-600">Moderate food, restaurant, and delivery partner reviews.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Comment</th>
                <th className="p-4">User</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Reply / Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td className="p-6 text-center font-bold text-slate-500" colSpan={7}>Loading reviews...</td></tr>}
              {!loading && reviews.map((review) => {
                const isDeliveryPartner = review.reviewType === "deliveryPartner";
                const subject = isDeliveryPartner
                  ? `${review.deliveryPartner?.name || "Delivery Partner"}${review.deliveryPartner?.phone ? ` - ${review.deliveryPartner.phone}` : ""}`
                  : review.restaurant?.name || review.food?.name || "FoodExpress";

                return (
                  <tr key={review._id} className="align-top">
                    <td className="p-4 font-bold">{typeLabels[review.reviewType] || "Food"}</td>
                    <td className="p-4">
                      <p className="font-bold">{subject}</p>
                      {isDeliveryPartner && review.deliveryPartner?.phone && <p className="text-xs text-slate-500">Partner phone: {review.deliveryPartner.phone}</p>}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-black text-amber-700">
                        <Star size={16} className="fill-amber-400 text-amber-400" /> {review.rating}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="max-w-xs text-slate-700">{review.comment}</p>
                      {review.reply && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs"><strong>Reply:</strong> {review.reply}</p>}
                    </td>
                    <td className="p-4">
                      <p className="font-bold">{review.user?.name || review.customerName || "Customer"}</p>
                      {review.user?.email && <p className="text-xs text-slate-500">{review.user.email}</p>}
                    </td>
                    <td className="p-4 font-mono text-xs">{review.order?._id || "-"}</td>
                    <td className="p-4">
                      <div className="flex min-w-64 flex-col gap-2">
                        <input
                          className="input"
                          placeholder="Write a reply"
                          value={replies[review._id] ?? ""}
                          onChange={(event) => setReplies({ ...replies, [review._id]: event.target.value })}
                        />
                        <div className="flex gap-2">
                          <button className="btn-primary py-2" onClick={() => saveReply(review._id)}>Reply</button>
                          <button className="rounded-lg border border-red-200 px-4 py-2 font-bold text-red-600" onClick={() => remove(review._id)}><Trash2 size={17} /></button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && !reviews.length && <tr><td className="p-6 text-center font-bold text-slate-500" colSpan={7}>No reviews yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
