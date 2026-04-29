import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import AppModal from "../../components/AppModal";
import ConfirmModal from "../../components/ConfirmModal";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../contexts/ToastContext";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../../services/categoryService";

const initialFormState = {
  name: "",
  description: "",
};

export default function AdminCategoriesPage() {
  const { showError, showSuccess } = useToast();
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    async function loadCategories() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchCategories();
        setCategories(response.data.categories || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Unable to load categories.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) =>
      [category.name, category.description].join(" ").toLowerCase().includes(normalizedSearch)
    );
  }, [categories, searchTerm]);

  function resetForm() {
    setFormData(initialFormState);
    setActiveCategory(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    try {
      const response = activeCategory
        ? await updateCategory(activeCategory.id, payload)
        : await createCategory(payload);

      const savedCategory = response.data;

      setCategories((current) => {
        if (activeCategory) {
          return current.map((category) =>
            category.id === savedCategory.id
              ? { ...category, ...savedCategory, productCount: category.productCount }
              : category
          );
        }

        return [...current, { ...savedCategory, productCount: 0 }].sort((left, right) =>
          left.name.localeCompare(right.name)
        );
      });

      setIsModalOpen(false);
      showSuccess(
        activeCategory ? "Category updated" : "Category created",
        `${savedCategory.name} was saved successfully.`
      );
      resetForm();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to save the category.";
      setError(message);
      showError("Save failed", message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!activeCategory) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await deleteCategory(activeCategory.id);
      setCategories((current) => current.filter((category) => category.id !== activeCategory.id));
      setIsDeleteOpen(false);
      showSuccess("Category deleted", `${activeCategory.name} was removed successfully.`);
      resetForm();
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to delete the category.";
      setError(message);
      showError("Delete failed", message);
      setIsDeleteOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="surface-card page-section">
      <PageHeader
        title="Manage Categories"
        description="Maintain the category structure used across the storefront and admin catalog."
        action={
          <button
            type="button"
            className="btn btn-primary d-inline-flex align-items-center gap-2"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            New Category
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
            placeholder="Search categories"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status" />
          <p className="text-secondary mb-0">Loading categories...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Products</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length ? (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="fw-semibold">{category.name}</td>
                    <td className="text-secondary">{category.description || "No description"}</td>
                    <td>{category.productCount}</td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => {
                            setActiveCategory(category);
                            setFormData({
                              name: category.name || "",
                              description: category.description || "",
                            });
                            setIsModalOpen(true);
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => {
                            setActiveCategory(category);
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
                  <td colSpan="4" className="text-center py-5 text-secondary">
                    No categories matched the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AppModal
        id="category-form-modal"
        title={activeCategory ? "Edit Category" : "Create Category"}
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
            <button type="submit" className="btn btn-primary" form="category-form" disabled={isSaving}>
              {isSaving ? "Saving..." : activeCategory ? "Save Changes" : "Create Category"}
            </button>
          </>
        }
        size="modal-md"
      >
        <form id="category-form" onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Category Name</label>
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
        </form>
      </AppModal>

      <ConfirmModal
        id="category-delete-modal"
        title="Delete Category"
        message={`Delete ${activeCategory?.name || "this category"}? Categories with assigned products cannot be removed.`}
        confirmLabel={isSaving ? "Deleting..." : "Delete Category"}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
