import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.put("/users/me", form);
      updateUser(res.data);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-bold text-white font-display">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account settings
        </p>
      </div>

      <div className="space-y-4 animate-slide-up">
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-cyan-400/20 to-purple-600/20 border border-cyan-400/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-cyan-400 font-mono">
                {user?.username?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-white font-semibold font-display">
                {user?.username}
              </p>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span
                className={user?.role === "admin" ? "tag-admin" : "tag-user"}
              >
                {user?.role}
              </span>
            </div>
          </div>

          <div className="border-t border-dark-600 pt-5">
            <h2 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">
              Account Details
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "User ID", value: user?._id?.slice(-8), mono: true },
                { label: "Role", value: user?.role },
                {
                  label: "Member Since",
                  value: user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—",
                },
                { label: "Status", value: "Active" },
              ].map((item) => (
                <div key={item.label} className="bg-dark-700 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-mono uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p
                    className={`text-sm text-gray-200 ${item.mono ? "font-mono" : ""}`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-mono text-gray-400 uppercase tracking-wider mb-4">
            Edit Profile
          </h2>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-emerald-400 text-sm mb-4">
              ✓ {success}
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                className="input-field"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
