import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-dark-600 bg-dark-800/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-linear-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-dark-900">P</span>
            </div>
            <span className="font-display font-bold text-white text-sm tracking-wide">
              Price<span className="text-cyan-400">Forge</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Engine
            </NavLink>
            <NavLink
              to="/purchases"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              History
            </NavLink>
            {user.role === "admin" && (
              <>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  Products
                </NavLink>
                <NavLink
                  to="/rules"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  Rules
                </NavLink>
              </>
            )}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              Profile
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-mono hidden sm:block">
                {user.username}
              </span>
              <span
                className={user.role === "admin" ? "tag-admin" : "tag-user"}
              >
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
