import { Bell, Menu, ShoppingCart, Utensils, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import api from "../services/api";

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-brand-100 text-brand-700" : "text-slate-700 hover:bg-slate-100"
  }`;

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || user?.role === "admin") {
      setUnreadCount(0);
      return;
    }

    api.get("/notifications/my")
      .then(({ data }) => setUnreadCount(data.filter((notification) => !notification.isRead).length))
      .catch(() => setUnreadCount(0));
  }, [isAuthenticated, user?.role]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const links = (
    <>
      <NavLink to="/" className={navLinkClass} onClick={() => setOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/foods" className={navLinkClass} onClick={() => setOpen(false)}>
        Foods
      </NavLink>
      {isAuthenticated && user?.role !== "admin" && (
        <NavLink to="/my-orders" className={navLinkClass} onClick={() => setOpen(false)}>
          My Orders
        </NavLink>
      )}
      {isAuthenticated && user?.role !== "admin" && (
        <NavLink to="/notifications" className={navLinkClass} onClick={() => setOpen(false)}>
          Notifications
        </NavLink>
      )}
      {user?.role === "admin" && (
        <NavLink to="/admin/dashboard" className={navLinkClass} onClick={() => setOpen(false)}>
          Admin
        </NavLink>
      )}
      {!isAuthenticated && (
        <>
          <NavLink to="/admin-login" className={navLinkClass} onClick={() => setOpen(false)}>
            Admin Login
          </NavLink>
          <NavLink to="/admin-signup" className={navLinkClass} onClick={() => setOpen(false)}>
            Admin Signup
          </NavLink>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-black text-ink">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-500 text-white">
            <Utensils size={22} />
          </span>
          FoodExpress
        </Link>

        <div className="hidden items-center gap-2 md:flex">{links}</div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/cart" className="relative rounded-lg border border-slate-200 p-2 hover:bg-slate-50">
            <ShoppingCart size={21} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          {isAuthenticated && user?.role !== "admin" && (
            <Link to="/notifications" className="relative rounded-lg border border-slate-200 p-2 hover:bg-slate-50" title="Notifications">
              <Bell size={21} />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-sm font-semibold text-slate-700">
                {user?.name}
              </Link>
              <button onClick={handleLogout} className="btn-secondary py-2">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary py-2">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2">
                Sign up
              </Link>
            </>
          )}
        </div>

        <button className="rounded-lg border border-slate-200 p-2 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">{links}</div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link to="/cart" className="btn-secondary py-2" onClick={() => setOpen(false)}>
              <ShoppingCart size={18} /> Cart ({count})
            </Link>
            {isAuthenticated && user?.role !== "admin" && (
              <Link to="/notifications" className="btn-secondary py-2" onClick={() => setOpen(false)}>
                <Bell size={18} /> Notifications ({unreadCount})
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn-secondary py-2">
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2" onClick={() => setOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary py-2" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
