import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function SuiviCommande() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [commande, setCommande] = useState(null);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");
  const [confirmationEnCours, setConfirmationEnCours] = useState(false);

  const chargerCommande = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/commandes/${id}`
      );

      if (response.data.success) {
        setCommande(response.data.data);
        setErreur("");
      } else {
        setErreur("Commande introuvable.");
      }
    } catch (error) {
      console.error("Erreur récupération commande :", error);

      setErreur(
        error.response?.data?.message ||
          "Impossible de récupérer la commande."
      );
    } finally {
      setLoading(false);
    }
  };

  const chargerDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/commande_details/commande/${id}`
      );

      if (response.data.success) {
        setDetails(response.data.data);
      }
    } catch (error) {
      console.error("Erreur récupération détails :", error);
    }
  };

  // ==========================================
  // CLIENT : CONFIRMER LA RÉCEPTION
  // ==========================================
  const confirmerReception = async () => {
    const confirmation = window.confirm(
      "Confirmez-vous avoir reçu votre commande ?"
    );

    if (!confirmation) {
      return;
    }

    try {
      setConfirmationEnCours(true);

      const response = await axios.patch(
        `http://localhost:5000/api/commandes/${id}/confirmer-reception`
      );

      if (response.data.success) {
        alert("Merci ! La réception de votre commande est confirmée.");

        // Recharger immédiatement la commande
        await chargerCommande();
      } else {
        alert(
          response.data.message ||
            "Impossible de confirmer la réception."
        );
      }
    } catch (error) {
      console.error(
        "Erreur confirmation réception :",
        error
      );

      alert(
        error.response?.data?.message ||
          "Impossible de confirmer la réception de la commande."
      );
    } finally {
      setConfirmationEnCours(false);
    }
  };

  useEffect(() => {
    chargerCommande();
    chargerDetails();

    // Actualisation automatique toutes les 5 secondes
    const interval = setInterval(() => {
      chargerCommande();
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  // ==========================================
  // Informations du statut actuel
  // ==========================================
  const getStatut = () => {
    if (!commande) return null;

    switch (commande.statut) {
      case "en_attente":
        return {
          texte: "En attente de validation",
          classe: "warning",
          icone: "bi-hourglass-split",
        };

      case "approuvee":
        return {
          texte: "Commande approuvée",
          classe: "success",
          icone: "bi-check-circle",
        };

      case "refusee":
        return {
          texte: "Commande refusée",
          classe: "danger",
          icone: "bi-x-circle",
        };

      case "livreur_assigne":
        return {
          texte: "Livreur assigné",
          classe: "info",
          icone: "bi-person-check",
        };

      case "en_preparation":
        return {
          texte: "Commande en préparation",
          classe: "primary",
          icone: "bi-fire",
        };

      case "prete":
        return {
          texte: "Commande prête",
          classe: "success",
          icone: "bi-check2-circle",
        };

      case "en_livraison":
        return {
          texte: "Commande en livraison",
          classe: "primary",
          icone: "bi-bicycle",
        };

      case "livree":
        return {
          texte: "Commande livrée",
          classe: "success",
          icone: "bi-box-seam",
        };

      case "annulee":
        return {
          texte: "Commande annulée",
          classe: "danger",
          icone: "bi-x-octagon",
        };

      default:
        return {
          texte: commande.statut,
          classe: "secondary",
          icone: "bi-info-circle",
        };
    }
  };

  // ==========================================
  // Étapes normales de la commande
  // ==========================================
  const etapes = [
    {
      statut: "en_attente",
      texte: "Commande reçue",
      icone: "bi-receipt",
    },
    {
      statut: "approuvee",
      texte: "Commande approuvée",
      icone: "bi-check-circle",
    },
    {
      statut: "livreur_assigne",
      texte: "Livreur assigné",
      icone: "bi-person-check",
    },
    {
      statut: "en_preparation",
      texte: "En préparation",
      icone: "bi-fire",
    },
    {
      statut: "prete",
      texte: "Commande prête",
      icone: "bi-check2-circle",
    },
    {
      statut: "en_livraison",
      texte: "En livraison",
      icone: "bi-bicycle",
    },
    {
      statut: "livree",
      texte: "Commande livrée",
      icone: "bi-box-seam",
    },
  ];

  const getIndexStatut = () => {
    if (!commande) return -1;

    return etapes.findIndex(
      (etape) => etape.statut === commande.statut
    );
  };

  // ==========================================
  // Chargement
  // ==========================================
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-dark"></div>

        <p className="mt-3">
          Chargement de votre commande...
        </p>
      </div>
    );
  }

  // ==========================================
  // Erreur
  // ==========================================
  if (erreur || !commande) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {erreur || "Commande introuvable."}
        </div>

        <button
          type="button"
          className="btn btn-dark"
          onClick={() => navigate("/menu")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour au menu
        </button>
      </div>
    );
  }

  const statut = getStatut();

  const commandeApprouvee =
    commande.statut !== "en_attente" &&
    commande.statut !== "refusee" &&
    commande.statut !== "annulee";

  const indexStatut = getIndexStatut();

  return (
    <div className="container py-5">

      {/* ==========================================
          RETOUR
      ========================================== */}
      <div className="mb-4">
        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={() => navigate("/menu")}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Retour au menu
        </button>
      </div>

      {/* ==========================================
          TITRE
      ========================================== */}
      <div className="text-center mb-4">
        <h2 className="fw-bold">
          Suivi de votre commande
        </h2>

        <p className="text-muted mb-0">
          Commande #{commande.numero_commande}
        </p>
      </div>

      {/* ==========================================
          STATUT ACTUEL
      ========================================== */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body text-center py-4">

          <div
            className={`text-${statut.classe}`}
            style={{ fontSize: "50px" }}
          >
            <i className={`bi ${statut.icone}`}></i>
          </div>

          <h4 className="fw-bold mt-2">
            {statut.texte}
          </h4>

          {commande.statut === "en_attente" && (
            <p className="text-muted mb-0">
              Votre commande a bien été reçue.
              <br />
              Nous attendons sa validation par le restaurant.
            </p>
          )}

          {commande.statut === "approuvee" && (
            <p className="text-success mb-0">
              Votre commande a été approuvée.
              <br />
              Les frais de livraison sont maintenant disponibles.
            </p>
          )}

          {commande.statut === "livreur_assigne" && (
            <p className="text-info mb-0">
              Un livreur a été assigné à votre commande.
            </p>
          )}

          {commande.statut === "en_preparation" && (
            <p className="text-primary mb-0">
              Le restaurant prépare actuellement votre commande.
            </p>
          )}

          {commande.statut === "prete" && (
            <p className="text-success mb-0">
              Votre commande est prête à être livrée.
            </p>
          )}

          {commande.statut === "en_livraison" && (
            <>
              <p className="text-primary mb-3">
                Votre commande est en route vers votre adresse.
              </p>

              {/* ==========================================
                  CONFIRMATION DE RÉCEPTION
              ========================================== */}
              <div className="alert alert-warning mt-4">
                <i className="bi bi-info-circle me-2"></i>

                <strong>
                  Votre commande est en cours de livraison.
                </strong>

                <br />

                Lorsque vous avez reçu votre commande,
                confirmez sa réception ci-dessous.
              </div>

              <button
                type="button"
                className="btn btn-success btn-lg mt-2"
                onClick={confirmerReception}
                disabled={confirmationEnCours}
              >
                {confirmationEnCours ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>

                    Confirmation...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    J'ai reçu ma commande
                  </>
                )}
              </button>
            </>
          )}

          {commande.statut === "livree" && (
            <>
              <p className="text-success mb-2">
                Votre commande a été livrée.
                <br />
                Merci pour votre confiance !
              </p>

              <div className="alert alert-success mt-3 mb-0">
                <i className="bi bi-check-circle me-2"></i>
                <strong>Réception confirmée.</strong>
                <br />
                Vous avez confirmé la réception de votre commande.
              </div>
            </>
          )}

          {commande.statut === "refusee" && (
            <div className="alert alert-danger mt-3 mb-0">
              <strong>Motif du refus :</strong>
              <br />
              {commande.motif_refus ||
                "Aucun motif indiqué."}
            </div>
          )}

          {commande.statut === "annulee" && (
            <div className="alert alert-danger mt-3 mb-0">
              <strong>
                Cette commande a été annulée.
              </strong>

              {commande.motif_refus && (
                <>
                  <br />
                  Motif : {commande.motif_refus}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          PROGRESSION DE LA COMMANDE
      ========================================== */}
      {commande.statut !== "refusee" &&
        commande.statut !== "annulee" && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-dark text-white py-3">
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Progression de votre commande
              </h5>
            </div>

            <div className="card-body py-4">

              {etapes.map((etape, index) => {
                const terminee =
                  index < indexStatut;

                const actuelle =
                  index === indexStatut;

                return (
                  <div key={etape.statut}>

                    <div className="d-flex align-items-center">

                      {/* Cercle */}
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                          terminee
                            ? "bg-success text-white"
                            : actuelle
                            ? "bg-dark text-white"
                            : "bg-light text-muted"
                        }`}
                        style={{
                          width: "45px",
                          height: "45px",
                        }}
                      >
                        <i
                          className={`bi ${
                            terminee
                              ? "bi-check-lg"
                              : etape.icone
                          }`}
                        ></i>
                      </div>

                      {/* Texte */}
                      <div className="ms-3">

                        <div
                          className={`fw-semibold ${
                            actuelle
                              ? "text-dark"
                              : terminee
                              ? "text-success"
                              : "text-muted"
                          }`}
                        >
                          {etape.texte}
                        </div>

                        {actuelle && (
                          <small className="text-muted">
                            Étape actuelle
                          </small>
                        )}

                        {terminee && (
                          <small className="text-success d-block">
                            Terminée
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Ligne entre les étapes */}
                    {index < etapes.length - 1 && (
                      <div
                        className={`ms-3 ${
                          index < indexStatut
                            ? "border-success"
                            : "border-secondary"
                        }`}
                        style={{
                          height: "35px",
                          borderLeft: "2px solid",
                          opacity:
                            index < indexStatut
                              ? 1
                              : 0.25,
                        }}
                      ></div>
                    )}
                  </div>
                );
              })}

              <div className="alert alert-light border mt-4 mb-0 text-center">
                <i className="bi bi-arrow-repeat me-2"></i>
                Le statut de votre commande est vérifié automatiquement.
              </div>
            </div>
          </div>
        )}

      {/* ==========================================
          PLATS COMMANDÉS
      ========================================== */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-dark text-white py-3">
          <h5 className="mb-0">
            <i className="bi bi-bag me-2"></i>
            Votre commande
          </h5>
        </div>

        <div className="card-body">

          {details.length === 0 ? (
            <p className="text-muted text-center mb-0">
              Aucun détail de plat trouvé.
            </p>
          ) : (
            details.map((detail) => (
              <div
                key={detail.id}
                className="d-flex justify-content-between align-items-center border-bottom py-3"
              >
                <div>
                  <div className="fw-semibold">
                    {detail.plat_nom}
                  </div>

                  <small className="text-muted">
                    {detail.quantite} ×{" "}
                    {Number(
                      detail.prix_unitaire
                    ).toLocaleString("fr-FR")}{" "}
                    FBu
                  </small>
                </div>

                <strong>
                  {(
                    Number(detail.prix_unitaire) *
                    Number(detail.quantite)
                  ).toLocaleString("fr-FR")}{" "}
                  FBu
                </strong>
              </div>
            ))
          )}

          {/* Total plats */}
          <div className="d-flex justify-content-between mt-4">
            <span className="fw-semibold">
              Total des plats
            </span>

            <strong>
              {Number(
                commande.total_plats
              ).toLocaleString("fr-FR")}{" "}
              FBu
            </strong>
          </div>

          {/* Frais de livraison */}
          {commandeApprouvee && (
            <>
              <div className="d-flex justify-content-between mt-3">
                <span className="fw-semibold">
                  Frais de livraison
                </span>

                <strong>
                  {Number(
                    commande.frais_livraison
                  ).toLocaleString("fr-FR")}{" "}
                  FBu
                </strong>
              </div>

              <hr />

              {/* Total final */}
              <div className="d-flex justify-content-between fs-4 fw-bold">
                <span>Total à payer</span>

                <span>
                  {Number(
                    commande.total_commande
                  ).toLocaleString("fr-FR")}{" "}
                  FBu
                </span>
              </div>
            </>
          )}

          {/* Avant approbation */}
          {commande.statut === "en_attente" && (
            <div className="alert alert-info mt-4 mb-0">
              <i className="bi bi-info-circle me-2"></i>

              Les frais de livraison et le total final
              seront affichés après validation de votre
              commande.
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          INFORMATIONS CLIENT
      ========================================== */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-dark text-white py-3">
          <h5 className="mb-0">
            <i className="bi bi-person me-2"></i>
            Informations de livraison
          </h5>
        </div>

        <div className="card-body">

          <p className="mb-2">
            <strong>Nom :</strong>{" "}
            {commande.client_nom}
          </p>

          <p className="mb-2">
            <strong>Téléphone :</strong>{" "}
            {commande.client_telephone}
          </p>

          <p className="mb-0">
            <strong>Adresse :</strong>{" "}
            {commande.adresse}
          </p>

        </div>
      </div>

      {/* ==========================================
          GPS
      ========================================== */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">

          <h6 className="fw-bold">
            <i className="bi bi-geo-alt me-2"></i>
            Localisation GPS
          </h6>

          <small className="text-muted">
            Latitude : {commande.latitude}
            <br />
            Longitude : {commande.longitude}
          </small>

        </div>
      </div>

    </div>
  );
}

export default SuiviCommande;