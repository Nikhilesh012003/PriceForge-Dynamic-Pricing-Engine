import { useState, useEffect } from "react";
import api from "../api/axios";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    basePrice: "",
    description: "",
    category: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: "", basePrice: "", description: "", category: "" });
    setError("");
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      basePrice: p.basePrice,
      description: p.description || "",
      category: p.category || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (parseFloat(form.basePrice) <= 0) {
      setError("Base price must be greater than zero");
      return;
    }
    setSaving(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, {
          ...form,
          basePrice: parseFloat(form.basePrice),
        });
      } else {
        await api.post("/products", {
          ...form,
          basePrice: parseFloat(form.basePrice),
        });
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Products
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} active products
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + New Product
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-lg font-bold text-white font-display mb-4">
              {editProduct ? "Edit Product" : "New Product"}
            </h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Product Name
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Widget Pro"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Base Price ($)
                </label>
                <input
                  className="input-field"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm({ ...form, basePrice: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Category
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Electronics"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Optional description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editProduct ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
              <div className="skeleton h-8 w-1/3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400 font-display">No products yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Create your first product to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="card p-5 hover:border-cyan-400/30 transition-all animate-fade-in"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold font-display">
                    {p.name}
                  </h3>
                  <span className="badge badge-cyan mt-1">
                    {p.category || "General"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-bold font-mono text-lg">
                    ${p.basePrice.toFixed(2)}
                  </p>
                  <p className="text-gray-600 text-xs font-mono">base price</p>
                </div>
              </div>
              {p.description && (
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">
                  {p.description}
                </p>
              )}
              <div className="flex gap-2 pt-2 border-t border-dark-600">
                <button
                  onClick={() => openEdit(p)}
                  className="btn-secondary text-xs px-3 py-1.5 flex-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="btn-danger text-xs px-3 py-1.5"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
