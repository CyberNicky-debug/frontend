import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import HomePage from "../pages/buyer/HomePage";
import ProductsPage from "../pages/buyer/ProductsPage";
import ProductDetailPage from "../pages/buyer/ProductDetailPage";
import CartPage from "../pages/buyer/CartPage";
import CheckoutPage from "../pages/buyer/CheckoutPage";
import OrdersPage from "../pages/buyer/OrdersPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "checkout", element: <CheckoutPage /> },
          { path: "orders", element: <OrdersPage /> },
        ],
      },
      {
        element: <ProtectedRoute requireAdmin />,
        children: [
          {
            path: "admin",
            element: <AdminLayout />,
            children: [
              { path: "products", element: <AdminProductsPage /> },
              { path: "categories", element: <AdminCategoriesPage /> },
              { path: "orders", element: <AdminOrdersPage /> },
              { path: "payments", element: <AdminPaymentsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
