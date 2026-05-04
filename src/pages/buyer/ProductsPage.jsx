// force redeploy

import { useEffect, useState } from "react";
import { Filter, Search, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { fetchCategories } from "../../services/categoryService";
import { fetchProducts, searchProducts } from "../../services/productService";
import { formatCurrency } from "../../utils/formatters";

export default function ProductsPage() {
  const { addToCart } = useCart();
  const { showSuccess } = useToast();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetchCategories();
        setCategories(response.data || []);
      } catch {
        setCategories([]);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError("");

      try {
        const response = activeSearch.trim()
          ? await searchProducts(activeSearch.trim())
          : await fetchProducts();

        let productList = response.data || [];

        if (categoryId) {
          productList = productList.filter(
            (product) => String(product.categoryId) === String(categoryId)
          );
        }

        setProducts(productList);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load products right now."
        );
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [activeSearch, categoryId]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setActiveSearch(searchInput);
  }

  function handleCategoryChange(event) {
    setCategoryId(event.target.value);
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Products"
        description="Browse the live catalog, filter by category, and add items to your cart."
      />

      <div className="catalog-shell p-4 p-lg-5">
        <div className="catalog-hero mb-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <div className="section-caption mb-3">Electronics Catalog</div>
              <h2 className="h3 mb-2">
                Structured browsing for serious buying.
              </h2>
              <p className="text-secondary mb-0">
                Filter categories, search inventory, and move products into
                checkout without clutter.
              </p>
            </div>

            <div className="col-lg-5">
              <div className="catalog-metrics">
                <div className="catalog-metric">
                  <span className="text-secondary small">Visible Products</span>
                  <strong>{products.length}</strong>
                </div>

                <div className="catalog-metric">
                  <span className="text-secondary small">Categories</span>
                  <strong>{categories.length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          className="catalog-toolbar row g-3 mb-4"
          onSubmit={handleSearchSubmit}
        >
          <div className="col-12 col-lg-6">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={16} />
              </span>
              <input
                className="form-control"
                placeholder="Search products"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-lg-3">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Filter size={16} />
              </span>
              <select
                className="form-select"
                value={categoryId}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12 col-lg-3">
            <button
              type="submit"
              className="btn btn-primary w-100 d-inline-flex align-items-center justify-content-center gap-2"
            >
              <Search size={16} />
              Search
            </button>
          </div>
        </form>

        {activeSearch ? (
          <div className="alert alert-light border mb-4">
            Showing results for <strong>{activeSearch}</strong>.
          </div>
        ) : null}

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-secondary mb-0">Loading products...</p>
          </div>
        ) : null}

        {!isLoading && !products.length ? (
          <div className="surface-panel p-5 text-center">
            <h2 className="h5 mb-2">No products found</h2>
            <p className="text-secondary mb-0">
              Try a different category or search term.
            </p>
          </div>
        ) : null}

        {!isLoading && products.length ? (
          <div className="row g-4">
            {products.map((product) => (
              <div className="col-12 col-md-6 col-xl-3" key={product.id}>
                <div className="catalog-product-card h-100">
                  <div className="catalog-product-media">Product Image</div>

                  <div className="catalog-product-body">
                    <div className="small text-secondary mb-2">
                      {product.categoryName || "General"}
                    </div>

                    <h2 className="h5 mb-2">{product.name}</h2>

                    <p className="text-secondary small flex-grow-1">
                      {product.description ||
                        "No description available for this product yet."}
                    </p>

                    <div className="catalog-product-meta">
                      <div>
                        <span className="text-secondary small d-block mb-1">
                          Price
                        </span>
                        <strong>{formatCurrency(product.price)}</strong>
                      </div>

                      <div className="text-end">
                        <span className="text-secondary small d-block mb-1">
                          Stock
                        </span>
                        <strong>{product.stockQuantity ?? "Available"}</strong>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn btn-outline-secondary btn-sm flex-grow-1"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
                        onClick={() => {
                          addToCart(product);
                          showSuccess(
                            "Added to cart",
                            `${product.name} is now in your cart.`
                          );
                        }}
                      >
                        <ShoppingCart size={15} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}