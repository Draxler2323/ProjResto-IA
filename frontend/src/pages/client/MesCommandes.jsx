import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function MesCommandes() {
  const navigate = useNavigate();

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    const telephone = localStorage.getItem("clientTelephone");

    if (!telephone) {
      setErreur(
        "Aucune information client trouvée. Veuillez passer une commande."
      );
      setLoading(false);
      return;
    }

    const chargerCommandes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/commandes/client/${telephone}`
        );

        if (response.data.success) {
          setCommandes(response.data.data);
        } else {
          setErreur(
            response.data.message ||
              "Impossible de récupérer vos commandes."
          );
        }
      } catch (error) {
        console.error(
          "Erreur récupération commandes :",
          error
        );

        setErreur(
          error.response?.data?.message ||
            "Impossible de récupérer vos commandes."
        );
      } finally {
        setLoading(false);
      }
    };

    chargerCommandes();
  }, []);

  const voirCommande = (id) => {
    navigate(`/suivi-commande/${id}`);
  };

  return (
    <div className="container py-5">

      {/* RETOUR */}

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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-receipt me-2"></i>
          Mes commandes
        </h2>
      </div>

      {/* CHARGEMENT */}

      {loading && (
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
          ></div>

          <p className="mt-3">
            Chargement de vos commandes...
          </p>
        </div>
      )}

      {/* ERREUR */}

      {!loading && erreur && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-circle me-2"></i>
          {erreur}
        </div>
      )}

      {/* AUCUNE COMMANDE */}

      {!loading &&
        !erreur &&
        commandes.length === 0 && (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>

            Vous n'avez encore aucune commande.
          </div>
        )}

      {/* COMMANDES */}

      {!loading && commandes.length > 0 && (
        <div className="row g-4">

          {commandes.map((commande) => (

            <div
              className="col-md-6 col-lg-4"
              key={commande.id}
            >

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-start mb-3">

                    <h5 className="card-title mb-0">
                      #{commande.numero_commande}
                    </h5>

                    {commande.statut === "en_attente" && (
                      <span className="badge bg-warning text-dark">
                        En attente
                      </span>
                    )}

                    {commande.statut === "approuvee" && (
                      <span className="badge bg-success">
                        Approuvée
                      </span>
                    )}

                    {commande.statut === "refusee" && (
                      <span className="badge bg-danger">
                        Refusée
                      </span>
                    )}

                  </div>

                  <p className="text-muted mb-2">
                    <i className="bi bi-calendar3 me-2"></i>

                    {new Date(
                      commande.created_at
                    ).toLocaleDateString("fr-FR")}
                  </p>

                  <p className="mb-2">
                    <strong>Total :</strong>{" "}
                    {Number(
                      commande.total_commande
                    ).toLocaleString("fr-FR")}{" "}
                    FBu
                  </p>

                  <p className="mb-3">
                    <strong>Adresse :</strong>{" "}
                    {commande.adresse}
                  </p>

                  <button
                    type="button"
                    className="btn btn-dark w-100"
                    onClick={() =>
                      voirCommande(commande.id)
                    }
                  >
                    <i className="bi bi-eye me-2"></i>
                    Voir le suivi
                  </button>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default MesCommandes;