import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import AppModal from "../../components/AppModal";
import ConfirmModal from "../../components/ConfirmModal";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../contexts/ToastContext";
import { fetchCategories } from "../../services/categoryService";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "../../services/productService";
import { formatCurrency } from "../../utils/formatters";

const initialFormState = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  categoryId: "",
  sku: "",
};

export default function AdminProductsPage() {
  const { showError, showSuccess } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadDependencies() {
      setIsLoading(true);
      setError("");

      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetchProducts({ page: 1, perPage: 100 }),
          fetchCategories(),
        ]);

        setProducts(productResponse.data.items || []);
        setCategories(categoryResponse.data.categories || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load product records.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDependencies();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      const composite = [
        product.name,
        product.categoryName,
        product.sku,
        product.description,
      ]
        .join(" ")
        .toLowerCase();

      return composite.includes(normalizedSearch);
    });
  }, [products, searchTerm]);

  function resetForm() {
    setFormData(initialFormState);
    setActiveProduct(null);
  }

  function openCreateModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function openEditModal(product) {
    setActiveProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stockQuantity: product.stockQuantity ?? "",
      categoryId: product.categoryId ?? "",
      sku: product.sku || "",
    });
    setIsModalOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      stockQuantity: Number(formData.stockQuantity),
      categoryId: Number(formData.categoryId),
      sku: formData.sku.trim() || null,
    };

    try {
      const response = activeProduct
        ? await updateProduct(activeProduct.id, payload)
        : await createProduct(payload);

      const savedProduct = response.data;

      setProducts((current) => {
        if (activeProduct) {
          return current.map((product) => (product.id === savedProduct.id ? savedProduct : product));
        }

        return [savedProduct, ...current];
      });

      setIsModalOpen(false);
      showSuccess(
        activeProduct ? "Product updated" : "Product created",
        `${savedProduct.name} was saved successfully.`
      );
      resetForm();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to save the product.";
      setError(message);
      showError("Save failed", message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!activeProduct) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await deleteProduct(activeProduct.id);
      setProducts((current) => current.filter((product) => product.id !== activeProduct.id));
      setIsDeleteOpen(false);
      showSuccess("Product deleted", `${activeProduct.name} was removed from the catalog.`);
      resetForm();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to delete the product.";
      setError(message);
      showError("Delete failed", message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Manage Products"
        description="Create, update, and delete catalog items through a structured admin workflow."
        action={
          <button type="button" className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={openCreateModal}>
            <Plus size={16} />
            New Product
          </button>
        }
      />

      <div className="surface-panel p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white">
            <Search size={16} />
          </span>
          <input
            className="form-control"
            placeholder="Search by product, category, SKU, or description"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-secondary mb-0">Loading products...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>SKU</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="fw-semibold">{product.name}</div>
                      <div className="small text-secondary">{product.description || "No description"}</div>
                    </td>
                    <td>{product.categoryName || "Unassigned"}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stockQuantity}</td>
                    <td>{product.sku || "N/A"}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => openEditModal(product)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            setActiveProduct(product);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-secondary">
                    No products matched the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AppModal
        id="product-form-modal"
        title={activeProduct ? "Edit Product" : "Create Product"}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" form="product-form" disabled={isSaving}>
              {isSaving ? "Saving..." : activeProduct ? "Save Changes" : "Create Product"}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Product Name</label>
            <input
              className="form-control"
              value={formData.name}
              onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
              required
            />
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="form-control"
              value={formData.price}
              onChange={(event) => setFormData((current) => ({ ...current, price: event.target.value }))}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Stock Quantity</label>
            <input
              type="number"
              min="0"
              step="1"
              className="form-control"
              value={formData.stockQuantity}
              onChange={(event) => setFormData((current) => ({ ...current, stockQuantity: event.target.value }))}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={formData.categoryId}
              onChange={(event) => setFormData((current) => ({ ...current, categoryId: event.target.value }))}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">SKU</label>
            <input
              className="form-control"
              value={formData.sku}
              onChange={(event) => setFormData((current) => ({ ...current, sku: event.target.value }))}
            />
          </div>
        </form>
      </AppModal>

      <ConfirmModal
        id="product-delete-modal"
        title="Delete Product"
        message={`Delete ${activeProduct?.name || "this product"} from the catalog?`}
        confirmLabel={isSaving ? "Deleting..." : "Delete Product"}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
