import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";

const Cart = () => {
  const { items, subtotal, deliveryFee, total, updateQuantity, removeFromCart } = useCart();

  if (!items.length) {
    return (
      <section className="container-page grid min-h-[55vh] place-items-center py-12 text-center">
        <div>
          <ShoppingBag className="mx-auto text-brand-500" size={52} />
          <h1 className="mt-4 text-3xl font-black text-ink">Your cart is empty</h1>
          <Link to="/foods" className="btn-primary mt-6">Browse foods</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="text-4xl font-black text-ink">Cart</h1>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
              <img src={item.image} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />
              <div className="flex-1">
                <h3 className="font-black text-ink">{item.name}</h3>
                <p className="text-sm text-slate-600">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center rounded-lg border border-slate-200">
                <button className="p-2" onClick={() => updateQuantity(item._id, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`} title={`Decrease ${item.name} quantity`}><Minus size={16} /></button>
                <span className="min-w-10 text-center font-bold">{item.quantity}</span>
                <button className="p-2" onClick={() => updateQuantity(item._id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} title={`Increase ${item.name} quantity`}><Plus size={16} /></button>
              </div>
              <p className="font-black">{formatPrice(item.price * item.quantity)}</p>
              <button className="rounded-lg p-2 text-red-600 hover:bg-red-50" onClick={() => removeFromCart(item._id)} aria-label={`Remove ${item.name}`} title={`Remove ${item.name}`}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Order summary</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
          <div className="flex justify-between"><span>Delivery</span><strong>{formatPrice(deliveryFee)}</strong></div>
          <div className="border-t border-slate-200 pt-3 text-lg font-black">
            <div className="flex justify-between"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
        <Link to="/checkout" className="btn-primary mt-5 w-full">Checkout</Link>
      </aside>
    </section>
  );
};

export default Cart;
