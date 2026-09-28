import { useEffect, useState } from "react";
import api from "../../services/api";
import axios from "axios";

function Commandes() {

    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filtre, setFiltre] = useState("tous");

    const [commandeSelectionnee, setCommandeSelectionnee] =
        useState(null);

    const [detailsCommande, setDetailsCommande] =
        useState([]);

    const [chargementDetails, setChargementDetails] =
        useState(false);

    // ==========================================
    // LIVREURS
    // ==========================================

    const [livreursDisponibles, setLivreursDisponibles] =
        useState([]);

    const [afficherLivreurs, setAfficherLivreurs] =
        useState(false);

    const [chargementLivreurs, setChargementLivreurs] =
        useState(false);

    const [livreurSelectionne, setLivreurSelectionne] =
        useState(null);

    const [assignationEnCours, setAssignationEnCours] =
        useState(false);

    const API_URL = "http://localhost:5000/api";


    // ==========================================
    // CHARGER LES COMMANDES
    // ==========================================

    const chargerCommandes = async () => {

        try {

            setLoading(true);

            const response =
                await axios.get(`${API_URL}/commandes`);

            if (response.data.success) {

                setCommandes(response.data.data);
            }

        } catch (error) {

            console.error(
                "Erreur chargement commandes :",
                error
            );

            alert(
                error.response?.data?.message ||
                "Impossible de charger les commandes"
            );

        } finally {

            setLoading(false);
        }
    };


    // ==========================================
    // CHARGER LES COMMANDES AU DÉMARRAGE
    // ==========================================

    useEffect(() => {

        chargerCommandes();

    }, []);


    // ==========================================
    // IMAGE
    // ==========================================

    const getImageUrl = (image) => {

        if (!image) {
            return null;
        }

        if (image.startsWith("http")) {
            return image;
        }

        return `http://localhost:5000/uploads/${image}`;
    };


    // ==========================================
    // VOIR UNE COMMANDE
    // ==========================================

    const voirCommande = async (commande) => {

        try {

            setCommandeSelectionnee(commande);

            setDetailsCommande([]);

            setChargementDetails(true);

            const response =
                await axios.get(
                    `${API_URL}/commande_details/commande/${commande.id}`
                );

            if (response.data.success) {

                setDetailsCommande(
                    response.data.data
                );
            }

        } catch (error) {

            console.error(
                "Erreur chargement détails :",
                error
            );

            alert(
                error.response?.data?.message ||
                "Impossible de charger les détails de la commande"
            );

        } finally {

            setChargementDetails(false);
        }
    };


    // ==========================================
    // LABEL DES STATUTS
    // ==========================================

    const getStatutLabel = (statut) => {

        const labels = {

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

        return labels[statut] || statut;
    };


    // ==========================================
    // CLASSE BOOTSTRAP DU STATUT
    // ==========================================

    const getStatutClass = (statut) => {

        const classes = {

            en_attente: "bg-warning text-dark",

            approuvee: "bg-primary",

            refusee: "bg-danger",

            livreur_assigne: "bg-info text-dark",

            en_preparation: "bg-secondary",

            prete: "bg-success",

            en_livraison: "bg-dark",

            livree: "bg-success",

            annulee: "bg-danger"
        };

        return classes[statut] || "bg-secondary";
    };


    // ==========================================
    // STATUT SUIVANT
    // ==========================================

  const getStatutSuivant = (commande) => {

    // Le livreur doit d'abord accepter
    if (
        commande.statut === "livreur_assigne" &&
        commande.livraison_statut === "prise_en_charge"
    ) {
        return "en_preparation";
    }

    const progression = {

        en_preparation: "prete",

        prete: "en_livraison"
    };

    return progression[commande.statut] || null;
};


    // ==========================================
    // LABEL DE L'ACTION
    // ==========================================

  const getActionLabel = (commande) => {

    if (
        commande.statut === "livreur_assigne" &&
        commande.livraison_statut === "prise_en_charge"
    ) {
        return "Commencer la préparation";
    }

    const actions = {

        en_preparation:
            "Marquer comme prête",

        prete:
            "Mettre en livraison"
    };

    return actions[commande.statut] || null;
};


    // ==========================================
    // CHANGER LE STATUT
    // ==========================================

    const changerStatut = async (
        id,
        statut,
        motif_refus = null
    ) => {

        try {

            await axios.patch(
                `${API_URL}/commandes/${id}/status`,
                {
                    statut,
                    motif_refus
                }
            );

            await chargerCommandes();

            // Actualiser la commande dans le modal
            const response =
                await axios.get(
                    `${API_URL}/commandes/${id}`
                );

            if (response.data.success) {

                setCommandeSelectionnee(
                    response.data.data
                );
            }

        } catch (error) {

            console.error(
                "Erreur changement statut :",
                error
            );

            alert(
                error.response?.data?.message ||
                "Erreur lors de la modification du statut"
            );
        }
    };


    // ==========================================
    // APPROUVER
    // ==========================================

    const approuverCommande = async (commande) => {

        const confirmation = window.confirm(
            `Voulez-vous approuver la commande ${commande.numero_commande} ?`
        );

        if (!confirmation) {
            return;
        }

        await changerStatut(
            commande.id,
            "approuvee"
        );
    };


    // ==========================================
    // REFUSER
    // ==========================================

    const refuserCommande = async (commande) => {

        const motif =
            window.prompt(
                `Pourquoi refusez-vous la commande ${commande.numero_commande} ?`
            );

        if (motif === null) {
            return;
        }

        if (!motif.trim()) {

            alert(
                "Veuillez indiquer le motif du refus."
            );

            return;
        }

        await changerStatut(
            commande.id,
            "refusee",
            motif.trim()
        );
    };


    // ==========================================
    // FAIRE ÉVOLUER LA COMMANDE
    // ==========================================

    const faireEvoluerCommande = async (commande) => {

        const prochainStatut =
            getStatutSuivant(commande);

        if (!prochainStatut) {
            return;
        }

        const confirmation =
            window.confirm(
                `Voulez-vous ${getActionLabel(commande)?.toLowerCase()} pour la commande ${commande.numero_commande} ?`
            );

        if (!confirmation) {
            return;
        }

        await changerStatut(
            commande.id,
            prochainStatut
        );
    };


    // ==========================================
    // CHARGER LES LIVREURS DISPONIBLES
    // ==========================================

    const chargerLivreursDisponibles = async () => {

        try {

            setChargementLivreurs(true);

            const response =
                await axios.get(
                    `${API_URL}/livreurs/disponibles`
                );

            if (response.data.success) {

                setLivreursDisponibles(
                    response.data.data
                );

            } else {

                setLivreursDisponibles([]);
            }

        } catch (error) {

            console.error(
                "Erreur chargement livreurs :",
                error
            );

            alert(
                error.response?.data?.message ||
                "Impossible de charger les livreurs disponibles"
            );

            setLivreursDisponibles([]);

        } finally {

            setChargementLivreurs(false);
        }
    };


    // ==========================================
    // OUVRIR LA FENÊTRE D'ATTRIBUTION
    // ==========================================

    const ouvrirAttributionLivreur = async (commande) => {

        setCommandeSelectionnee(commande);

        setLivreurSelectionne(null);

        setAfficherLivreurs(true);

        await chargerLivreursDisponibles();
    };


    // ==========================================
    // ASSIGNER LE LIVREUR
    // ==========================================

    const assignerLivreur = async () => {
    if (!commandeSelectionnee) {
        alert("Aucune commande sélectionnée");
        return;
    }

    if (!livreurSelectionne) {
        alert("Veuillez sélectionner un livreur");
        return;
    }

    console.log("COMMANDE :", commandeSelectionnee);
    console.log("LIVREUR :", livreurSelectionne);
    console.log(
        "URL :",
        `/commandes/${commandeSelectionnee.id}/assigner-livreur`
    );

    try {
        setAssignationEnCours(true);

        const response = await api.patch(
            `/commandes/${commandeSelectionnee.id}/assigner-livreur`,
            {
                livreur_id: Number(livreurSelectionne.id)
            }
        );

        console.log("RÉPONSE ATTRIBUTION :", response.data);

        alert("Livreur assigné avec succès !");

        setAfficherLivreurs(false);
        setLivreurSelectionne(null);
        setCommandeSelectionnee(null);

        chargerCommandes();
    } catch (error) {
        console.error("ERREUR ATTRIBUTION :", error);
        console.error("RÉPONSE SERVEUR :", error.response?.data);
        console.error("STATUS HTTP :", error.response?.status);

        alert(
            error.response?.data?.message ||
            "Erreur lors de l'attribution du livreur"
        );
    } finally {
        setAssignationEnCours(false);
    }
};

// ==========================================
// RÉASSIGNER UN LIVREUR APRÈS UN REFUS
// ==========================================
const reassignerLivreur = async () => {

    if (!commandeSelectionnee) {
        alert("Aucune commande sélectionnée");
        return;
    }

    if (!livreurSelectionne) {
        alert("Veuillez sélectionner un nouveau livreur");
        return;
    }

    try {

        setAssignationEnCours(true);

        const response = await api.patch(
            `/commandes/${commandeSelectionnee.id}/reassigner-livreur`,
            {
                livreur_id: Number(livreurSelectionne.id)
            }
        );

        console.log(
            "RÉPONSE RÉASSIGNATION :",
            response.data
        );

        alert(
            "Nouveau livreur assigné avec succès !"
        );

        setAfficherLivreurs(false);
        setLivreurSelectionne(null);
        setCommandeSelectionnee(null);

        await chargerCommandes();

    } catch (error) {

        console.error(
            "ERREUR RÉASSIGNATION :",
            error
        );

        console.error(
            "RÉPONSE SERVEUR :",
            error.response?.data
        );

        alert(
            error.response?.data?.message ||
            "Erreur lors de la réassignation du livreur"
        );

    } finally {

        setAssignationEnCours(false);
    }
};


    // ==========================================
    // FILTRAGE
    // ==========================================

    const commandesFiltrees =
        filtre === "tous"
            ? commandes
            : commandes.filter(
                (commande) =>
                    commande.statut === filtre
            );


    // ==========================================
    // RENDU
    // ==========================================

    return (

        <div className="container-fluid py-4">

            {/* ==========================================
                TITRE
            ========================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        Commandes
                    </h2>

                    <p className="text-muted mb-0">
                        Gestion des commandes clients
                    </p>

                </div>

                <button
                    className="btn btn-outline-primary"
                    onClick={chargerCommandes}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Actualiser
                </button>

            </div>


            {/* ==========================================
                FILTRES
            ========================================== */}

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex flex-wrap gap-2">

                        <button
                            className={
                                `btn ${
                                    filtre === "tous"
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                }`
                            }
                            onClick={() =>
                                setFiltre("tous")
                            }
                        >
                            Toutes
                        </button>


                        <button
                            className={
                                `btn ${
                                    filtre === "en_attente"
                                        ? "btn-warning"
                                        : "btn-outline-warning"
                                }`
                            }
                            onClick={() =>
                                setFiltre("en_attente")
                            }
                        >
                            En attente
                        </button>


                        <button
                            className={
                                `btn ${
                                    filtre === "approuvee"
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                }`
                            }
                            onClick={() =>
                                setFiltre("approuvee")
                            }
                        >
                            Approuvées
                        </button>


                        <button
                            className={
                                `btn ${
                                    filtre === "livreur_assigne"
                                        ? "btn-info"
                                        : "btn-outline-info"
                                }`
                            }
                            onClick={() =>
                                setFiltre("livreur_assigne")
                            }
                        >
                            Livreur assigné
                        </button>


                        <button
                            className={
                                `btn ${
                                    filtre === "en_preparation"
                                        ? "btn-secondary"
                                        : "btn-outline-secondary"
                                }`
                            }
                            onClick={() =>
                                setFiltre("en_preparation")
                            }
                        >
                            Préparation
                        </button>


                        <button
                            className={
                                `btn ${
                                    filtre === "prete"
                                        ? "btn-success"
                                        : "btn-outline-success"
                                }`
                            }
                            onClick={() =>
                                setFiltre("prete")
                            }
                        >
                            Prêtes
                        </button>


                        <button
                            className={
                                `btn ${
                                    filtre === "en_livraison"
                                        ? "btn-dark"
                                        : "btn-outline-dark"
                                }`
                            }
                            onClick={() =>
                                setFiltre("en_livraison")
                            }
                        >
                            En livraison
                        </button>


                        <button
                            className={
                                `btn ${
                                    filtre === "livree"
                                        ? "btn-success"
                                        : "btn-outline-success"
                                }`
                            }
                            onClick={() =>
                                setFiltre("livree")
                            }
                        >
                            Livrées
                        </button>

                    </div>

                </div>

            </div>


            {/* ==========================================
                TABLEAU
            ========================================== */}

            <div className="card shadow-sm">

                <div className="card-body p-0">

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <p className="mt-3 text-muted">
                                Chargement des commandes...
                            </p>

                        </div>

                    ) : commandesFiltrees.length === 0 ? (

                        <div className="text-center py-5">

                            <i className="bi bi-inbox fs-1 text-muted"></i>

                            <p className="mt-3 text-muted">
                                Aucune commande trouvée.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>

                                        <th>
                                            N°
                                        </th>

                                        <th>
                                            Client
                                        </th>

                                        <th>
                                            Téléphone
                                        </th>

                                        <th>
                                            Total
                                        </th>

                                        <th>
                                            Livreur
                                        </th>

                                        <th>
                                            Statut
                                        </th>

                                        <th className="text-end">
                                            Actions
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {commandesFiltrees.map(
                                        (commande) => (

                                            <tr
                                                key={commande.id}
                                            >

                                                {/* NUMÉRO */}

                                                <td>

                                                    <strong>
                                                        {
                                                            commande.numero_commande
                                                        }
                                                    </strong>

                                                </td>


                                                {/* CLIENT */}

                                                <td>
                                                    {
                                                        commande.client_nom
                                                    }
                                                </td>


                                                {/* TELEPHONE */}

                                                <td>
                                                    {
                                                        commande.client_telephone
                                                    }
                                                </td>


                                                {/* TOTAL */}

                                                <td>

                                                    <strong>
                                                        {Number(
                                                            commande.total_commande
                                                        ).toLocaleString()}{" "}
                                                        BIF
                                                    </strong>

                                                </td>


                                                {/* LIVREUR */}

                                                <td>

                                                    {commande.livreur_nom ? (

                                                        <div>

                                                            <strong>
                                                                {
                                                                    commande.livreur_nom
                                                                }
                                                            </strong>

                                                            <br />

                                                            <small className="text-muted">

                                                                {
                                                                    commande.livreur_telephone
                                                                    ||
                                                                    commande.livreur_telephone_user
                                                                }

                                                            </small>

                                                        </div>

                                                    ) : (

                                                        <span className="text-muted">
                                                            Aucun
                                                        </span>

                                                    )}

                                                </td>


                                                {/* STATUT */}

                                                <td>

                                                    <span
                                                        className={
                                                            `badge ${getStatutClass(
                                                                commande.statut
                                                            )}`
                                                        }
                                                    >
                                                        {
                                                            getStatutLabel(
                                                                commande.statut
                                                            )
                                                        }
                                                    </span>
                                                    {commande.statut === "livreur_assigne" &&
                                                    commande.livraison_statut === "attribuee" && (

                                                    <div className="mt-2">
                                                        <span className="badge bg-warning text-dark">
                                                            <i className="bi bi-hourglass-split me-1"></i>
                                                            En attente de réponse du livreur
                                                        </span>
                                                    </div>
                                                )}

                                                {commande.statut === "livreur_assigne" &&
                                                    commande.livraison_statut === "prise_en_charge" && (

                                                    <div className="mt-2">
                                                        <span className="badge bg-success">
                                                            <i className="bi bi-check-circle me-1"></i>
                                                            Livreur accepté
                                                        </span>
                                                    </div>
                                                )}

                                                {commande.livraison_statut === "annulee" && (

                                                    <div className="mt-2">
                                                        <span className="badge bg-danger">
                                                            <i className="bi bi-x-circle me-1"></i>
                                                            Livreur a refusé
                                                        </span>
                                                    </div>
                                                )}

                                                </td>


                                                {/* ACTIONS */}

                                                <td className="text-end">

                                                    <div className="d-flex justify-content-end gap-2 flex-wrap">

                                                        {/* VOIR */}

                                                        <button
                                                            className="btn btn-sm btn-outline-secondary"
                                                            onClick={() =>
                                                                voirCommande(
                                                                    commande
                                                                )
                                                            }
                                                        >
                                                            <i className="bi bi-eye"></i>
                                                        </button>


                                                        {/* APPROUVER */}

                                                        {commande.statut ===
                                                            "en_attente" && (

                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() =>
                                                                    approuverCommande(
                                                                        commande
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-check-lg me-1"></i>
                                                                Approuver
                                                            </button>

                                                        )}


                                                        {/* REFUSER */}

                                                        {commande.statut ===
                                                            "en_attente" && (

                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() =>
                                                                    refuserCommande(
                                                                        commande
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-x-lg me-1"></i>
                                                                Refuser
                                                            </button>

                                                        )}


                                                        {/* ASSIGNER LIVREUR */}

                                                        {commande.statut ===
                                                            "approuvee" && (

                                                            <button
                                                                className="btn btn-sm btn-info"
                                                                onClick={() =>
                                                                    ouvrirAttributionLivreur(
                                                                        commande
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-person-plus me-1"></i>
                                                                Assigner un livreur
                                                            </button>

                                                        )}

                                                        {/* RÉASSIGNER UN LIVREUR APRÈS REFUS */}

{commande.livraison_statut === "annulee" && (

    <button
        className="btn btn-sm btn-warning"
        onClick={() =>
            ouvrirAttributionLivreur(commande)
        }
    >
        <i className="bi bi-arrow-repeat me-1"></i>
        Choisir un autre livreur
    </button>

)}
                                                        
                                                        


                                                        {/* ACTIONS SUIVANTES */}

                                                        {getStatutSuivant(
                                                            commande
                                                        ) && (

                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() =>
                                                                    faireEvoluerCommande(
                                                                        commande
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    getActionLabel(
                                                                        commande
                                                                    )
                                                                }
                                                            </button>

                                                        )}


                                                        {/* EN LIVRAISON */}

                                                        {commande.statut ===
                                                            "en_livraison" && (

                                                            <span className="badge bg-dark p-2">

                                                                <i className="bi bi-hourglass-split me-1"></i>

                                                                En attente de confirmation client

                                                            </span>

                                                        )}


                                                        {/* LIVREE */}

                                                        {commande.statut ===
                                                            "livree" && (

                                                            <span className="badge bg-success p-2">

                                                                <i className="bi bi-check-circle me-1"></i>

                                                                Reçue

                                                            </span>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* ==========================================
                MODAL DÉTAILS COMMANDE
            ========================================== */}

            {commandeSelectionnee && !afficherLivreurs && (

                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)"
                    }}
                >

                    <div className="modal-dialog modal-xl modal-dialog-scrollable">

                        <div className="modal-content">

                            <div className="modal-header">

                                <div>

                                    <h5 className="modal-title fw-bold">

                                        Commande{" "}

                                        {
                                            commandeSelectionnee.numero_commande
                                        }

                                    </h5>

                                    <span
                                        className={
                                            `badge mt-2 ${getStatutClass(
                                                commandeSelectionnee.statut
                                            )}`
                                        }
                                    >
                                        {
                                            getStatutLabel(
                                                commandeSelectionnee.statut
                                            )
                                        }
                                    </span>

                                </div>


                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() =>
                                        setCommandeSelectionnee(
                                            null
                                        )
                                    }
                                ></button>

                            </div>


                            <div className="modal-body">

                                {/* ==========================================
                                    INFORMATIONS CLIENT
                                ========================================== */}

                                <div className="card mb-4">

                                    <div className="card-header fw-bold">

                                        <i className="bi bi-person me-2"></i>

                                        Informations client

                                    </div>

                                    <div className="card-body">

                                        <div className="row">

                                            <div className="col-md-4">

                                                <strong>
                                                    Nom
                                                </strong>

                                                <div>
                                                    {
                                                        commandeSelectionnee.client_nom
                                                    }
                                                </div>

                                            </div>


                                            <div className="col-md-4">

                                                <strong>
                                                    Téléphone
                                                </strong>

                                                <div>
                                                    {
                                                        commandeSelectionnee.client_telephone
                                                    }
                                                </div>

                                            </div>


                                            <div className="col-md-4">

                                                <strong>
                                                    Adresse
                                                </strong>

                                                <div>
                                                    {
                                                        commandeSelectionnee.adresse
                                                    }
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* ==========================================
                                    LIVREUR
                                ========================================== */}

                                {commandeSelectionnee.livreur_nom && (

                                    <div className="alert alert-info">

                                        <div className="d-flex align-items-center">

                                            <i className="bi bi-person-badge fs-3 me-3"></i>

                                            <div>

                                                <strong>
                                                    Livreur assigné
                                                </strong>

                                                <div>

                                                    {
                                                        commandeSelectionnee.livreur_nom
                                                    }

                                                    {" — "}

                                                    {
                                                        commandeSelectionnee.livreur_telephone
                                                        ||
                                                        commandeSelectionnee.livreur_telephone_user
                                                    }

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                )}


                                {/* ==========================================
                                    PROGRESSION
                                ========================================== */}

                                <div className="card mb-4">

                                    <div className="card-header fw-bold">

                                        <i className="bi bi-arrow-right-circle me-2"></i>

                                        Progression

                                    </div>

                                    <div className="card-body">

                                        <div className="d-flex flex-wrap gap-2">
 
                                              <span
                                                className={`badge p-2 ${getStatutClass(
                                                    commandeSelectionnee.statut
                                                )}`}
                                            >
                                                {getStatutLabel(
                                                    commandeSelectionnee.statut
                                                )}
                                            </span>

                                            {commandeSelectionnee.statut === "livreur_assigne" &&
                                                commandeSelectionnee.livraison_statut === "attribuee" && (

                                                <div className="alert alert-warning mt-3 mb-0">
                                                    <i className="bi bi-hourglass-split me-2"></i>

                                                    <strong>
                                                        En attente de réponse du livreur.
                                                    </strong>

                                                    <div className="mt-1">
                                                        Le livreur doit accepter ou refuser
                                                        la livraison avant que la préparation
                                                        puisse commencer.
                                                    </div>
                                                </div>
                                            )}

                                            {commandeSelectionnee.statut === "livreur_assigne" &&
                                                commandeSelectionnee.livraison_statut === "prise_en_charge" && (

                                                <div className="alert alert-success mt-3 mb-0">
                                                    <i className="bi bi-check-circle me-2"></i>

                                                    <strong>
                                                        Le livreur a accepté la livraison.
                                                    </strong>

                                                    <div className="mt-1">
                                                        La commande peut maintenant passer
                                                        en préparation.
                                                    </div>
                                                </div>
                                            )}

                                            {commandeSelectionnee.livraison_statut === "annulee" && (

                                                <div className="alert alert-danger mt-3 mb-0">

                                                    <div>
                                                        <i className="bi bi-x-circle me-2"></i>

                                                        <strong>
                                                            Le livreur a refusé la livraison.
                                                        </strong>
                                                    </div>

                                                    {commandeSelectionnee.livraison_motif_refus && (
                                                        <div className="mt-2">
                                                            <strong>Motif :</strong>{" "}
                                                            {commandeSelectionnee.livraison_motif_refus}
                                                        </div>
                                                    )}

                                                </div>
                                            )}


                                            {commandeSelectionnee.statut ===
                                                "en_attente" && (

                                                <>

                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() =>
                                                            approuverCommande(
                                                                commandeSelectionnee
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-check-lg me-1"></i>
                                                        Approuver
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            refuserCommande(
                                                                commandeSelectionnee
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-x-lg me-1"></i>
                                                        Refuser
                                                    </button>

                                                </>

                                            )}


                                            {commandeSelectionnee.statut ===
                                                "approuvee" && (

                                                <button
                                                    className="btn btn-sm btn-info"
                                                    onClick={() =>
                                                        ouvrirAttributionLivreur(
                                                            commandeSelectionnee
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-person-plus me-1"></i>
                                                    Assigner un livreur
                                                </button>

                                            )}
                                            {commandeSelectionnee.livraison_statut === "annulee" && (

                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() =>
                                                    ouvrirAttributionLivreur(
                                                        commandeSelectionnee
                                                    )
                                                }
                                            >
                                                <i className="bi bi-arrow-repeat me-1"></i>
                                                Choisir un autre livreur
                                            </button>

                                        )}


                                            {getStatutSuivant(
                                                commandeSelectionnee) && (

                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() =>
                                                        faireEvoluerCommande(
                                                            commandeSelectionnee
                                                        )
                                                    }
                                                >
                                                    {
                                                        getActionLabel(
                                                            commandeSelectionnee
                                                        )
                                                    }
                                                </button>

                                            )}


                                            {commandeSelectionnee.statut ===
                                                "en_livraison" && (

                                                <div className="alert alert-dark mb-0">

                                                    <i className="bi bi-hourglass-split me-2"></i>

                                                    En attente de confirmation
                                                    de réception par le client.

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </div>


                                {/* ==========================================
                                    ARTICLES
                                ========================================== */}

                                <div className="card mb-4">

                                    <div className="card-header fw-bold">

                                        <i className="bi bi-basket me-2"></i>

                                        Articles commandés

                                    </div>

                                    <div className="card-body p-0">

                                        {chargementDetails ? (

                                            <div className="text-center py-4">

                                                <div
                                                    className="spinner-border text-primary"
                                                    role="status"
                                                ></div>

                                            </div>

                                        ) : detailsCommande.length === 0 ? (

                                            <div className="text-center py-4 text-muted">

                                                Aucun article.

                                            </div>

                                        ) : (

                                            <div className="table-responsive">

                                                <table className="table align-middle mb-0">

                                                    <thead>

                                                        <tr>

                                                            <th>
                                                                Plat
                                                            </th>

                                                            <th>
                                                                Prix unitaire
                                                            </th>

                                                            <th>
                                                                Quantité
                                                            </th>

                                                            <th>
                                                                Sous-total
                                                            </th>

                                                        </tr>

                                                    </thead>


                                                    <tbody>

                                                        {detailsCommande.map(
                                                            (detail) => (

                                                                <tr
                                                                    key={
                                                                        detail.id ||
                                                                        `${detail.commande_id}-${detail.plat_id}`
                                                                    }
                                                                >

                                                                    <td>

                                                                        <div className="d-flex align-items-center">

                                                                            {getImageUrl(
                                                                                detail.plat_image
                                                                            ) && (

                                                                                <img
                                                                                    src={getImageUrl(
                                                                                        detail.plat_image
                                                                                    )}
                                                                                    alt={
                                                                                        detail.plat_nom ||
                                                                                        "Plat"
                                                                                    }
                                                                                    style={{
                                                                                        width: "60px",
                                                                                        height: "60px",
                                                                                        objectFit: "cover",
                                                                                        borderRadius: "8px"
                                                                                    }}
                                                                                    className="me-3"
                                                                                />

                                                                            )}

                                                                            <strong>

                                                                                {
                                                                                    detail.plat_nom ||
                                                                                    detail.nom ||
                                                                                    "Plat"
                                                                                }

                                                                            </strong>

                                                                        </div>

                                                                    </td>


                                                                    <td>

                                                                        {Number(
                                                                            detail.prix_unitaire
                                                                        ).toLocaleString()}{" "}
                                                                        BIF

                                                                    </td>


                                                                    <td>

                                                                        {
                                                                            detail.quantite
                                                                        }

                                                                    </td>


                                                                    <td>

                                                                        <strong>

                                                                            {Number(
                                                                                detail.sous_total
                                                                            ).toLocaleString()}{" "}
                                                                            BIF

                                                                        </strong>

                                                                    </td>

                                                                </tr>

                                                            )
                                                        )}

                                                    </tbody>

                                                </table>

                                            </div>

                                        )}

                                    </div>

                                </div>


                                {/* ==========================================
                                    TOTALS
                                ========================================== */}

                                <div className="card mb-4">

                                    <div className="card-header fw-bold">

                                        <i className="bi bi-receipt me-2"></i>

                                        Résumé

                                    </div>

                                    <div className="card-body">

                                        <div className="row">

                                            <div className="col-md-4">

                                                <div className="text-muted">
                                                    Total plats
                                                </div>

                                                <strong>
                                                    {Number(
                                                        commandeSelectionnee.total_plats
                                                    ).toLocaleString()}{" "}
                                                    BIF
                                                </strong>

                                            </div>


                                            <div className="col-md-4">

                                                <div className="text-muted">
                                                    Frais de livraison
                                                </div>

                                                <strong>
                                                    {Number(
                                                        commandeSelectionnee.frais_livraison
                                                    ).toLocaleString()}{" "}
                                                    BIF
                                                </strong>

                                            </div>


                                            <div className="col-md-4">

                                                <div className="text-muted">
                                                    Total commande
                                                </div>

                                                <strong className="fs-5">
                                                    {Number(
                                                        commandeSelectionnee.total_commande
                                                    ).toLocaleString()}{" "}
                                                    BIF
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* ==========================================
                                    GPS
                                ========================================== */}

                                <div className="card">

                                    <div className="card-header fw-bold">

                                        <i className="bi bi-geo-alt me-2"></i>

                                        Localisation

                                    </div>

                                    <div className="card-body">

                                        <div className="row">

                                            <div className="col-md-6">

                                                <strong>
                                                    Latitude
                                                </strong>

                                                <div>
                                                    {
                                                        commandeSelectionnee.latitude
                                                    }
                                                </div>

                                            </div>


                                            <div className="col-md-6">

                                                <strong>
                                                    Longitude
                                                </strong>

                                                <div>
                                                    {
                                                        commandeSelectionnee.longitude
                                                    }
                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>


                                {/* ==========================================
                                    MOTIF REFUS
                                ========================================== */}

                                {commandeSelectionnee.motif_refus && (

                                    <div className="alert alert-danger mt-4">

                                        <strong>
                                            Motif du refus :
                                        </strong>

                                        <div>
                                            {
                                                commandeSelectionnee.motif_refus
                                            }
                                        </div>

                                    </div>

                                )}

                            </div>


                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        setCommandeSelectionnee(
                                            null
                                        )
                                    }
                                >
                                    Fermer
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}


            {/* ==========================================
                MODAL LIVREURS DISPONIBLES
            ========================================== */}

            {afficherLivreurs && commandeSelectionnee && (

                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor:
                            "rgba(0,0,0,0.5)"
                    }}
                >

                    <div className="modal-dialog modal-lg modal-dialog-centered">

                        <div className="modal-content">

                            <div className="modal-header">

                                <div>

                                    <h5 className="modal-title fw-bold">

                                        {commandeSelectionnee.livraison_statut === "annulee"
                                            ? "Choisir un autre livreur"
                                            : "Assigner un livreur"}

                                    </h5>
                                    {commandeSelectionnee.livraison_statut === "annulee" &&
                                    commandeSelectionnee.livraison_motif_refus && (

                                    <div className="alert alert-danger mt-3 mb-0">

                                        <i className="bi bi-exclamation-triangle me-2"></i>

                                        <strong>Refus du précédent livreur :</strong>

                                        <div className="mt-1">
                                            {commandeSelectionnee.livraison_motif_refus}
                                        </div>

                                    </div>
                                )}

                                    <small className="text-muted">

                                        Commande{" "}

                                        <strong>
                                            {
                                                commandeSelectionnee.numero_commande
                                            }
                                        </strong>

                                    </small>

                                </div>


                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {

                                        if (!assignationEnCours) {

                                            setAfficherLivreurs(
                                                false
                                            );

                                        }

                                    }}
                                ></button>

                            </div>


                            <div className="modal-body">

                                {chargementLivreurs ? (

                                    <div className="text-center py-5">

                                        <div
                                            className="spinner-border text-primary"
                                            role="status"
                                        ></div>

                                        <p className="mt-3 text-muted">

                                            Recherche des livreurs
                                            disponibles...

                                        </p>

                                    </div>

                                ) : livreursDisponibles.length === 0 ? (

                                    <div className="text-center py-5">

                                        <i className="bi bi-person-x fs-1 text-muted"></i>

                                        <h5 className="mt-3">

                                            Aucun livreur disponible

                                        </h5>

                                        <p className="text-muted">

                                            Tous les livreurs sont actuellement
                                            occupés ou indisponibles.

                                        </p>


                                        <button
                                            className="btn btn-outline-primary"
                                            onClick={
                                                chargerLivreursDisponibles
                                            }
                                        >

                                            <i className="bi bi-arrow-clockwise me-2"></i>

                                            Actualiser

                                        </button>

                                    </div>

                                ) : (

                                    <div>

                                        <p className="text-muted">

                                            Sélectionnez le livreur qui
                                            prendra cette commande.

                                        </p>


                                        <div className="row g-3">

                                            {livreursDisponibles.map(
                                                (livreur) => (

                                                    <div
                                                        className="col-md-6"
                                                        key={
                                                            livreur.id
                                                        }
                                                    >

                                                        <button
                                                            type="button"
                                                            className={
                                                                `card w-100 text-start ${
                                                                    livreurSelectionne?.id ===
                                                                    livreur.id
                                                                        ? "border-primary shadow"
                                                                        : ""
                                                                }`
                                                            }
                                                            onClick={() =>
                                                                setLivreurSelectionne(
                                                                    livreur
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer"
                                                            }}
                                                        >

                                                            <div className="card-body">

                                                                <div className="d-flex align-items-center">

                                                                    <div
                                                                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                        style={{
                                                                            width: "50px",
                                                                            height: "50px"
                                                                        }}
                                                                    >

                                                                        <i className="bi bi-person-badge fs-4"></i>

                                                                    </div>


                                                                    <div>

                                                                        <h6 className="mb-1 fw-bold">

                                                                            {
                                                                                livreur.nom
                                                                            }

                                                                        </h6>

                                                                        <div className="text-muted">

                                                                            <i className="bi bi-telephone me-1"></i>

                                                                            {
                                                                                livreur.telephone_livreur
                                                                                ||
                                                                                livreur.telephone_user
                                                                            }

                                                                        </div>

                                                                        {livreur.numero_piece && (

                                                                            <small className="text-muted">

                                                                                Pièce :{" "}

                                                                                {
                                                                                    livreur.numero_piece
                                                                                }

                                                                            </small>

                                                                        )}

                                                                    </div>


                                                                    {livreurSelectionne?.id ===
                                                                        livreur.id && (

                                                                        <div className="ms-auto">

                                                                            <i className="bi bi-check-circle-fill text-primary fs-4"></i>

                                                                        </div>

                                                                    )}

                                                                </div>

                                                            </div>

                                                        </button>

                                                    </div>

                                                )
                                            )}

                                        </div>


                                        {livreurSelectionne && (

                                            <div className="alert alert-primary mt-4 mb-0">

                                                <i className="bi bi-person-check me-2"></i>

                                                <strong>
                                                    Livreur sélectionné :
                                                </strong>{" "}

                                                {
                                                    livreurSelectionne.nom
                                                }

                                            </div>

                                        )}

                                    </div>

                                )}

                            </div>


                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    disabled={
                                        assignationEnCours
                                    }
                                    onClick={() => {

                                        setAfficherLivreurs(
                                            false
                                        );

                                        setLivreurSelectionne(
                                            null
                                        );

                                    }}
                                >
                                    Annuler
                                </button>


                                {livreursDisponibles.length > 0 && (

                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={
                                            !livreurSelectionne ||
                                            assignationEnCours
                                        }
                                        onClick={
                                        commandeSelectionnee.livraison_statut === "annulee"
                                            ? reassignerLivreur
                                            : assignerLivreur
                                    }
                                    >

                                    {assignationEnCours ? (

                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                        ></span>

                                        Attribution...

                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-person-check me-2"></i>

                                        {commandeSelectionnee.livraison_statut === "annulee"
                                            ? "Réassigner le livreur"
                                            : "Assigner le livreur"}

                                    </>

                                )}

                                    </button>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Commandes;