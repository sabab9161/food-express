import { Clock, MapPin, Search, Star, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const Foods = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/restaurants")
      .then(({ data }) => setRestaurants(data))
      .catch(() => toast.error("Unable to load restaurants"))
      .finally(() => setLoading(false));
  }, []);

  const filteredRestaurants = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return restaurants;
    return restaurants.filter((restaurant) =>
      [restaurant.name, restaurant.city, restaurant.description].some((field) => field?.toLowerCase().includes(value))
    );
  }, [restaurants, search]);

  return (
    <section className="container-page py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-black text-ink">Restaurants near you</h1>
          <p className="mt-2 text-slate-600">Choose a restaurant first, then browse its menu.</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 text-slate-400" size={19} />
          <input
            className="input pl-10"
            placeholder="Search restaurants or city..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center font-bold text-slate-500">Loading restaurants...</div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <Link
              key={restaurant._id}
              to={`/restaurants/${restaurant._id}/foods`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="relative">
                <img src={restaurant.image} alt={restaurant.name} className="h-48 w-full object-cover" />
                <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-black ${
                  restaurant.isOpen ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
                }`}>
                  {restaurant.isOpen ? "Open" : "Closed"}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-ink group-hover:text-brand-600">{restaurant.name}</h2>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{restaurant.description}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-sm font-black text-white">
                    <Star size={14} className="fill-white" /> {restaurant.rating}
                  </span>
                </div>
                <div className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-2"><Clock size={17} /> {restaurant.deliveryTime} min</span>
                  <span className="flex items-center gap-2"><Truck size={17} /> {formatPrice(restaurant.deliveryFee)} delivery</span>
                  <span className="flex items-center gap-2"><MapPin size={17} /> {restaurant.city}</span>
                </div>
              </div>
            </Link>
          ))}
          {!filteredRestaurants.length && (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center font-bold text-slate-500 sm:col-span-2 lg:col-span-3">
              No restaurants found.
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Foods;
