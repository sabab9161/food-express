import { Clock, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const FoodDetails = () => {
  const [food, setFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { id } = useParams();
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/foods/${id}`).then(({ data }) => setFood(data)).catch(() => toast.error("Food not found"));
  }, [id]);

  if (!food) {
    return <div className="container-page py-16 text-center font-bold text-slate-500">Loading food...</div>;
  }

  return (
    <section className="container-page grid gap-10 py-12 lg:grid-cols-2">
      <img src={food.image} alt={food.name} className="aspect-[4/3] w-full rounded-lg object-cover shadow-soft" />
      <div>
        <Link to="/foods" className="font-bold text-brand-600">Back to menu</Link>
        <p className="mt-5 text-sm font-black uppercase tracking-wide text-brand-600">{food.category}</p>
        <h1 className="mt-2 text-5xl font-black leading-tight text-ink">{food.name}</h1>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-slate-700">
          <span className="flex items-center gap-1"><Star size={18} className="fill-amber-400 text-amber-400" /> {food.rating}</span>
          <span className="flex items-center gap-1"><Clock size={18} /> {food.preparationTime} min</span>
        </div>
        <p className="mt-6 text-lg leading-8 text-slate-600">{food.description}</p>
        <div className="mt-6 flex items-end gap-3">
          <p className="text-4xl font-black text-brand-600">{formatPrice(food.offerPrice || food.price)}</p>
          {food.offerPrice > 0 && <p className="pb-1 text-lg font-bold text-slate-400 line-through">{formatPrice(food.price)}</p>}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
            <button className="p-3" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity" title="Decrease quantity"><Minus size={18} /></button>
            <span className="min-w-12 text-center font-black">{quantity}</span>
            <button className="p-3" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity" title="Increase quantity"><Plus size={18} /></button>
          </div>
          <button className="btn-primary" onClick={() => addToCart(food, quantity)}>
            <ShoppingCart size={19} /> Add to cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default FoodDetails;
