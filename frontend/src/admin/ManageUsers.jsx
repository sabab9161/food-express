import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = () => {
    api.get("/users").then(({ data }) => setUsers(data)).catch(() => toast.error("Unable to load users"));
  };

  useEffect(loadUsers, []);

  const toggleBlock = async (user) => {
    try {
      await api.put(`/users/${user._id}/status`, { isBlocked: !user.isBlocked });
      toast.success("User updated");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const deleteUser = async (user) => {
    if (!confirm(`Delete ${user.name}?`)) return;
    try {
      await api.delete(`/users/${user._id}`);
      toast.success("User deleted");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const viewOrders = async (user) => {
    setSelectedUser(user);
    try {
      const { data } = await api.get(`/users/${user._id}/orders`);
      setOrders(data);
    } catch {
      setOrders([]);
      toast.error("Unable to load order history");
    }
  };

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-ink">Manage users</h1>
        <p className="mt-2 text-slate-600">View registered customers and administrators.</p>
      </div>
      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-blue-700">
            <Users />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Registered users</p>
            <p className="text-3xl font-black text-ink">{users.length}</p>
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Joined</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="p-4 font-bold">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.role === "admin" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-700"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">{user.phone || "-"}</td>
                  <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{user.isBlocked ? "Blocked" : "Active"}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black" onClick={() => viewOrders(user)}>Orders</button>
                      <button className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-black text-amber-700" onClick={() => toggleBlock(user)}>{user.isBlocked ? "Unblock" : "Block"}</button>
                      <button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-black text-red-700" onClick={() => deleteUser(user)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedUser && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">{selectedUser.name} order history</h2>
            <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold" onClick={() => setSelectedUser(null)}>Close</button>
          </div>
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order._id} className="rounded-lg bg-slate-50 p-4 text-sm">
                <div className="font-black">#{order._id.slice(-6).toUpperCase()} - {order.status}</div>
                <div className="mt-1 text-slate-600">{order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}</div>
              </div>
            ))}
            {!orders.length && <p className="text-sm font-bold text-slate-500">No orders found.</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export default ManageUsers;
