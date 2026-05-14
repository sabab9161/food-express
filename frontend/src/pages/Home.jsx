import { ArrowRight, Clock, Search, ShieldCheck, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const categories = ["Pizza", "Burgers", "Rice", "Sushi", "Pasta", "Salads"];

const Home = () => {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get("/foods").then(({ data }) => setFeatured(data.slice(0, 4))).catch(() => setFeatured([]));
  }, []);

  return (
    <>
      <section className="bg-white">
        <div className="container-page grid min-h-[560px] items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-2 text-sm font-bold text-brand-700">
              <Truck size={17} /> Fast delivery in your area
            </span>
            <h1 className="mt-6 max-w-2xl text-5xl font-black leading-tight text-ink md:text-6xl">
              Fresh food delivered to your door.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Order chef-made meals, local favorites, and quick bites from FoodExpress with live order tracking and reliable checkout.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/foods" className="btn-primary">
                Order now <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary">
                Create account
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["30 min", "Average delivery"],
                ["4.8/5", "Customer rating"],
                ["120+", "Menu choices"]
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-black text-ink">{value}</p>
                  <p className="text-sm text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85"
              alt="Fresh food spread"
              className="aspect-[4/3] w-full rounded-lg object-cover shadow-soft"
            />
            <div className="absolute bottom-5 left-5 right-5 rounded-lg bg-white/95 p-4 shadow-soft backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-500 text-white">
                  <Clock />
                </div>
                <div>
                  <p className="font-black text-ink">Hot meals, right on time</p>
                  <p className="text-sm text-slate-600">Prepared fresh and handed off quickly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-ink">Browse categories</h2>
            <p className="mt-2 text-slate-600">Find the right meal for every craving.</p>
          </div>
          <Link to="/foods" className="hidden font-bold text-brand-600 sm:inline">
            View menu
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category}
              to={`/foods?category=${category}`}
              className="rounded-lg border border-slate-200 bg-white p-5 text-center font-bold shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-ink">Popular dishes</h2>
            <p className="mt-2 text-slate-600">Guest favorites ready for your next order.</p>
          </div>
          <Search className="text-brand-500" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featured.map((food) => (
            <Link key={food._id} to={`/foods/${food._id}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-soft">
              <img src={food.image} alt={food.name} className="h-44 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-black text-ink">{food.name}</h3>
                  <span className="font-black text-brand-600">{formatPrice(food.offerPrice || food.price)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{food.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span className="flex items-center gap-1"><Star size={16} className="fill-amber-400 text-amber-400" /> {food.rating}</span>
                  <span>{food.preparationTime} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-ink py-12 text-white">
        <div className="container-page grid gap-5 md:grid-cols-3">
          {[
            [ShieldCheck, "Secure checkout", "Protected account access and order placement."],
            [Clock, "Quick preparation", "Restaurants receive orders instantly."],
            [Truck, "Reliable delivery", "Status updates from pending to delivered."]
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-lg border border-white/10 p-6">
              <Icon className="text-brand-500" />
              <h3 className="mt-4 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;
