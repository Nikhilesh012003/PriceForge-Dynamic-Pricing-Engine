import { useState, useEffect } from "react";
import api from "../api/axios";

export default function PricingRulesPage() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [form, setForm] = useState({
    productId: "",
    minQuantity: "",
    discountPercentage: "",
    label: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterProduct, setFilterProduct] = useState("all");

  const fetchData = async () => {
    try {
      const [rulesRes, productsRes] = await Promise.all([
        api.get("/pricing-rules"),
        api.get("/products"),
      ]);
      setRules(rulesRes.data);
      setProducts(productsRes.data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditRule(null);
    setForm({
      productId: products[0]?._id || "",
      minQuantity: "",
      discountPercentage: "",
      label: "",
    });
    setError("");
    setShowForm(true);
  };

  const openEdit = (r) => {
    setEditRule(r);
    setForm({
      productId: r.product._id,
      minQuantity: r.minQuantity,
      discountPercentage: r.discountPercentage,
      label: r.label || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editRule) {
        await api.put(`/pricing-rules/${editRule._id}`, {
          minQuantity: parseInt(form.minQuantity),
          discountPercentage: parseFloat(form.discountPercentage),
          label: form.label,
        });
      } else {
        await api.post("/pricing-rules", {
          productId: form.productId,
          minQuantity: parseInt(form.minQuantity),
          discountPercentage: parseFloat(form.discountPercentage),
          label: form.label,
        });
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save rule");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this pricing rule?")) return;
    try {
      await api.delete(`/pricing-rules/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const filteredRules =
    filterProduct === "all"
      ? rules
      : rules.filter((r) => r.product._id === filterProduct);

  const getDiscountColor = (pct) => {
    if (pct >= 30) return "badge-purple";
    if (pct >= 15) return "badge-cyan";
    return "badge-green";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-display">
            Pricing Rules
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {rules.length} active discount rules
          </p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary"
          disabled={products.length === 0}
        >
          + New Rule
        </button>
      </div>

      {products.length === 0 && !loading && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-400 text-sm mb-6">
          ⚠ Create products first before defining pricing rules.
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterProduct("all")}
          className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${filterProduct === "all" ? "border-cyan-400 text-cyan-400 bg-cyan-400/10" : "border-dark-500 text-gray-500 hover:border-gray-500"}`}
        >
          All Products
        </button>
        {products.map((p) => (
          <button
            key={p._id}
            onClick={() => setFilterProduct(p._id)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${filterProduct === p._id ? "border-cyan-400 text-cyan-400 bg-cyan-400/10" : "border-dark-500 text-gray-500 hover:border-gray-500"}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="card p-6 w-full max-w-md animate-slide-up">
            <h2 className="text-lg font-bold text-white font-display mb-4">
              {editRule ? "Edit Rule" : "New Pricing Rule"}
            </h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editRule && (
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                    Product
                  </label>
                  <select
                    className="input-field"
                    value={form.productId}
                    onChange={(e) =>
                      setForm({ ...form, productId: e.target.value })
                    }
                    required
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (${p.basePrice})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {editRule && (
                <div className="bg-dark-700 rounded-lg p-3">
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
                    Product
                  </p>
                  <p className="text-white font-semibold">
                    {editRule.product.name}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Minimum Quantity Threshold
                </label>
                <input
                  className="input-field"
                  type="number"
                  min="1"
                  placeholder="e.g. 10"
                  value={form.minQuantity}
                  onChange={(e) =>
                    setForm({ ...form, minQuantity: e.target.value })
                  }
                  required
                />
                <p className="text-xs text-gray-600 mt-1 font-mono">
                  Discount applies when order ≥ this quantity
                </p>
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Discount Percentage (%)
                </label>
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 15"
                  value={form.discountPercentage}
                  onChange={(e) =>
                    setForm({ ...form, discountPercentage: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase tracking-wider">
                  Label (Optional)
                </label>
                <input
                  className="input-field"
                  placeholder="e.g. Bulk Discount Tier 1"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editRule
                      ? "Update Rule"
                      : "Create Rule"}
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
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 flex gap-4">
              <div className="skeleton h-4 w-1/4" />
              <div className="skeleton h-4 w-1/4" />
              <div className="skeleton h-4 w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-400 font-display">No pricing rules found</p>
          <p className="text-gray-600 text-sm mt-1">
            Define discount thresholds for your products
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-600">
                  <th className="text-left p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Label
                  </th>
                  <th className="text-left p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Min Qty
                  </th>
                  <th className="text-left p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="text-left p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Base Price
                  </th>
                  <th className="text-left p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Discounted
                  </th>
                  <th className="text-right p-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule, i) => {
                  const discounted =
                    rule.product.basePrice *
                    (1 - rule.discountPercentage / 100);
                  return (
                    <tr
                      key={rule._id}
                      className={`border-b border-dark-600/50 hover:bg-dark-700/30 transition-colors ${i % 2 === 0 ? "" : "bg-dark-700/10"}`}
                    >
                      <td className="p-4">
                        <p className="text-white font-medium font-display text-sm">
                          {rule.product.name}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400 text-sm">
                          {rule.label || "—"}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-cyan-400 font-bold">
                          ≥ {rule.minQuantity}
                        </span>
                        <span className="text-gray-600 text-xs ml-1">
                          units
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`badge ${getDiscountColor(rule.discountPercentage)}`}
                        >
                          -{rule.discountPercentage}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-gray-400 text-sm line-through">
                          ${rule.product.basePrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-emerald-400 font-bold text-sm">
                          ${discounted.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openEdit(rule)}
                            className="btn-secondary text-xs px-3 py-1.5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(rule._id)}
                            className="btn-danger text-xs px-3 py-1.5"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
