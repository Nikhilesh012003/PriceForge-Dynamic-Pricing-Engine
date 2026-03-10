import { useState, useEffect } from "react";
import api from "../api/axios";

export default function PricingEnginePage() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rules, setRules] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/products");
        setProducts(res.data);
        if (res.data.length > 0) setSelectedProduct(res.data[0]);
      } catch {
        setError("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;
    const fetchRules = async () => {
      try {
        const res = await api.get(
          `/pricing-rules/product/${selectedProduct._id}`,
        );
        setRules(res.data);
        // eslint-disable-next-line no-empty
      } catch {}
    };
    fetchRules();
    setPreview(null);
    setResult(null);
    setError("");
  }, [selectedProduct]);

  const handlePreview = async () => {
    if (!selectedProduct || quantity < 1) return;
    setLoadingPreview(true);
    setError("");
    setResult(null);
    try {
      const res = await api.post("/pricing-rules/calculate", {
        productId: selectedProduct._id,
        quantity: parseInt(quantity),
      });
      setPreview(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to calculate price");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct || quantity < 1) return;
    setPurchasing(true);
    setError("");
    try {
      const res = await api.post("/purchases", {
        productId: selectedProduct._id,
        quantity: parseInt(quantity),
      });
      setResult(res.data);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || "Purchase failed");
    } finally {
      setPurchasing(false);
    }
  };

  const getNextTier = () => {
    if (!rules.length) return null;
    const next = rules.find((r) => r.minQuantity > quantity);
    return next || null;
  };

  const nextTier = getNextTier();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400/20 to-purple-600/20 border border-cyan-400/20 flex items-center justify-center">
            <span className="text-sm">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            Dynamic Pricing Engine
          </h1>
        </div>
        <p className="text-gray-500 text-sm ml-11">
          AI-powered rule-based discount calculation · Powered by Gemini 2.5
          Flash
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-1 space-y-4 animate-slide-up">
          {/* Product Selector */}
          <div className="card p-5">
            <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">
              Select Product
            </h2>
            {loadingProducts ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton h-12 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <p className="text-gray-600 text-sm">
                No products available. Ask an admin to add products.
              </p>
            ) : (
              <div className="space-y-2">
                {products.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setQuantity(1);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedProduct?._id === p._id
                        ? "border-cyan-400/50 bg-cyan-400/5 text-white"
                        : "border-dark-500 text-gray-400 hover:border-dark-400 hover:text-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm font-display">
                          {p.name}
                        </p>
                        <p className="text-xs font-mono text-gray-600 mt-0.5">
                          {p.category}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        ${p.basePrice.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Rules for selected product */}
          {selectedProduct && rules.length > 0 && (
            <div className="card p-5">
              <h2 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">
                Discount Tiers — {selectedProduct.name}
              </h2>
              <div className="space-y-2">
                {rules.map((rule) => {
                  const isActive =
                    preview?.appliedRule?._id === rule._id ||
                    result?.appliedRule?._id === rule._id;
                  const discounted =
                    selectedProduct.basePrice *
                    (1 - rule.discountPercentage / 100);
                  return (
                    <div
                      key={rule._id}
                      className={`p-3 rounded-lg border transition-all ${
                        isActive
                          ? "border-emerald-400/40 bg-emerald-400/5"
                          : "border-dark-500 bg-dark-700/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-cyan-400 font-bold">
                              ≥ {rule.minQuantity} units
                            </span>
                            {isActive && (
                              <span className="text-xs text-emerald-400">
                                ✓ Applied
                              </span>
                            )}
                          </div>
                          {rule.label && (
                            <p className="text-gray-600 text-xs mt-0.5">
                              {rule.label}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span
                            className={`badge ${rule.discountPercentage >= 30 ? "badge-purple" : rule.discountPercentage >= 15 ? "badge-cyan" : "badge-green"}`}
                          >
                            -{rule.discountPercentage}%
                          </span>
                          <p className="text-xs font-mono text-gray-500 mt-1">
                            ${discounted.toFixed(2)}/unit
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedProduct && rules.length === 0 && !loadingProducts && (
            <div className="card p-4">
              <p className="text-gray-600 text-xs font-mono text-center">
                No discount rules defined for this product.
              </p>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-4 animate-slide-up">
          {selectedProduct && (
            <>
              {/* Calculator */}
              <div className="card p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-white font-display">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {selectedProduct.description || selectedProduct.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-600 uppercase tracking-wider">
                      Base Price
                    </p>
                    <p className="text-2xl font-bold font-mono text-white">
                      ${selectedProduct.basePrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg bg-dark-700 border border-dark-500 text-white hover:border-cyan-400/50 transition-colors font-mono text-lg flex items-center justify-center"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="input-field text-center font-mono font-bold text-lg w-24"
                    />
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-10 rounded-lg bg-dark-700 border border-dark-500 text-white hover:border-cyan-400/50 transition-colors font-mono text-lg flex items-center justify-center"
                    >
                      +
                    </button>
                    {rules.length > 0 && (
                      <div className="flex gap-2 ml-2 flex-wrap">
                        {rules.map((r) => (
                          <button
                            key={r._id}
                            onClick={() => setQuantity(r.minQuantity)}
                            className="text-xs px-2.5 py-1.5 rounded-md border border-dark-500 text-gray-500 hover:border-cyan-400/50 hover:text-cyan-400 transition-all font-mono"
                          >
                            {r.minQuantity}+
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {nextTier && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-mono text-yellow-500/80">
                      <span>💡</span>
                      <span>
                        Add {nextTier.minQuantity - quantity} more unit
                        {nextTier.minQuantity - quantity !== 1 ? "s" : ""} to
                        unlock <strong>{nextTier.discountPercentage}%</strong>{" "}
                        discount
                      </span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handlePreview}
                    className="btn-secondary flex-1"
                    disabled={loadingPreview || purchasing}
                  >
                    {loadingPreview ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-t-transparent border-gray-400 rounded-full animate-spin" />
                        Calculating...
                      </span>
                    ) : (
                      "Preview Price"
                    )}
                  </button>
                  <button
                    onClick={handlePurchase}
                    className="btn-primary flex-1"
                    disabled={purchasing || loadingPreview}
                  >
                    {purchasing ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-t-transparent border-dark-900 rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      "⚡ Purchase Now"
                    )}
                  </button>
                </div>
              </div>

              {/* Preview Result */}
              {preview && !result && (
                <div className="card p-6 border-cyan-400/20 animate-slide-up">
                  <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">
                    Price Preview
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-mono uppercase tracking-wider mb-1">
                        Base Price
                      </p>
                      <p className="text-white font-mono font-bold">
                        ${preview.basePrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-mono uppercase tracking-wider mb-1">
                        Discount
                      </p>
                      <p
                        className={`font-mono font-bold ${preview.discountPercentage > 0 ? "text-emerald-400" : "text-gray-400"}`}
                      >
                        {preview.discountPercentage > 0
                          ? `-${preview.discountPercentage}%`
                          : "None"}
                      </p>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-mono uppercase tracking-wider mb-1">
                        Unit Price
                      </p>
                      <p className="text-cyan-400 font-mono font-bold">
                        ${preview.discountedUnitPrice.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-linear-to-br from-cyan-400/10 to-purple-600/5 border border-cyan-400/20 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-mono uppercase tracking-wider mb-1">
                        Total
                      </p>
                      <p className="text-white font-mono font-bold text-lg">
                        ${preview.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {preview.appliedRule && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 mb-3">
                      <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                        Best Applicable Rule
                      </p>
                      <p className="text-gray-300 text-sm">
                        {preview.appliedRule.label || "Bulk Discount"} — Buy ≥
                        {preview.appliedRule.minQuantity} units →{" "}
                        {preview.appliedRule.discountPercentage}% off
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 font-mono text-center">
                    Click <span className="text-cyan-400">Purchase Now</span> to
                    confirm with AI explanation
                  </p>
                </div>
              )}

              {/* Purchase Result with AI */}
              {result && (
                <div className="card p-6 border-emerald-400/20 animate-slide-up">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-full bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
                      <span className="text-sm">✓</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold font-display">
                        Purchase Confirmed
                      </h3>
                      <p className="text-gray-500 text-xs font-mono">
                        Order ID: {result._id?.slice(-8)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {[
                      { label: "Product", value: result.product?.name },
                      { label: "Quantity", value: `×${result.quantity}` },
                      {
                        label: "Discount",
                        value:
                          result.discountPercentage > 0
                            ? `-${result.discountPercentage}%`
                            : "None",
                        color:
                          result.discountPercentage > 0
                            ? "text-emerald-400"
                            : "text-gray-400",
                      },
                      {
                        label: "Total Paid",
                        value: `$${result.totalPrice.toFixed(2)}`,
                        color: "text-cyan-400",
                        large: true,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`bg-dark-700 rounded-lg p-3 ${item.large ? "bg-linear-to-br from-cyan-400/10 to-purple-600/5 border border-cyan-400/20" : ""}`}
                      >
                        <p className="text-xs text-gray-600 font-mono uppercase tracking-wider mb-1">
                          {item.label}
                        </p>
                        <p
                          className={`font-mono font-bold ${item.large ? "text-lg" : "text-sm"} ${item.color || "text-white"}`}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {result.appliedRule && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 mb-4">
                      <p className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1">
                        Applied Discount Rule
                      </p>
                      <p className="text-gray-300 text-sm">
                        {result.appliedRule.label || "Bulk Discount"} — Buy ≥
                        {result.appliedRule.minQuantity} units →{" "}
                        {result.appliedRule.discountPercentage}% off
                      </p>
                      <p className="text-xs text-gray-600 font-mono mt-1">
                        You saved $
                        {(
                          (result.basePrice - result.discountedUnitPrice) *
                          result.quantity
                        ).toFixed(2)}{" "}
                        on this order
                      </p>
                    </div>
                  )}

                  {result.aiExplanation && (
                    <div className="ai-block">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-purple-400 text-sm">✦</span>
                          <span className="text-xs font-mono text-purple-400 uppercase tracking-wider">
                            Gemini AI Analysis
                          </span>
                        </div>
                        <div className="flex-1 h-px bg-linear-to-br from-purple-400/20 to-transparent" />
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {result.aiExplanation}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setResult(null);
                      setPreview(null);
                      setQuantity(1);
                    }}
                    className="btn-secondary w-full mt-4 text-sm"
                  >
                    New Calculation
                  </button>
                </div>
              )}
            </>
          )}

          {!selectedProduct && !loadingProducts && (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">⚡</p>
              <p className="text-gray-400 font-display">
                No products available
              </p>
              <p className="text-gray-600 text-sm mt-1">
                An administrator needs to create products first
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
