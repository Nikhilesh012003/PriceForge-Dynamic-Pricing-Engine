import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PricingEnginePage from "./pages/PricingEnginePage";
import ProductsPage from "./pages/ProductsPage";
import PricingRulesPage from "./pages/PricingRulesPage";
import PurchaseHistoryPage from "./pages/PurchaseHistoryPage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-t-transparent border-cyan-400 rounded-full animate-spin" />
          <p className="text-gray-500 font-mono text-sm">Initializing...</p>
        </div>
      </div>
    );
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/pricing" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/pricing" replace />;
};

const AppRoutes = () => (
  <div className="min-h-screen grid-bg">
    <Navbar />
    <Routes>
      <Route path="/" element={<Navigate to="/pricing" replace />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <PricingEnginePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <AdminRoute>
            <ProductsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/rules"
        element={
          <AdminRoute>
            <PricingRulesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <PurchaseHistoryPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/pricing" replace />} />
    </Routes>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
