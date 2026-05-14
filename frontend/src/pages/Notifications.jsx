import { Bell, CheckCheck, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notifications/my");
      setNotifications(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.isRead).length, [notifications]);

  const markAsRead = async (id) => {
    try {
      const { data } = await api.put(`/notifications/${id}/read`);
      setNotifications((current) => current.map((notification) => (notification._id === id ? data : notification)));
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update notifications");
    }
  };

  return (
    <section className="container-page py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-black text-ink"><Bell size={28} /> Notifications</h1>
          <p className="mt-2 text-slate-600">Order updates and delivery partner details for your account.</p>
        </div>
        <button className="btn-secondary" onClick={markAllAsRead} disabled={!unreadCount}>
          <CheckCheck size={18} /> Mark all as read
        </button>
      </div>

      <div className="grid gap-4">
        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center font-bold text-slate-500 shadow-sm">
            Loading notifications...
          </div>
        )}

        {!loading && notifications.map((notification) => (
          <article key={notification._id} className={`rounded-lg border p-5 shadow-sm ${notification.isRead ? "border-slate-200 bg-white" : "border-orange-200 bg-orange-50"}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-black text-ink">{notification.title}</h2>
                  <span className={`rounded-lg px-2 py-1 text-xs font-black ${notification.isRead ? "bg-slate-100 text-slate-600" : "bg-orange-500 text-white"}`}>
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{notification.message}</p>
                <p className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-500">
                  <Clock3 size={14} /> {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              {!notification.isRead && (
                <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700" onClick={() => markAsRead(notification._id)}>
                  Mark as read
                </button>
              )}
            </div>
          </article>
        ))}

        {!loading && !notifications.length && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-center font-bold text-slate-500 shadow-sm">
            No notifications yet
          </div>
        )}
      </div>
    </section>
  );
};

export default Notifications;
