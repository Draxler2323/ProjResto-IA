
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

  const [commandes, setCommandes] = useState([]);
  const [livraisons, setLivraisons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  // ==========================================
  // CHARGER LES DONNÉES DU DASHBOARD
  // ==========================================
  const chargerDashboard = async () => {

    try {

      setLoading(true);
      setErreur("");

      const [
        commandesResponse,
        livraisonsResponse
      ] = await Promise.all([

        axios.get(
          "http://localhost:5000/api/commandes"
        ),

        axios.get(
          "http://localhost:5000/api/livraisons"
        )

      ]);


      // ==========================================
      // RÉCUPÉRER LES COMMANDES
      // ==========================================

      let donneesCommandes = [];

      if (
        Array.isArray(
          commandesResponse.data
        )
      ) {

        donneesCommandes =
          commandesResponse.data;

      } else if (
        Array.isArray(
          commandesResponse.data?.data
        )
      ) {

        donneesCommandes =
          commandesResponse.data.data;

      } else if (
        Array.isArray(
          commandesResponse.data?.commandes
        )
      ) {

        donneesCommandes =
          commandesResponse.data.commandes;

      }

      setCommandes(donneesCommandes);


      // ==========================================
      // RÉCUPÉRER LES LIVRAISONS
      // ==========================================

      let donneesLivraisons = [];

      if (
        Array.isArray(
          livraisonsResponse.data
        )
      ) {

        donneesLivraisons =
          livraisonsResponse.data;

      } else if (
        Array.isArray(
          livraisonsResponse.data?.data
        )
      ) {

        donneesLivraisons =
          livraisonsResponse.data.data;

      } else if (
        Array.isArray(
          livraisonsResponse.data?.livraisons
        )
      ) {

        donneesLivraisons =
          livraisonsResponse.data.livraisons;

      }

      setLivraisons(donneesLivraisons);

    } catch (error) {

      console.error(
        "Erreur chargement dashboard :",
        error
      );

      setErreur(
        "Impossible de charger les données du dashboard."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // CHARGEMENT INITIAL
  // ==========================================
  useEffect(() => {

    chargerDashboard();

  }, []);


  // ==========================================
  // COMPTER LES COMMANDES PAR STATUT
  // ==========================================

  const totalCommandes =
    commandes.length;


  const commandesEnAttente =
    commandes.filter(
      (commande) =>
        commande.statut === "en_attente"
    ).length;


  const commandesLivrees =
    commandes.filter(
      (commande) =>
        commande.statut === "livree"
    ).length;


  const commandesEnPreparation =
    commandes.filter(
      (commande) =>
        commande.statut === "en_preparation"
    ).length;


  const livraisonsEnCours =
    livraisons.filter(
      (livraison) =>
        livraison.statut === "en_livraison"
    ).length;


  // ==========================================
  // FORMATER LE STATUT
  // ==========================================

  const formaterStatut = (statut) => {

    const statuts = {

      en_attente: "En attente",

      approuvee: "Approuvée",

      refusee: "Refusée",

      livreur_assigne: "Livreur assigné",

      en_preparation: "En préparation",

      prete: "Prête",

      en_livraison: "En livraison",

      livree: "Livrée",

      annulee: "Annulée"

    };

    return statuts[statut] || statut;

  };


  // ==========================================
  // COULEUR DU BADGE STATUT
  // ==========================================

  const couleurStatut = (statut) => {

    const couleurs = {

      en_attente: "warning",

      approuvee: "primary",

      refusee: "danger",

      livreur_assigne: "info",

      en_preparation: "secondary",

      prete: "success",

      en_livraison: "primary",

      livree: "success",

      annulee: "danger"

    };

    return couleurs[statut] || "secondary";

  };


  // ==========================================
  // FORMATAGE DU MONTANT
  // ==========================================

  const formaterMontant = (montant) => {

    return (
      Number(montant || 0).toLocaleString("fr-FR")
      + " FBu"
    );

  };


  // ==========================================
  // FORMATAGE DE LA DATE
  // ==========================================

  const formaterDate = (date) => {

    if (!date) {
      return "Date inconnue";
    }

    return new Date(date).toLocaleString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };


  // ==========================================
  // DERNIÈRES COMMANDES
  // ==========================================

  const dernieresCommandes = [...commandes]
    .sort((a, b) => {

      const dateA = new Date(
        a.created_at || 0
      );

      const dateB = new Date(
        b.created_at || 0
      );

      return dateB - dateA;

    })
    .slice(0, 5);


  // ==========================================
  // CHARGEMENT
  // ==========================================

  if (loading) {

    return (

      <div className="text-center py-5">

        <div
          className="spinner-border"
          role="status"
        ></div>

        <p className="text-muted mt-3">
          Chargement du dashboard...
        </p>

      </div>

    );

  }


  // ==========================================
  // ERREUR
  // ==========================================

  if (erreur) {

    return (

      <div className="alert alert-danger">

        <div className="d-flex justify-content-between align-items-center">

          <span>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {erreur}
          </span>

          <button
            className="btn btn-danger btn-sm"
            onClick={chargerDashboard}
          >
            Réessayer
          </button>

        </div>

      </div>

    );

  }


  // ==========================================
  // AFFICHAGE DU DASHBOARD
  // ==========================================

  return (

    <div>

      {/* ======================================
          EN-TÊTE
      ====================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h1 className="fw-bold mb-1">
            Dashboard
          </h1>

          <p className="text-muted mb-0">
            Bienvenue dans le panneau d'administration
            d'AZPRO Restaurant.
          </p>

        </div>


        <button
          className="btn btn-dark"
          onClick={chargerDashboard}
        >

          <i className="bi bi-arrow-clockwise me-2"></i>

          Actualiser

        </button>

      </div>


      {/* ======================================
          CARTES STATISTIQUES
      ====================================== */}

      <div className="row g-4 mb-4">


        {/* TOTAL COMMANDES */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Total commandes
                  </p>

                  <h2 className="fw-bold mb-0">
                    {totalCommandes}
                  </h2>

                </div>

                <div
                  className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px"
                  }}
                >

                  <i className="bi bi-cart3 fs-4"></i>

                </div>

              </div>

              <small className="text-muted">
                Toutes les commandes
              </small>

            </div>

          </div>

        </div>


        {/* COMMANDES EN ATTENTE */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    En attente
                  </p>

                  <h2 className="fw-bold mb-0">
                    {commandesEnAttente}
                  </h2>

                </div>

                <div
                  className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px"
                  }}
                >

                  <i className="bi bi-hourglass-split fs-4"></i>

                </div>

              </div>

              <small className="text-muted">
                À traiter par l'administration
              </small>

            </div>

          </div>

        </div>


        {/* LIVRAISONS EN COURS */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Livraisons en cours
                  </p>

                  <h2 className="fw-bold mb-0">
                    {livraisonsEnCours}
                  </h2>

                </div>

                <div
                  className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px"
                  }}
                >

                  <i className="bi bi-truck fs-4"></i>

                </div>

              </div>

              <small className="text-muted">
                Livraisons actuellement en route
              </small>

            </div>

          </div>

        </div>


        {/* COMMANDES LIVRÉES */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Commandes livrées
                  </p>

                  <h2 className="fw-bold mb-0">
                    {commandesLivrees}
                  </h2>

                </div>

                <div
                  className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px"
                  }}
                >

                  <i className="bi bi-check-circle fs-4"></i>

                </div>

              </div>

              <small className="text-muted">
                Commandes confirmées comme livrées
              </small>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          RÉSUMÉ DE L'ACTIVITÉ
      ====================================== */}

      <div className="row g-4 mb-4">


        {/* COMMANDES EN PRÉPARATION */}

        <div className="col-md-6">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="bg-secondary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "45px",
                    height: "45px"
                  }}
                >

                  <i className="bi bi-egg-fried fs-5"></i>

                </div>

                <div>

                  <h6 className="mb-1 fw-bold">
                    Commandes en préparation
                  </h6>

                  <h4 className="mb-0 fw-bold">
                    {commandesEnPreparation}
                  </h4>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* TOTAL LIVRAISONS */}

        <div className="col-md-6">

          <div className="card border-0 shadow-sm">

            <div className="card-body">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "45px",
                    height: "45px"
                  }}
                >

                  <i className="bi bi-box-seam fs-5"></i>

                </div>

                <div>

                  <h6 className="mb-1 fw-bold">
                    Total livraisons enregistrées
                  </h6>

                  <h4 className="mb-0 fw-bold">
                    {livraisons.length}
                  </h4>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          DERNIÈRES COMMANDES
      ====================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <h5 className="fw-bold mb-0">
              Dernières commandes
            </h5>

            <a
              href="/admin/commandes"
              className="btn btn-outline-dark btn-sm"
            >

              Voir toutes

              <i className="bi bi-arrow-right ms-2"></i>

            </a>

          </div>


          {dernieresCommandes.length > 0 ? (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      N° commande
                    </th>

                    <th>
                      Client
                    </th>

                    <th>
                      Montant
                    </th>

                    <th>
                      Statut
                    </th>

                    <th>
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {dernieresCommandes.map(
                    (commande) => (

                      <tr key={commande.id}>

                        <td>

                          <span className="fw-semibold">
                            {commande.numero_commande ||
                              `#${commande.id}`}
                          </span>

                        </td>


                        <td>

                          <div>

                            <div className="fw-semibold">
                              {commande.client_nom ||
                                "Client inconnu"}
                            </div>

                            <small className="text-muted">
                              {commande.client_telephone ||
                                "Téléphone inconnu"}
                            </small>

                          </div>

                        </td>


                        <td className="fw-semibold">

                          {formaterMontant(
                            commande.total_commande
                          )}

                        </td>


                        <td>

                          <span
                            className={`badge text-bg-${couleurStatut(
                              commande.statut
                            )}`}
                          >

                            {formaterStatut(
                              commande.statut
                            )}

                          </span>

                        </td>


                        <td>

                          <small className="text-muted">
                            {formaterDate(
                              commande.created_at
                            )}
                          </small>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="text-center text-muted py-5">

              <i className="bi bi-inbox fs-1"></i>

              <p className="mt-3 mb-0">
                Aucune commande enregistrée.
              </p>

            </div>

          )}

        </div>

      </div>


    </div>

  );

}

export default Dashboard;
