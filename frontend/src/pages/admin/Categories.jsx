import { useEffect, useState } from "react";
import api from "../../services/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  // Récupérer les catégories
  const getCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  // Ajouter ou modifier
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom.trim()) {
      alert("Le nom de la catégorie est obligatoire");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, {
          nom,
          description
        });

        alert("Catégorie modifiée avec succès");
      } else {
        await api.post("/categories", {
          nom,
          description
        });

        alert("Catégorie ajoutée avec succès");
      }

      resetForm();
      getCategories();

    } catch (error) {
      console.error("Erreur :", error);
      alert("Une erreur est survenue");
    }
  };

  // Modifier
  const handleEdit = (category) => {
    setEditingId(category.id);
    setNom(category.nom);
    setDescription(category.description || "");
    setShowForm(true);
  };

  // Supprimer
  const handleDelete = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer cette catégorie ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      await api.delete(`/categories/${id}`);

      alert("Catégorie supprimée avec succès");

      getCategories();

    } catch (error) {
      console.error("Erreur :", error);
      alert("Impossible de supprimer cette catégorie");
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNom("");
    setDescription("");
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="container-fluid py-4">

      {/* EN-TÊTE */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1 text-danger">
            Catégories
          </h2>

          <p className="text-muted mb-0">
            Gestion des catégories du restaurant
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Ajouter une catégorie
        </button>

      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <div className="card shadow-sm border-0 mb-4">

          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold">
              {editingId
                ? "Modifier la catégorie"
                : "Ajouter une catégorie"}
            </h5>
          </div>

          <div className="row  justify-content-center mt-3">
            <div className="col-md-6 col-md-offset-3 shadow">

            <form onSubmit={handleSubmit}>

               <div className="form-group mb-4">

                  <label className="form-label fw-semibold">
                    Nom
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Ex : Plats principaux"
                  />
               </div>

                <div className="form-group mb-4">

                  <label className="form-label fw-semibold">
                    Description
                  </label>

                  <textarea
                    className="form-control"
                    rows="1"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description de la catégorie"
                  />
                </div>

                <div className="form-group mb-4">

                <button
                  type="submit"
                  className="btn btn-dark"
                >
                  {editingId
                    ? "Modifier"
                    : "Enregistrer"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  Annuler
                </button>
                </div>

              

            </form>
            </div>
          </div>
        </div>
      )}

      {/* TABLEAU */}
      <div className="card shadow-sm border-0">

        <div className="card-header bg-white py-3">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="mb-0 fw-bold">
              Liste des catégories
            </h5>

            <span className="badge bg-success">
              {categories.length} catégorie(s)
            </span>

          </div>

        </div>

        <div className="card-body p-0">

          {loading ? (

            <div className="text-center py-5">
              <div
                className="spinner-border text-dark"
                role="status"
              >
                <span className="visually-hidden">
                  Chargement...
                </span>
              </div>

              <p className="text-muted mt-3 mb-0">
                Chargement des catégories...
              </p>
            </div>

          ) : categories.length === 0 ? (

            <div className="text-center py-5">

              <h5 className="text-muted">
                Aucune catégorie disponible
              </h5>

              <p className="text-muted">
                Commencez par ajouter une catégorie.
              </p>

              <button
                className="btn btn-dark"
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
              >
                + Ajouter une catégorie
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>
                    <th className="px-4">ID</th>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Image</th>
                    <th>Statut</th>
                    <th className="text-end px-4">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {categories.map((category) => (

                    <tr key={category.id}>

                      <td className="px-4 fw-semibold">
                        #{category.id}
                      </td>

                      <td>
                        <span className="fw-semibold">
                          {category.nom}
                        </span>
                      </td>

                      <td className="text-muted">
                        {category.description || "—"}
                      </td>

                      <td>

                        {category.image ? (

                          <img
                            src={category.image}
                            alt={category.nom}
                            width="55"
                            height="55"
                            className="rounded object-fit-cover"
                          />

                        ) : (

                          <span className="text-muted">
                            —
                          </span>

                        )}

                      </td>

                      <td>

                        <span
                          className={
                            category.statut === "actif"
                              ? "badge text-bg-success"
                              : "badge text-bg-secondary"
                          }
                        >
                          {category.statut}
                        </span>

                      </td>

                      <td className="text-end px-4">

                        <div className="btn-group">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleEdit(category)
                            }
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(category.id)
                            }
                          >
                            Supprimer
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Categories;