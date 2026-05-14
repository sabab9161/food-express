import { Clock, MapPin, Search, ShoppingCart, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const RestaurantFoods = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get(`/restaurants/${id}`), api.get("/foods", { params: { restaurant: id } })])
      .then(([restaurantResponse, foodsResponse]) => {
        setRestaurant(restaurantResponse.data);
        setFoods(foodsResponse.data);
      })
      .catch(() => toast.error("Unable to load restaurant menu"))
      .finally(() => setLoading(false));
  }, [id]);

  const categories = useMemo(() => ["All", ...new Set(foods.map((food) => food.category))], [foods]);
  const visibleFoods = useMemo(() => {
    const value = search.trim().toLowerCase();
    return foods.filter((food) => {
      const matchesSearch = !value || [food.name, food.description].some((field) => field?.toLowerCase().includes(value));
      const matchesCategory = category === "All" || food.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [foods, search, category]);

  if (loading || !restaurant) {
    return <div className="container-page py-16 text-center font-bold text-slate-500">Loading menu...</div>;
  }

  return (
    <section className="container-page py-10">
      <Link to="/foods" className="font-bold text-brand-600">Back to restaurants</Link>
      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid md:grid-cols-[0.9fr_1.2fr]">
          <img src={restaurant.image} alt={restaurant.name} className="h-full min-h-72 w-full object-cover" />
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${
                  restaurant.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                }`}>
                  {restaurant.isOpen ? "Open now" : "Closed"}
                </span>
                <h1 className="mt-4 text-4xl font-black text-ink">{restaurant.name}</h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600">{restaurant.description}</p>
              </div>
              <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-2 font-black text-white">
                <Star size={16} className="fill-white" /> {restaurant.rating}
              </span>
            </div>
            <div className="mt-6 grid gap-3 text-sm font-bold text-slate-700 sm:grid-cols-3">
              <span className="flex items-center gap-2"><Clock size={18} /> {restaurant.deliveryTime} min</span>
              <span className="flex items-center gap-2"><Truck size={18} /> {formatPrice(restaurant.deliveryFee)} fee</span>
              <span className="flex items-center gap-2"><MapPin size={18} /> {restaurant.city}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-500">{restaurant.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-ink">Menu</h2>
          <p className="mt-2 text-slate-600">Search dishes and filter by category.</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 text-slate-400" size={19} />
          <input className="input pl-10" placeholder="Search food..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold ${
              category === item ? "bg-brand-500 text-white" : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFoods.map((food) => (
          <article key={food._id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <Link to={`/foods/${food._id}`}>
              <img src={food.image} alt={food.name} className="h-52 w-full object-cover" />
            </Link>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={`/foods/${food._id}`} className="text-xl font-black text-ink hover:text-brand-600">{food.name}</Link>
                  <p className="mt-1 text-sm font-semibold text-brand-600">{food.category}</p>
                </div>
                <p className="text-xl font-black">{formatPrice(food.offerPrice || food.price)}</p>
              </div>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{food.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm font-bold text-slate-700">
                  <Star size={17} className="fill-amber-400 text-amber-400" /> {food.rating}
                </span>
                <button onClick={() => addToCart(food)} className="btn-primary py-2" disabled={!restaurant.isOpen || !food.isAvailable}>
                  <ShoppingCart size={18} /> Add
                </button>
              </div>
            </div>
          </article>
        ))}
        {!visibleFoods.length && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center font-bold text-slate-500 sm:col-span-2 lg:col-span-3">
            No foods found for this restaurant.
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantFoods;
