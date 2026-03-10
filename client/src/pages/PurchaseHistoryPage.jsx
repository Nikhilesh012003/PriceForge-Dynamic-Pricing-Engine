import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function PurchaseHistoryPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const endpoint =
          user.role === "admin" ? "/purchases/all" : "/purchases/my";
        const res = await api.get(endpoint);
        setPurchases(res.data);
      // eslint-disable-next-line no-empty
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const totalSpent = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
  const totalSaved = purchases.reduce(
    (sum, p) => sum + (p.basePrice - p.discountedUnitPrice) * p.quantity,
    0,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-display">
          Purchase History
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {user.role === "admin"
            ? "All system purchases"
            : "Your order history"}
        </p>
      </div>

      {!loading && purchases.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            {
              label: "Total Orders",
              value: purchases.length,
              color: "text-cyan-400",
              mono: true,
            },
            {
              label: "Total Spent",
              value: `$${totalSpent.toFixed(2)}`,
              color: "text-white",
              mono: true,
            },
            {
              label: "Total Saved",
              value: `$${totalSaved.toFixed(2)}`,
              color: "text-emerald-400",
              mono: true,
            },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-gray-500 text-xs font-mono uppercase tracking-wider mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 space-y-2">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-400 font-display">No purchases yet</p>
          <p className="text-gray-600 text-sm mt-1">
            Head to the Pricing Engine to make a purchase
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p._id} className="card overflow-hidden animate-fade-in">
              <div
                className="p-4 cursor-pointer hover:bg-dark-700/30 transition-colors"
                onClick={() => setExpanded(expanded === p._id ? null : p._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cyan-400/10 to-purple-600/10 border border-cyan-400/10 flex items-center justify-center">
                      <span className="text-lg">📦</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold font-display text-sm">
                        {p.product?.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-gray-500 text-xs font-mono">
                          ×{p.quantity} units
                        </span>
                        {user.role === "admin" && p.user && (
                          <span className="text-gray-600 text-xs">
                            · {p.user.username}
                          </span>
                        )}
                        <span className="text-gray-600 text-xs">
                          · {new Date(p.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    {p.discountPercentage > 0 && (
                      <span className="badge badge-green">
                        -{p.discountPercentage}%
                      </span>
                    )}
                    <div>
                      <p className="text-cyan-400 font-bold font-mono">
                        ${p.totalPrice.toFixed(2)}
                      </p>
                      {p.discountPercentage > 0 && (
                        <p className="text-gray-600 text-xs font-mono line-through text-right">
                          ${(p.basePrice * p.quantity).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-gray-500 transition-transform ${expanded === p._id ? "rotate-180" : ""}`}
                    >
                      ▾
                    </span>
                  </div>
                </div>
              </div>

              {expanded === p._id && (
                <div className="border-t border-dark-600 p-4 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Base Price",
                        value: `$${p.basePrice.toFixed(2)}`,
                      },
                      {
                        label: "Unit Price",
                        value: `$${p.discountedUnitPrice.toFixed(2)}`,
                      },
                      { label: "Quantity", value: p.quantity },
                      { label: "Total", value: `$${p.totalPrice.toFixed(2)}` },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-dark-700 rounded-lg p-3"
                      >
                        <p className="text-xs text-gray-600 font-mono uppercase tracking-wider mb-1">
                          {item.label}
                        </p>
                        <p className="text-white font-mono font-bold text-sm">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {p.appliedRule && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                        Applied Rule
                      </p>
                      <p className="text-gray-300 text-sm">
                        {p.appliedRule.label || `Bulk Discount`} — Buy ≥
                        {p.appliedRule.minQuantity} units →{" "}
                        {p.appliedRule.discountPercentage}% off
                      </p>
                    </div>
                  )}

                  {p.aiExplanation && (
                    <div className="ai-block">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">✦</span>
                        <p className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                          Gemini AI Explanation
                        </p>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {p.aiExplanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
