import { Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [reply, setReply] = useState("");
  const load = () => api.get("/reviews").then(({ data }) => setReviews(data)).catch(() => toast.error("Unable to load reviews"));
  useEffect(load, []);
  const saveReply = async (id) => {
    await api.put(`/reviews/${id}/reply`, { reply });
    toast.success("Reply saved");
    setReply("");
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
      <div className="mb-6"><h1 className="text-4xl font-black text-ink">Reviews</h1><p className="mt-2 text-slate-600">Moderate ratings, remove fake reviews, and reply to customers.</p></div>
      <div className="grid gap-5">
        {reviews.map((review) => (
          <article key={review._id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="font-black">{review.customerName}</p><p className="text-sm text-slate-500">{review.restaurant?.name || review.food?.name || "FoodExpress"}</p></div>
              <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700"><Star size={16} className="fill-amber-400 text-amber-400" /> {review.rating}</div>
            </div>
            <p className="mt-4 text-slate-700">{review.comment}</p>
            {review.reply && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm"><strong>Reply:</strong> {review.reply}</p>}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input className="input" placeholder="Write a reply" value={reply} onChange={(e) => setReply(e.target.value)} />
              <button className="btn-primary shrink-0" onClick={() => saveReply(review._id)}>Reply</button>
              <button className="rounded-lg border border-red-200 px-4 py-2 font-bold text-red-600" onClick={() => remove(review._id)}><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
        {!reviews.length && <div className="rounded-lg border border-slate-200 bg-white p-8 text-center font-bold text-slate-500">No reviews yet.</div>}
      </div>
    </section>
  );
};

export default ManageReviews;
