import { useEffect, useState } from "react";
import api from "../../services/api";

function Livraisons() {
    const [livraisons, setLivraisons] = useState([]);
    const [loading, setLoading] = useState(true);

    const chargerLivraisons = async () => {
        try {
            setLoading(true);

            const response = await api.get("/livraisons");

            setLivraisons(response.data.data || []);
        } catch (error) {
            console.error(
                "Erreur récupération livraisons :",
                error
            );

            alert(
                error.response?.data?.message ||
                "Erreur lors de la récupération des livraisons"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerLivraisons();
    }, []);

    const getStatutBadge = (statut) => {
        switch (statut) {
            case "attribuee":
                return (
                    <span className="badge bg-primary">
                        Attribuée
                    </span>
                );

            case "prise_en_charge":
                return (
                    <span className="badge bg-warning text-dark">
                        Prise en charge
                    </span>
                );

            case "en_livraison":
                return (
                    <span className="badge bg-info text-dark">
                        En livraison
                    </span>
                );

            case "livree":
                return (
                    <span className="badge bg-success">
                        Livrée
                    </span>
                );

            case "annulee":
                return (
                    <span className="badge bg-danger">
                        Annulée
                    </span>
                );

            default:
                return (
                    <span className="badge bg-secondary">
                        {statut}
                    </span>
                );
        }
    };

    return (
        <div className="container-fluid">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="bi bi-truck me-2"></i>
                        Livraisons
                    </h2>

                    <p className="text-muted mb-0">
                        Gestion des livraisons en cours et terminées
                    </p>
                </div>

                <button
                    className="btn btn-outline-primary"
                    onClick={chargerLivraisons}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Actualiser
                </button>
            </div>


            {loading ? (
                <div className="text-center py-5">
                    <div
                        className="spinner-border text-primary"
                        role="status"
                    >
                        <span className="visually-hidden">
                            Chargement...
                        </span>
                    </div>

                    <p className="mt-3 text-muted">
                        Chargement des livraisons...
                    </p>
                </div>
            ) : livraisons.length === 0 ? (
                <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Aucune livraison enregistrée pour le moment.
                </div>
            ) : (
                <div className="card shadow-sm">

                    <div className="card-body p-0">

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Commande</th>
                                        <th>Client</th>
                                        <th>Livreur</th>
                                        <th>Distance</th>
                                        <th>Frais</th>
                                        <th>Statut</th>
                                        <th>Date attribution</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {livraisons.map((livraison) => (

                                        <tr key={livraison.id}>

                                            <td>
                                                #{livraison.id}
                                            </td>

                                            <td>
                                                <strong>
                                                    {livraison.numero_commande ||
                                                        `Commande #${livraison.commande_id}`}
                                                </strong>
                                            </td>

                                            <td>
                                                <div>
                                                    <strong>
                                                        {livraison.client_nom ||
                                                            "—"}
                                                    </strong>
                                                </div>

                                                <small className="text-muted">
                                                    {livraison.client_telephone ||
                                                        "—"}
                                                </small>
                                            </td>

                                            <td>
                                                <div>
                                                    <strong>
                                                        {livraison.livreur_nom ||
                                                            "—"}
                                                    </strong>
                                                </div>

                                                <small className="text-muted">
                                                    {livraison.livreur_telephone ||
                                                        "—"}
                                                </small>
                                            </td>

                                            <td>
                                                {livraison.distance_km} km
                                            </td>

                                            <td>
                                                <strong>
                                                    {Number(
                                                        livraison.frais_livraison || 0
                                                    ).toLocaleString(
                                                        "fr-FR"
                                                    )}{" "}
                                                    BIF
                                                </strong>
                                            </td>

                                            <td>
                                                {getStatutBadge(
                                                    livraison.statut
                                                )}
                                            </td>

                                            <td>
                                                {livraison.date_attribution
                                                    ? new Date(
                                                          livraison.date_attribution
                                                      ).toLocaleString(
                                                          "fr-FR"
                                                      )
                                                    : "—"}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Livraisons;