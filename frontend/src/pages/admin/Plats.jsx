import { useEffect, useState } from "react";
import api from "../../services/api";

function Plats() {

  const [plats, setPlats] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [categorieId, setCategorieId] = useState("");
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");

  // Fichier image
  const [image, setImage] = useState(null);

  // Ancienne image lors d'une modification
  const [ancienneImage, setAncienneImage] = useState("");

  const [disponibilite, setDisponibilite] =
    useState("disponible");

  // Aperçu image
  const [preview, setPreview] = useState("");

  // =========================
  // RÉCUPÉRER LES PLATS
  // =========================

  const getPlats = async () => {

    try {

      const response =
        await api.get("/plats");

      setPlats(response.data.data);

    } catch (error) {

      console.error(
        "Erreur plats :",
        error
      );

    } finally {

      setLoading(false);
    }
  };


  // =========================
  // RÉCUPÉRER LES CATÉGORIES
  // =========================

  const getCategories = async () => {

    try {

      const response =
        await api.get("/categories");

      setCategories(response.data.data);

    } catch (error) {

      console.error(
        "Erreur catégories :",
        error
      );
    }
  };


  useEffect(() => {

    getPlats();
    getCategories();

  }, []);


  // =========================
  // CHOISIR UNE IMAGE
  // =========================

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (!file) {
      return;
    }


    // Vérifier le type
    const typesAutorises = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp"
    ];

    if (!typesAutorises.includes(file.type)) {

      alert(
        "Veuillez choisir une image JPG, PNG ou WEBP."
      );

      e.target.value = "";

      return;
    }


    // Vérifier la taille
    if (file.size > 5 * 1024 * 1024) {

      alert(
        "L'image ne doit pas dépasser 5 Mo."
      );

      e.target.value = "";

      return;
    }


    setImage(file);


    // Créer aperçu
    const imageUrl =
      URL.createObjectURL(file);

    setPreview(imageUrl);
  };


  // =========================
  // AJOUTER / MODIFIER
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!categorieId) {

      alert(
        "Veuillez sélectionner une catégorie"
      );

      return;
    }


    if (!nom.trim()) {

      alert(
        "Le nom du plat est obligatoire"
      );

      return;
    }


    if (!prix || Number(prix) <= 0) {

      alert(
        "Veuillez entrer un prix valide"
      );

      return;
    }


    // FormData obligatoire
    // pour envoyer un fichier
    const formData = new FormData();

    formData.append(
      "categorie_id",
      categorieId
    );

    formData.append(
      "nom",
      nom
    );

    formData.append(
      "description",
      description
    );

    formData.append(
      "prix",
      prix
    );

    formData.append(
      "disponibilite",
      disponibilite
    );


    // Ajouter l'image seulement
    // si une nouvelle image est choisie
    if (image) {

      formData.append(
        "image",
        image
      );
    }


    try {

      if (editingId) {

        await api.put(
          `/plats/${editingId}`,
          formData
        );

        alert(
          "Plat modifié avec succès"
        );

      } else {

        await api.post(
          "/plats",
          formData
        );

        alert(
          "Plat ajouté avec succès"
        );
      }


      resetForm();

      getPlats();

    } catch (error) {

      console.error(
        "Erreur :",
        error
      );

      alert(
        error.response?.data?.message ||
        "Une erreur est survenue"
      );
    }
  };


  // =========================
  // MODIFIER
  // =========================

  const handleEdit = (plat) => {

    setEditingId(plat.id);

    setCategorieId(
      plat.categorie_id
    );

    setNom(
      plat.nom
    );

    setDescription(
      plat.description || ""
    );

    setPrix(
      plat.prix
    );


    setAncienneImage(
      plat.image || ""
    );


    setImage(null);


    // Aperçu de l'ancienne image
    if (plat.image) {

      setPreview(
        `http://localhost:5000${plat.image}`
      );

    } else {

      setPreview("");
    }


    setDisponibilite(
      plat.disponibilite ||
      "disponible"
    );


    setShowForm(true);
  };


  // =========================
  // SUPPRIMER
  // =========================

  const handleDelete = async (id) => {

    const confirmation =
      window.confirm(
        "Voulez-vous vraiment supprimer ce plat ?"
      );


    if (!confirmation) {
      return;
    }


    try {

      await api.delete(
        `/plats/${id}`
      );

      alert(
        "Plat supprimé avec succès"
      );

      getPlats();

    } catch (error) {

      console.error(
        "Erreur :",
        error
      );

      alert(
        "Impossible de supprimer ce plat"
      );
    }
  };


  // =========================
  // RESET FORMULAIRE
  // =========================

  const resetForm = () => {

    setCategorieId("");

    setNom("");

    setDescription("");

    setPrix("");

    setImage(null);

    setAncienneImage("");

    setPreview("");

    setDisponibilite(
      "disponible"
    );

    setEditingId(null);

    setShowForm(false);
  };


  // =========================
  // URL IMAGE
  // =========================

  const getImageUrl = (image) => {

    if (!image) {
      return null;
    }


    // Si l'image est déjà une URL complète
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {

      return image;
    }


    return `http://localhost:5000${image}`;
  };


  return (
    <div className="container-fluid py-4">


      {/* =========================
          EN-TÊTE
      ========================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h2 className="fw-bold mb-1">
            Plats
          </h2>

          <p className="text-muted mb-0">
            Gestion des plats du restaurant
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

          Ajouter un plat

        </button>

      </div>


      {/* =========================
          FORMULAIRE
      ========================= */}

      {showForm && (

        <div className="card shadow-sm border-0 mb-4">

          <div className="card-header bg-white py-3">

            <h5 className="mb-0 fw-bold">

              {editingId
                ? "Modifier le plat"
                : "Ajouter un plat"}

            </h5>

          </div>


          <div className="row justify-content-center mt-3 mb-4">

            <div className="col-md-6">

              <form
                onSubmit={handleSubmit}
                className="p-3"
              >


                {/* CATÉGORIE */}

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Catégorie
                  </label>

                  <select
                    className="form-select"
                    value={categorieId}
                    onChange={(e) =>
                      setCategorieId(
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      Sélectionner une catégorie
                    </option>

                    {categories.map(
                      (category) => (

                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.nom}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* NOM */}

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Nom du plat
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={nom}
                    onChange={(e) =>
                      setNom(e.target.value)
                    }
                    placeholder="Ex : Poulet grillé"
                  />

                </div>


                {/* PRIX */}

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Prix
                  </label>

                  <div className="input-group">

                    <input
                      type="number"
                      className="form-control"
                      value={prix}
                      onChange={(e) =>
                        setPrix(e.target.value)
                      }
                      placeholder="Ex : 15000"
                      min="0"
                    />

                    <span className="input-group-text">
                      BIF
                    </span>

                  </div>

                </div>


                {/* DISPONIBILITÉ */}

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Disponibilité
                  </label>

                  <select
                    className="form-select"
                    value={disponibilite}
                    onChange={(e) =>
                      setDisponibilite(
                        e.target.value
                      )
                    }
                  >

                    <option value="disponible">
                      Disponible
                    </option>

                    <option value="indisponible">
                      Indisponible
                    </option>

                  </select>

                </div>


                {/* IMAGE */}

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Photo du plat
                  </label>

                  <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                  />


                  <div className="form-text">
                    JPG, PNG ou WEBP — 5 Mo maximum.
                  </div>


                  {/* APERÇU */}

                  {preview && (

                    <div className="mt-3">

                      <p className="fw-semibold mb-2">
                        Aperçu :
                      </p>

                      <img
                        src={preview}
                        alt="Aperçu du plat"
                        className="rounded shadow-sm"
                        style={{
                          width: "180px",
                          height: "180px",
                          objectFit: "cover"
                        }}
                      />

                    </div>

                  )}

                </div>


                {/* DESCRIPTION */}

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Description
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Description du plat..."
                  />

                </div>


                {/* BOUTONS */}

                <div className="d-flex gap-2">

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >

                    <i className="bi bi-check-lg me-2"></i>

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


      {/* =========================
          TABLEAU
      ========================= */}

      <div className="card shadow-sm border-0">

        <div className="card-header bg-white py-3">

          <div className="d-flex justify-content-between align-items-center">

            <h5 className="mb-0 fw-bold">
              Liste des plats
            </h5>

            <span className="badge bg-dark">
              {plats.length} plat(s)
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
                Chargement des plats...
              </p>

            </div>

          ) : plats.length === 0 ? (

            <div className="text-center py-5">

              <h5 className="text-muted">
                Aucun plat disponible
              </h5>

              <p className="text-muted">
                Commencez par ajouter un plat.
              </p>

              <button
                className="btn btn-dark"
                onClick={() => {

                  resetForm();

                  setShowForm(true);

                }}
              >
                + Ajouter un plat
              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th className="px-4">
                      Image
                    </th>

                    <th>
                      Plat
                    </th>

                    <th>
                      Catégorie
                    </th>

                    <th>
                      Prix
                    </th>

                    <th>
                      Disponibilité
                    </th>

                    <th className="text-end px-4">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {plats.map((plat) => (

                    <tr key={plat.id}>


                      {/* IMAGE */}

                      <td className="px-4">

                        {plat.image ? (

                          <img
                            src={
                              getImageUrl(
                                plat.image
                              )
                            }
                            alt={plat.nom}
                            width="65"
                            height="65"
                            className="rounded"
                            style={{
                              objectFit: "cover"
                            }}
                          />

                        ) : (

                          <div
                            className="bg-light rounded d-flex align-items-center justify-content-center"
                            style={{
                              width: "65px",
                              height: "65px"
                            }}
                          >

                            <i className="bi bi-image text-muted fs-4"></i>

                          </div>

                        )}

                      </td>


                      {/* NOM */}

                      <td>

                        <div className="fw-semibold">
                          {plat.nom}
                        </div>

                        <small className="text-muted">
                          #{plat.id}
                        </small>

                      </td>


                      {/* CATÉGORIE */}

                      <td>

                        <span className="badge text-bg-light border">
                          {plat.categorie_nom}
                        </span>

                      </td>


                      {/* PRIX */}

                      <td>

                        <span className="fw-semibold">

                          {Number(
                            plat.prix
                          ).toLocaleString(
                            "fr-FR"
                          )}{" "}

                          BIF

                        </span>

                      </td>


                      {/* DISPONIBILITÉ */}

                      <td>

                        {plat.disponibilite ===
                        "disponible" ? (

                          <span className="badge text-bg-success">
                            Disponible
                          </span>

                        ) : (

                          <span className="badge text-bg-secondary">
                            Indisponible
                          </span>

                        )}

                      </td>


                      {/* ACTIONS */}

                      <td className="text-end px-4">

                        <div className="btn-group">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() =>
                              handleEdit(
                                plat
                              )
                            }
                          >
                            Modifier
                          </button>


                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleDelete(
                                plat.id
                              )
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

export default Plats;