import { LogOut, Package, ShieldCheck, ShoppingCart, UserCircle2 } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function MainLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container">
          <NavLink to="/" className="navbar-brand d-flex align-items-center gap-3 fw-semibold">
            <span className="brand-mark">
              <Package size={18} />
            </span>
            <span>Electronics Commerce</span>
          </NavLink>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <NavLink className="nav-link" to="/products">
                Products
              </NavLink>
              <NavLink className="nav-link" to="/cart">
                <span className="d-inline-flex align-items-center gap-2">
                  <ShoppingCart size={16} />
                  Cart
                  {itemCount > 0 ? <span className="badge text-bg-dark">{itemCount}</span> : null}
                </span>
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink className="nav-link" to="/orders">
                    My Orders
                  </NavLink>
                  {isAdmin ? (
                    <NavLink className="nav-link" to="/admin/products">
                      <span className="d-inline-flex align-items-center gap-2">
                        <ShieldCheck size={16} />
                        Admin
                      </span>
                    </NavLink>
                  ) : null}
                  <div className="d-flex align-items-center gap-2 ms-lg-3">
                    <span className="small text-secondary d-inline-flex align-items-center gap-2">
                      <UserCircle2 size={16} />
                      {user?.firstName}
                    </span>
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logout}>
                      <span className="d-inline-flex align-items-center gap-2">
                        <LogOut size={16} />
                        Logout
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="d-flex gap-2 ms-lg-3">
                  <NavLink to="/login" className="btn btn-outline-primary btn-sm">
                    Login
                  </NavLink>
                  <NavLink to="/register" className="btn btn-primary btn-sm">
                    Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>
    </div>
  );
}
