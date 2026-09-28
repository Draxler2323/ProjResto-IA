import { useEffect, useState } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

function Statistiques() {

  const [statistiques, setStatistiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  // ==========================================
  // RÉCUPÉRER LES STATISTIQUES
  // ==========================================
  const chargerStatistiques = async () => {

    try {

      setLoading(true);
      setErreur("");

      const response = await axios.get(
        "http://localhost:5000/api/statistiques"
      );

      if (response.data.success) {

        setStatistiques(response.data.data);

      } else {

        setErreur(
          "Impossible de récupérer les statistiques."
        );

      }

    } catch (error) {

      console.error(
        "Erreur statistiques :",
        error
      );

      setErreur(
        "Erreur lors du chargement des statistiques."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================
  // CHARGEMENT INITIAL
  // ==========================================
  useEffect(() => {

    chargerStatistiques();

  }, []);


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
          Chargement des statistiques...
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

          <div>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {erreur}
          </div>

          <button
            className="btn btn-danger btn-sm"
            onClick={chargerStatistiques}
          >
            Réessayer
          </button>

        </div>

      </div>
    );

  }


  if (!statistiques) {
    return null;
  }


  const generales =
    statistiques.generales || {};

  const evolution =
    statistiques.evolutionCommandes || [];

  const commandesParStatut =
    statistiques.commandesParStatut || [];

  const platsPopulaires =
    statistiques.platsPopulaires || [];

  const performanceLivreurs =
    statistiques.performanceLivreurs || [];


  // ==========================================
  // FORMATAGE DES DONNÉES
  // ==========================================

  const evolutionFormatee =
    evolution.map((item) => {

      const date = new Date(item.date);

      return {
        date: date.toLocaleDateString(
          "fr-FR",
          {
            day: "2-digit",
            month: "2-digit"
          }
        ),
        total: Number(item.total)
      };

    });


  const statutsFormates =
    commandesParStatut.map((item) => {

      return {
        statut: formaterStatut(item.statut),
        total: Number(item.total)
      };

    });


  const platsFormates =
    platsPopulaires.map((item) => {

      return {
        nom: item.nom,
        quantite: Number(
          item.quantite_totale
        )
      };

    });


  const livreursFormates =
    performanceLivreurs.map((item) => {

      return {
        nom: item.livreur_nom,
        livraisons: Number(
          item.livraisons_terminees || 0
        ),
        total: Number(
          item.total_livraisons || 0
        ),
        frais: Number(
          item.frais_livraison_generes || 0
        )
      };

    });


  // ==========================================
  // COULEURS DU CAMEMBERT
  // ==========================================

  const couleursStatuts = [
    "#0d6efd",
    "#198754",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#fd7e14",
    "#20c997",
    "#6c757d",
    "#d63384"
  ];


  // ==========================================
  // FONCTIONS
  // ==========================================

  function formaterStatut(statut) {

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

    return (
      statuts[statut] ||
      statut
    );

  }


  function formaterMontant(montant) {

    return Number(
      montant || 0
    ).toLocaleString(
      "fr-FR"
    ) + " FBu";

  }


  // ==========================================
  // AFFICHAGE
  // ==========================================

  return (

    <div>

      {/* ======================================
          TITRE
      ====================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h1 className="fw-bold mb-1">
            Statistiques 📊
          </h1>

          <p className="text-muted mb-0">
            Analyse de l'activité de votre restaurant.
          </p>

        </div>


        <button
          className="btn btn-dark"
          onClick={chargerStatistiques}
        >

          <i className="bi bi-arrow-clockwise me-2"></i>

          Actualiser

        </button>

      </div>


      {/* ======================================
          CARTES KPI
      ====================================== */}

      <div className="row g-4 mb-4">


        {/* COMMANDES */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Commandes
                  </p>

                  <h3 className="fw-bold mb-0">
                    {Number(
                      generales.total_commandes || 0
                    ).toLocaleString("fr-FR")}
                  </h3>

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

            </div>

          </div>

        </div>


        {/* CHIFFRE AFFAIRES */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Chiffre d'affaires
                  </p>

                  <h3 className="fw-bold mb-0">

                    {formaterMontant(
                      generales.chiffre_affaires
                    )}

                  </h3>

                </div>

                <div
                  className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px"
                  }}
                >

                  <i className="bi bi-cash-stack fs-4"></i>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* LIVRAISONS */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Livraisons
                  </p>

                  <h3 className="fw-bold mb-0">

                    {Number(
                      generales.total_livraisons || 0
                    ).toLocaleString("fr-FR")}

                  </h3>

                </div>

                <div
                  className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px"
                  }}
                >

                  <i className="bi bi-truck fs-4"></i>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* FRAIS LIVRAISON */}

        <div className="col-md-6 col-xl-3">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <div className="d-flex justify-content-between align-items-center">

                <div>

                  <p className="text-muted mb-1">
                    Frais de livraison
                  </p>

                  <h3 className="fw-bold mb-0">

                    {formaterMontant(
                      generales.frais_livraison
                    )}

                  </h3>

                </div>

                <div
                  className="bg-info bg-opacity-10 text-info rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "50px",
                    height: "50px"
                  }}
                >

                  <i className="bi bi-geo-alt fs-4"></i>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          PREMIÈRE LIGNE GRAPHIQUES
      ====================================== */}

      <div className="row g-4 mb-4">


        {/* ÉVOLUTION COMMANDES */}

        <div className="col-xl-8">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                Évolution des commandes
              </h5>

              {evolutionFormatee.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >

                  <LineChart
                    data={evolutionFormatee}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 5
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="date"
                    />

                    <YAxis
                      allowDecimals={false}
                    />

                    <Tooltip />

                    <Legend />

                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Commandes"
                      stroke="#0d6efd"
                      strokeWidth={3}
                      activeDot={{
                        r: 7
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div className="text-center text-muted py-5">

                  <i className="bi bi-bar-chart fs-1"></i>

                  <p className="mt-3 mb-0">
                    Aucune donnée disponible.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* COMMANDES PAR STATUT */}

        <div className="col-xl-4">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                Commandes par statut
              </h5>

              {statutsFormates.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >

                  <PieChart>

                    <Pie
                      data={statutsFormates}
                      dataKey="total"
                      nameKey="statut"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      label
                    >

                      {statutsFormates.map(
                        (entry, index) => (

                          <Cell
                            key={`cell-${index}`}
                            fill={
                              couleursStatuts[
                                index %
                                couleursStatuts.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip />

                  </PieChart>

                </ResponsiveContainer>

              ) : (

                <div className="text-center text-muted py-5">

                  <i className="bi bi-pie-chart fs-1"></i>

                  <p className="mt-3 mb-0">
                    Aucune donnée disponible.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          DEUXIÈME LIGNE GRAPHIQUES
      ====================================== */}

      <div className="row g-4 mb-4">


        {/* PLATS POPULAIRES */}

        <div className="col-xl-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                🍔 Plats les plus commandés
              </h5>

              {platsFormates.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >

                  <BarChart
                    data={platsFormates}
                    layout="vertical"
                    margin={{
                      top: 10,
                      right: 20,
                      left: 20,
                      bottom: 5
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="nom"
                      width={110}
                    />

                    <Tooltip />

                    <Bar
                      dataKey="quantite"
                      name="Quantité commandée"
                      fill="#198754"
                      radius={[
                        0,
                        5,
                        5,
                        0
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div className="text-center text-muted py-5">

                  <i className="bi bi-egg-fried fs-1"></i>

                  <p className="mt-3 mb-0">
                    Aucun plat vendu pour le moment.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>


        {/* PERFORMANCE LIVREURS */}

        <div className="col-xl-6">

          <div className="card border-0 shadow-sm h-100">

            <div className="card-body">

              <h5 className="fw-bold mb-4">
                🚴 Performance des livreurs
              </h5>

              {livreursFormates.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >

                  <BarChart
                    data={livreursFormates}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 5
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="nom"
                    />

                    <YAxis
                      allowDecimals={false}
                    />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="livraisons"
                      name="Livraisons terminées"
                      fill="#0d6efd"
                      radius={[
                        5,
                        5,
                        0,
                        0
                      ]}
                    />

                    <Bar
                      dataKey="total"
                      name="Total livraisons"
                      fill="#6c757d"
                      radius={[
                        5,
                        5,
                        0,
                        0
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              ) : (

                <div className="text-center text-muted py-5">

                  <i className="bi bi-person-badge fs-1"></i>

                  <p className="mt-3 mb-0">
                    Aucun livreur disponible.
                  </p>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* ======================================
          TABLEAU PERFORMANCE LIVREURS
      ====================================== */}

      <div className="card border-0 shadow-sm">

        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-4">

            <h5 className="fw-bold mb-0">
              Détails des livreurs
            </h5>

            <span className="badge bg-light text-dark">
              {livreursFormates.length} livreur(s)
            </span>

          </div>


          {livreursFormates.length > 0 ? (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead className="table-light">

                  <tr>

                    <th>
                      Livreur
                    </th>

                    <th>
                      Total livraisons
                    </th>

                    <th>
                      Livraisons terminées
                    </th>

                    <th>
                      Frais générés
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {livreursFormates.map(
                    (livreur, index) => (

                      <tr key={index}>

                        <td>

                          <div className="d-flex align-items-center gap-2">

                            <div
                              className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: "36px",
                                height: "36px"
                              }}
                            >

                              <i className="bi bi-person"></i>

                            </div>

                            <span className="fw-semibold">
                              {livreur.nom}
                            </span>

                          </div>

                        </td>


                        <td>

                          <span className="badge bg-secondary">

                            {livreur.total}

                          </span>

                        </td>


                        <td>

                          <span className="badge bg-success">

                            {livreur.livraisons}

                          </span>

                        </td>


                        <td className="fw-semibold">

                          {formaterMontant(
                            livreur.frais
                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          ) : (

            <div className="text-center text-muted py-4">

              Aucune donnée disponible.

            </div>

          )}

        </div>

      </div>


    </div>

  );
}

export default Statistiques;