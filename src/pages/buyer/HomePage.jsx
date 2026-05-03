import { ArrowRight, MonitorSmartphone, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    icon: MonitorSmartphone,
    title: "Products",
    text: "Browse electronics quickly.",
  },
  {
    icon: ShieldCheck,
    title: "Checkout",
    text: "Orders start as pending.",
  },
  {
    icon: Truck,
    title: "Orders",
    text: "Admin marks orders complete.",
  },
];

export default function HomePage() {
  return (
    <div className="d-flex flex-column gap-4">
      <section className="buyer-hero p-4 p-lg-5">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-7">
            <div className="section-caption mb-3">Enterprise Storefront</div>
            <h1 className="display-6 fw-semibold mb-3">Harare Electronic Hub</h1>
            <p className="text-secondary mb-4">Find products, add to cart, and place your order.</p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/products" className="btn btn-primary">
                <span className="d-inline-flex align-items-center gap-2">
                  Browse Products
                  <ArrowRight size={16} />
                </span>
              </Link>
              <Link to="/login" className="btn btn-outline-secondary">
                Sign In to Checkout
              </Link>
            </div>
          </div>
          <div className="col-12 col-lg-5">
            <div className="surface-card p-4">
              <div className="row g-3">
                <div className="col-6">
                  <div className="surface-panel p-3 h-100">
                    <div className="text-secondary small mb-2">New orders</div>
                    <div className="fw-semibold">Pending</div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="surface-panel p-3 h-100">
                    <div className="text-secondary small mb-2">Admin action</div>
                    <div className="fw-semibold">Complete</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="surface-panel p-3">
                    <div className="text-secondary small mb-2">Admin scope</div>
                    <div className="fw-semibold">Products, categories, orders</div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="surface-panel p-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-secondary small mb-1">Shopping</div>
                      <div className="fw-semibold">Simple and fast</div>
                    </div>
                    <span className="badge text-bg-dark">Bootstrap UI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="row g-4">
        {featureCards.map(({ icon: Icon, title, text }) => (
          <div className="col-12 col-md-4" key={title}>
            <div className="surface-card p-4 h-100">
              <div className="brand-mark mb-3">
                <Icon size={18} />
              </div>
              <h2 className="h5">{title}</h2>
              <p className="text-secondary mb-0">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
