import { useEffect, useState } from "react";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import { useCart } from "../../contexts/CartContext";
import { useToast } from "../../contexts/ToastContext";
import { fetchProductById } from "../../services/productService";
import { formatCurrency } from "../../utils/formatters";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { showSuccess } = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchProductById(productId);
        setProduct(response.data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load product details.");
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  function adjustQuantity(amount) {
    setQuantity((current) => Math.max(1, current + amount));
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Product Detail"
        description="Review the item, stock availability, and add the right quantity to your cart."
      />

      <div className="product-detail-shell p-4 p-lg-5">
        <Link to="/products" className="btn btn-outline-secondary btn-sm mb-4 d-inline-flex align-items-center gap-2">
          <ArrowLeft size={16} />
          Back to Products
        </Link>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-secondary mb-0">Loading product details...</p>
          </div>
        ) : null}

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {!isLoading && product ? (
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="product-detail-media-wrap">
                <div className="product-detail-media">Product Image</div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="product-detail-panel">
                <div className="section-caption mb-3">{product.categoryName || "General"}</div>
                <h2 className="display-6 fw-semibold mb-3">{product.name}</h2>
                <p className="text-secondary mb-4">{product.description || "No description available for this product yet."}</p>

                <div className="product-detail-meta mb-4">
                  <div className="product-detail-price">
                    <span className="text-secondary small d-block mb-1">Price</span>
                    <strong>{formatCurrency(product.price)}</strong>
                  </div>
                  <div className="product-detail-stock">
                    <span className="text-secondary small d-block mb-1">Stock</span>
                    <strong>{product.stockQuantity} available</strong>
                  </div>
                </div>

                <div className="product-detail-actions">
                  <div className="product-detail-qty">
                    <label className="form-label">Quantity</label>
                    <div className="input-group">
                      <button type="button" className="btn btn-outline-secondary" onClick={() => adjustQuantity(-1)}>
                        <Minus size={16} />
                      </button>
                      <input
                        className="form-control text-center"
                        value={quantity}
                        onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                      />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => adjustQuantity(1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      addToCart(product, quantity);
                      showSuccess("Added to cart", `${quantity} item(s) of ${product.name} were added to your cart.`);
                    }}
                    disabled={Number(product.stockQuantity) < 1}
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
