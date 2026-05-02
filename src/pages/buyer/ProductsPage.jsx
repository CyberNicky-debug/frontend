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
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD CATEGORIES
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

  // LOAD PRODUCTS
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setError("");

      try {
        const requestParams = {
          page,
          perPage: 8,
        };

        if (categoryId) {
          requestParams.category = categoryId;
        }

        const response = activeSearch.trim()
          ? await searchProducts(activeSearch.trim(), requestParams)
          : await fetchProducts(requestParams);

        // FIX: backend returns data as array
        setProducts(response.data || []);
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
  }, [activeSearch, categoryId, page]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setActiveSearch(searchInput);
  }

  function handleCategoryChange(event) {
    setCategoryId(event.target.value);
    setPage(1);
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Products"
        description="Browse the live catalog, filter by category, and add items to your cart."
      />

      <div className="catalog-shell p-4 p-lg-5">
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
                onChange={(e) => setSearchInput(e.target.value)}
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
            <button className="btn btn-primary w-100">
              <Search size={16} /> Search
            </button>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}

        {isLoading && (
          <div className="text-center py-5">Loading products...</div>
        )}

        {!isLoading && !products.length && (
          <div className="surface-panel p-5 text-center">
            <h2>No products found</h2>
            <p>Try a different category or search term.</p>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="row g-4">
            {products.map((product) => (
              <div className="col-12 col-md-6 col-xl-3" key={product.id}>
                <div className="catalog-product-card h-100">
                  <div className="catalog-product-media">
                    Product Image
                  </div>

                  <div className="catalog-product-body">
                    <h2>{product.name}</h2>
                    <p>{product.description}</p>

                    <strong>
                      {formatCurrency(product.price)}
                    </strong>

                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => {
                        addToCart(product);
                        showSuccess(
                          "Added to cart",
                          `${product.name} added`
                        );
                      }}
                    >
                      <ShoppingCart size={14} /> Add
                    </button>

                    <Link
                      to={`/products/${product.id}`}
                      className="btn btn-outline-secondary mt-2"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}