import { BarChart3, Bell, ClipboardList, CreditCard, Gift, LogOut, Menu, PackagePlus, Settings, Star, Store, Truck, Users, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/restaurants", label: "Restaurants", icon: Store },
  { to: "/admin/foods", label: "Foods", icon: PackagePlus },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/delivery-partners", label: "Delivery Partners", icon: Truck },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/coupons", label: "Coupons", icon: Gift },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings }
];

const AdminLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-ink">FoodExpress</h1>
        <p className="mt-1 text-sm text-slate-500">Admin panel</p>
      </div>
      <nav className="space-y-2 overflow-y-auto pb-4">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 font-bold transition ${
                isActive ? "bg-brand-500 text-white" : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-lg px-4 py-3 font-bold text-red-600 hover:bg-red-50">
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          className="rounded-lg border border-slate-200 p-2"
          onClick={() => setOpen(true)}
          aria-label="Menu"
          title="Menu"
        >
          <Menu />
        </button>
        <span className="font-black">FoodExpress Admin</span>
        <span className="text-sm font-bold text-slate-600">{user?.name}</span>
      </header>
      <div className="flex">
        <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              className="absolute inset-0 bg-slate-900/40"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              title="Close menu"
            />
            <div className="relative h-full">
              {sidebar}
              <button
                className="absolute right-4 top-4 rounded-lg border border-slate-200 bg-white p-2"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                title="Close menu"
              >
                <X />
              </button>
            </div>
          </div>
        )}
        <main className="min-h-screen flex-1 p-4 lg:ml-72 lg:p-8">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
