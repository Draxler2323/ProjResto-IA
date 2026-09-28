import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Menu() {
  const navigate = useNavigate();
  const [plats, setPlats] = useState([]);
  const [panier, setPanier] = useState(() => {
    const panierSauvegarde = localStorage.getItem("panier");
  
    return panierSauvegarde
      ? JSON.parse(panierSauvegarde)
      : [];
  });
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api";
  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }
  
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }
  
    return `http://localhost:5000${image}`;
  };

  // Récupérer les plats
  const chargerPlats = async () => {
    try {
      const response = await axios.get(`${API_URL}/plats`);

      const platsDisponibles = (response.data.data || []).filter(
        (plat) => plat.disponibilite === "disponible"
      );

      setPlats(platsDisponibles);
    } catch (error) {
      console.error("Erreur récupération plats :", error);
      alert("Impossible de récupérer les plats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerPlats();
  }, []);
  useEffect(() => {
    localStorage.setItem(
      "panier",
      JSON.stringify(panier)
    );
  }, [panier]);

  // Ajouter au panier
  const ajouterAuPanier = (plat) => {
    setPanier((ancienPanier) => {
      const existe = ancienPanier.find(
        (item) => item.id === plat.id
      );

      if (existe) {
        return ancienPanier.map((item) =>
          item.id === plat.id
            ? {
                ...item,
                quantite: item.quantite + 1
              }
            : item
        );
      }

      return [
        ...ancienPanier,
        {
          ...plat,
          quantite: 1
        }
      ];
    });
  };

  // Modifier quantité
  const modifierQuantite = (id, nouvelleQuantite) => {
    if (nouvelleQuantite <= 0) {
      supprimerDuPanier(id);
      return;
    }

    setPanier((ancienPanier) =>
      ancienPanier.map((item) =>
        item.id === id
          ? {
              ...item,
              quantite: nouvelleQuantite
            }
          : item
      )
    );
  };

  // Supprimer
  const supprimerDuPanier = (id) => {
    setPanier((ancienPanier) =>
      ancienPanier.filter((item) => item.id !== id)
    );
  };

  // Total
  const totalPlats = panier.reduce(
    (total, item) =>
      total + Number(item.prix) * item.quantite,
    0
  );

  return (
    <div className="container py-5">
{/* En-tête */}
<div className="mb-5">

  <div className="d-flex justify-content-between align-items-center">

    <div>
      <h1 className="fw-bold mb-1">
        Notre Menu
      </h1>

      <p className="text-muted mb-0">
        Découvrez nos plats et composez votre commande.
      </p>
    </div>

    <button
      type="button"
      className="btn btn-outline-dark"
      onClick={() => navigate("/mes-commandes")}
    >
      <i className="bi bi-receipt me-2"></i>
      Mes commandes
    </button>

  </div>

</div>

      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
          ></div>

          <p className="text-muted mt-3">
            Chargement du menu...
          </p>
        </div>
      ) : (
        <div className="row g-4">

          {/* PLATS */}
          <div className="col-lg-8">

            <div className="row g-4">

              {plats.map((plat) => (
                <div
                  className="col-md-6"
                  key={plat.id}
                >
                  <div className="card h-100 border-0 shadow-sm">

                    {plat.image ? (
                      <img
                      src={getImageUrl(plat.image)}
                        alt={plat.nom}
                        className="card-img-top"
                        style={{
                          height: "220px",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center"
                        style={{ height: "220px" }}
                      >
                        <i className="bi bi-egg-fried fs-1 text-muted"></i>
                      </div>
                    )}

                    <div className="card-body">

                      <h5 className="fw-bold">
                        {plat.nom}
                      </h5>

                      <p className="text-muted small">
                        {plat.description || "Aucune description"}
                      </p>

                      <div className="d-flex justify-content-between align-items-center">

                        <span className="fw-bold">
                          {Number(
                            plat.prix
                          ).toLocaleString("fr-FR")}{" "}
                          FBu
                        </span>

                        <button
                          type="button"
                          className="btn btn-dark"
                          onClick={() =>
                            ajouterAuPanier(plat)
                          }
                        >
                          <i className="bi bi-cart-plus me-2"></i>
                          Ajouter
                        </button>

                      </div>

                    </div>
                  </div>
                </div>
              ))}

            </div>

          </div>

          {/* PANIER */}
          <div className="col-lg-4">

            <div
              className="card border-0 shadow-sm sticky-top"
              style={{ top: "20px" }}
            >

              <div className="card-header bg-dark text-white py-3">
                <h5 className="mb-0">
                  <i className="bi bi-cart3 me-2"></i>
                  Mon panier
                </h5>
              </div>

              <div className="card-body">

                {panier.length === 0 ? (
                  <div className="text-center py-4">

                    <i className="bi bi-cart-x fs-1 text-muted"></i>

                    <p className="text-muted mt-3 mb-0">
                      Votre panier est vide.
                    </p>

                  </div>
                ) : (
                  <>
                    {panier.map((item) => (
                      <div
                        key={item.id}
                        className="border-bottom pb-3 mb-3"
                      >

                        <div className="d-flex justify-content-between">

                          <div>
                            <div className="fw-semibold">
                              {item.nom}
                            </div>

                            <small className="text-muted">
                              {Number(
                                item.prix
                              ).toLocaleString("fr-FR")}{" "}
                              FBu
                            </small>
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              supprimerDuPanier(item.id)
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </button>

                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-3">

                          <div className="btn-group">

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                modifierQuantite(
                                  item.id,
                                  item.quantite - 1
                                )
                              }
                            >
                              -
                            </button>

                            <span className="btn btn-sm btn-light">
                              {item.quantite}
                            </span>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                modifierQuantite(
                                  item.id,
                                  item.quantite + 1
                                )
                              }
                            >
                              +
                            </button>

                          </div>

                          <strong>
                            {Number(
                              item.prix * item.quantite
                            ).toLocaleString("fr-FR")}{" "}
                            FBu
                          </strong>

                        </div>

                      </div>
                    ))}

                    {/* TOTAL */}
                    <div className="d-flex justify-content-between fs-5 fw-bold">
                      <span>
                        Total plats
                      </span>

                      <span>
                        {totalPlats.toLocaleString(
                          "fr-FR"
                        )}{" "}
                        FBu
                      </span>
                    </div>

                    <button
                    type="button"
                    className="btn btn-dark w-100 mt-4"
                    onClick={() => navigate("/checkout")}
                    >
                    <i className="bi bi-arrow-right me-2"></i>
                    Continuer la commande
                    </button>
                  </>
                )}

              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default Menu;