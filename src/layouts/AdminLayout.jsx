import {
  CreditCard,
  FolderTree,
  Package2,
  ReceiptText,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/admin/products", label: "Products", icon: Package2 },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ReceiptText },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
];

export default function AdminLayout() {
  return (
    <div className="row g-4">
      <div className="col-12 col-lg-3 col-xl-2">
        <div className="surface-panel p-3 sidebar-wrap">
          <div className="mb-3">
            <div className="section-caption mb-2">Administration</div>
            <p className="text-secondary small mb-0">Manage the catalog, customer orders, and payment records.</p>
          </div>

          <nav className="d-flex flex-column gap-2">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="col-12 col-lg-9 col-xl-10">
        <Outlet />
      </div>
    </div>
  );
}
