import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DashboardLivreur() {
    const navigate = useNavigate();

    const [livraisons, setLivraisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [filtre, setFiltre] = useState("toutes");

    // ==========================================
    // RÉCUPÉRER LE LIVREUR CONNECTÉ
    // ==========================================

    const livreurConnecte = JSON.parse(
        localStorage.getItem("livreurConnecte") ||
        localStorage.getItem("user") ||
        "null"
    );

    const livreurId =
        livreurConnecte?.livreur_id ||
        livreurConnecte?.livreurId ||
        livreurConnecte?.id_livreur ||
        livreurConnecte?.livreur?.id ||
        livreurConnecte?.id;

    const API_URL = "http://localhost:5000/api";

    // ==========================================
    // CHARGER LES LIVRAISONS
    // ==========================================

    const chargerLivraisons = async () => {
        if (!livreurId) {
            setErreur("Impossible de trouver l'identifiant du livreur.");
            setLivraisons([]);
            setLoading(false);
            return;
        }

        try {
            setErreur("");

            const response = await axios.get(
                `${API_URL}/livraisons/livreur/${livreurId}`
            );

            console.log(
                "Réponse livraisons livreur :",
                response.data
            );

            /*
             * Le backend peut retourner :
             *
             * 1. directement un tableau :
             *    [...]
             *
             * 2. { livraisons: [...] }
             *
             * 3. { data: [...] }
             *
             * 4. { success: true, data: [...] }
             *
             * On récupère donc le tableau correctement.
             */

            let donnees = [];

            if (Array.isArray(response.data)) {
                donnees = response.data;
            } else if (Array.isArray(response.data?.livraisons)) {
                donnees = response.data.livraisons;
            } else if (Array.isArray(response.data?.data)) {
                donnees = response.data.data;
            } else if (
                Array.isArray(response.data?.result)
            ) {
                donnees = response.data.result;
            }

            setLivraisons(donnees);

        } catch (error) {
            console.error(
                "Erreur chargement livraisons :",
                error
            );

            setLivraisons([]);

            setErreur(
                error.response?.data?.message ||
                "Impossible de charger les livraisons."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // CHARGEMENT INITIAL + ACTUALISATION
    // ==========================================

    useEffect(() => {
        chargerLivraisons();

        const interval = setInterval(() => {
            chargerLivraisons();
        }, 10000);

        return () => clearInterval(interval);
    }, [livreurId]);

    // ==========================================
    // STATUT DE LA LIVRAISON
    // ==========================================

    const getStatut = (livraison) => {
        if (livraison.statut === "attribuee") {
            return {
                label: "En attente",
                couleur: "warning",
                icone: "⏳"
            };
        }

        if (livraison.statut === "prise_en_charge") {
            return {
                label: "Acceptée",
                couleur: "primary",
                icone: "🤝"
            };
        }

        if (livraison.statut === "en_livraison") {
            return {
                label: "En livraison",
                couleur: "info",
                icone: "🚚"
            };
        }

        if (livraison.statut === "livree") {
            return {
                label: "Livrée",
                couleur: "success",
                icone: "✅"
            };
        }

        if (livraison.statut === "annulee") {
            return {
                label: "Refusée",
                couleur: "danger",
                icone: "❌"
            };
        }

        return {
            label: livraison.statut || "Inconnu",
            couleur: "secondary",
            icone: "📦"
        };
    };

    // ==========================================
    // STATISTIQUES
    // ==========================================

    const statistiques = useMemo(() => {
        const liste = Array.isArray(livraisons)
            ? livraisons
            : [];

        const actives = liste.filter(
            (livraison) =>
                [
                    "attribuee",
                    "prise_en_charge",
                    "en_livraison"
                ].includes(livraison.statut)
        );

        const attente = liste.filter(
            (livraison) =>
                livraison.statut === "attribuee"
        );

        const acceptees = liste.filter(
            (livraison) =>
                livraison.statut === "prise_en_charge"
        );

        const enLivraison = liste.filter(
            (livraison) =>
                livraison.statut === "en_livraison"
        );

        const livrees = liste.filter(
            (livraison) =>
                livraison.statut === "livree"
        );

        const refusees = liste.filter(
            (livraison) =>
                livraison.statut === "annulee"
        );

        const commandesPretes = liste.filter(
            (livraison) =>
                livraison.commande_statut === "prete" &&
                livraison.statut === "prise_en_charge"
        );

        const totalFrais = livrees.reduce(
            (total, livraison) =>
                total +
                Number(
                    livraison.frais_livraison || 0
                ),
            0
        );

        return {
            actives: actives.length,
            attente: attente.length,
            acceptees: acceptees.length,
            enLivraison: enLivraison.length,
            livrees: livrees.length,
            refusees: refusees.length,
            commandesPretes: commandesPretes.length,
            totalFrais
        };
    }, [livraisons]);

    // ==========================================
    // FILTRER LES LIVRAISONS
    // ==========================================

    const livraisonsFiltrees = useMemo(() => {
        const liste = Array.isArray(livraisons)
            ? livraisons
            : [];

        switch (filtre) {
            case "attente":
                return liste.filter(
                    (livraison) =>
                        livraison.statut === "attribuee"
                );

            case "acceptees":
                return liste.filter(
                    (livraison) =>
                        livraison.statut === "prise_en_charge"
                );

            case "en_livraison":
                return liste.filter(
                    (livraison) =>
                        livraison.statut === "en_livraison"
                );

            case "livrees":
                return liste.filter(
                    (livraison) =>
                        livraison.statut === "livree"
                );

            case "refusees":
                return liste.filter(
                    (livraison) =>
                        livraison.statut === "annulee"
                );

            case "toutes":
            default:
                return liste;
        }
    }, [livraisons, filtre]);

    // ==========================================
    // FILTRES
    // ==========================================

    const filtres = [
        {
            id: "toutes",
            label: "📦 Toutes",
            nombre: Array.isArray(livraisons)
                ? livraisons.length
                : 0
        },
        {
            id: "attente",
            label: "⏳ En attente",
            nombre: statistiques.attente
        },
        {
            id: "acceptees",
            label: "🤝 Acceptées",
            nombre: statistiques.acceptees
        },
        {
            id: "en_livraison",
            label: "🚚 En livraison",
            nombre: statistiques.enLivraison
        },
        {
            id: "livrees",
            label: "✅ Livrées",
            nombre: statistiques.livrees
        },
        {
            id: "refusees",
            label: "❌ Refusées",
            nombre: statistiques.refusees
        }
    ];

    // ==========================================
    // FORMATAGE DU MONTANT
    // ==========================================

    const formaterMontant = (montant) => {
        return Number(montant || 0).toLocaleString("fr-FR");
    };

    // ==========================================
    // DÉCONNEXION
    // ==========================================

    const deconnexion = () => {
        localStorage.removeItem("livreurConnecte");
        localStorage.removeItem("user");

        navigate("/login");
    };

    // ==========================================
    // AFFICHAGE CHARGEMENT
    // ==========================================

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div
                    className="spinner-border text-primary"
                    role="status"
                ></div>

                <p className="mt-3">
                    Chargement de votre espace livreur...
                </p>
            </div>
        );
    }

    return (
        <div className="container-fluid bg-light min-vh-100 py-4">

            <div className="container">

                {/* ==========================================
                    EN-TÊTE
                ========================================== */}

                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

                    <div>
                        <h2 className="fw-bold mb-1">
                            🚚 Espace Livreur
                        </h2>

                        <p className="text-muted mb-0">
                            Bonjour{" "}
                            <strong>
                                {livreurConnecte?.nom ||
                                    livreurConnecte?.user?.nom ||
                                    "Livreur"}
                            </strong>
                            , gérez vos livraisons
                        </p>
                    </div>

                    <div className="d-flex gap-2">

                        <button
                            className="btn btn-outline-primary"
                            onClick={chargerLivraisons}
                        >
                            🔄 Actualiser
                        </button>

                        <button
                            className="btn btn-outline-dark"
                            onClick={deconnexion}
                        >
                            🚪 Déconnexion
                        </button>

                    </div>

                </div>

                {/* ==========================================
                    ERREUR
                ========================================== */}

                {erreur && (
                    <div className="alert alert-danger">
                        <strong>Erreur :</strong> {erreur}
                    </div>
                )}

                {/* ==========================================
                    ALERTE COMMANDES PRÊTES
                ========================================== */}

                {statistiques.commandesPretes > 0 && (
                    <div className="alert alert-success shadow-sm">
                        <strong>📢 Attention :</strong>{" "}
                        {statistiques.commandesPretes} commande(s)
                        acceptée(s) sont prêtes.

                        <br />

                        <small>
                            Attendez que l'administration passe la
                            commande en livraison avant de partir
                            chez le client.
                        </small>
                    </div>
                )}

                {/* ==========================================
                    STATISTIQUES PRINCIPALES
                ========================================== */}

                <div className="row g-3 mb-4">

                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">

                                <div className="fs-2">
                                    📦
                                </div>

                                <h3 className="fw-bold">
                                    {statistiques.actives}
                                </h3>

                                <p className="text-muted mb-0">
                                    Livraisons actives
                                </p>

                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">

                                <div className="fs-2">
                                    ⏳
                                </div>

                                <h3 className="fw-bold">
                                    {statistiques.attente}
                                </h3>

                                <p className="text-muted mb-0">
                                    En attente de réponse
                                </p>

                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">

                                <div className="fs-2">
                                    🚚
                                </div>

                                <h3 className="fw-bold">
                                    {statistiques.enLivraison}
                                </h3>

                                <p className="text-muted mb-0">
                                    En livraison
                                </p>

                            </div>
                        </div>
                    </div>

                    <div className="col-md-3">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-body">

                                <div className="fs-2">
                                    ✅
                                </div>

                                <h3 className="fw-bold">
                                    {statistiques.livrees}
                                </h3>

                                <p className="text-muted mb-0">
                                    Livrées
                                </p>

                            </div>
                        </div>
                    </div>

                </div>

                {/* ==========================================
                    STATISTIQUES SECONDAIRES
                ========================================== */}

                <div className="row g-3 mb-4">

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body d-flex justify-content-between align-items-center">

                                <div>
                                    <h6 className="text-muted">
                                        Livraisons acceptées
                                    </h6>

                                    <h3 className="fw-bold mb-0">
                                        {statistiques.acceptees}
                                    </h3>
                                </div>

                                <div className="fs-1">
                                    🤝
                                </div>

                            </div>

                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 border-danger h-100">

                            <div className="card-body d-flex justify-content-between align-items-center">

                                <div>
                                    <h6 className="text-danger">
                                        Livraisons refusées
                                    </h6>

                                    <h3 className="fw-bold text-danger mb-0">
                                        {statistiques.refusees}
                                    </h3>
                                </div>

                                <div className="fs-1">
                                    ❌
                                </div>

                            </div>

                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow-sm border-0 h-100">

                            <div className="card-body d-flex justify-content-between align-items-center">

                                <div>
                                    <h6 className="text-muted">
                                        Total des frais gagnés
                                    </h6>

                                    <h3 className="fw-bold mb-0">
                                        {formaterMontant(
                                            statistiques.totalFrais
                                        )}{" "}
                                        FBu
                                    </h3>
                                </div>

                                <div className="fs-1">
                                    💰
                                </div>

                            </div>

                        </div>
                    </div>

                </div>

                {/* ==========================================
                    FILTRES
                ========================================== */}

                <div className="card shadow-sm border-0 mb-4">

                    <div className="card-body">

                        <h5 className="fw-bold mb-3">
                            🔎 Filtrer mes livraisons
                        </h5>

                        <div className="d-flex flex-wrap gap-2">

                            {filtres.map((item) => (
                                <button
                                    key={item.id}
                                    className={`btn ${
                                        filtre === item.id
                                            ? "btn-primary"
                                            : "btn-outline-secondary"
                                    }`}
                                    onClick={() =>
                                        setFiltre(item.id)
                                    }
                                >
                                    {item.label}{" "}
                                    <span className="badge bg-light text-dark ms-1">
                                        {item.nombre}
                                    </span>
                                </button>
                            ))}

                        </div>

                    </div>

                </div>

                {/* ==========================================
                    LISTE DES LIVRAISONS
                ========================================== */}

                <div className="d-flex justify-content-between align-items-center mb-3">

                    <h4 className="fw-bold mb-0">
                        📋 Mes livraisons
                    </h4>

                    <span className="badge bg-secondary">
                        {livraisonsFiltrees.length} résultat(s)
                    </span>

                </div>

                {livraisonsFiltrees.length === 0 ? (

                    <div className="card shadow-sm border-0">

                        <div className="card-body text-center py-5">

                            <div className="fs-1 mb-3">
                                📦
                            </div>

                            <h5>
                                Aucune livraison trouvée
                            </h5>

                            <p className="text-muted mb-0">
                                Aucune livraison ne correspond
                                à ce filtre.
                            </p>

                        </div>

                    </div>

                ) : (

                    <div className="row g-4">

                        {livraisonsFiltrees.map((livraison) => {

                            const statut =
                                getStatut(livraison);

                            const commandePrete =
                                livraison.commande_statut === "prete" &&
                                livraison.statut === "prise_en_charge";

                            const commandeEnLivraison =
                                livraison.commande_statut === "en_livraison" &&
                                livraison.statut === "en_livraison";

                            const livraisonRefusee =
                                livraison.statut === "annulee";

                            const livraisonAttribuee =
                                livraison.statut === "attribuee";

                            const livraisonAcceptee =
                                livraison.statut === "prise_en_charge";

                            return (
                                <div
                                    className="col-md-6"
                                    key={livraison.id}
                                >

                                    <div className="card shadow-sm border-0 h-100">

                                        {/* EN-TÊTE */}

                                        <div className="card-header bg-white d-flex justify-content-between align-items-center">

                                            <div>

                                                <small className="text-muted">
                                                    Commande
                                                </small>

                                                <h6 className="fw-bold mb-0">

                                                    #
                                                    {livraison.numero_commande ||
                                                        livraison.commande_id}

                                                </h6>

                                            </div>

                                            <span
                                                className={`badge text-bg-${statut.couleur}`}
                                            >
                                                {statut.icone}{" "}
                                                {statut.label}
                                            </span>

                                        </div>

                                        {/* CORPS */}

                                        <div className="card-body">

                                            {/* Commande prête */}

                                            {commandePrete && (
                                                <div className="alert alert-success">

                                                    <strong>
                                                        ✅ Commande prête
                                                    </strong>

                                                    <p className="mb-0 mt-1">
                                                        La commande est prête,
                                                        mais attendez que
                                                        l'administration la
                                                        passe en livraison.
                                                    </p>

                                                </div>
                                            )}

                                            {/* En livraison */}

                                            {commandeEnLivraison && (
                                                <div className="alert alert-info">

                                                    <strong>
                                                        🚚 Vous pouvez partir
                                                    </strong>

                                                    <p className="mb-0 mt-1">
                                                        L'administration a
                                                        lancé la livraison.
                                                        Vous pouvez vous rendre
                                                        chez le client.
                                                    </p>

                                                </div>
                                            )}

                                            {/* Attente */}

                                            {livraisonAttribuee && (
                                                <div className="alert alert-warning">

                                                    <strong>
                                                        ⏳ Réponse attendue
                                                    </strong>

                                                    <p className="mb-0 mt-1">
                                                        Cette livraison vous a
                                                        été attribuée.
                                                        Acceptez-la ou refusez-la
                                                        depuis sa page de détails.
                                                    </p>

                                                </div>
                                            )}

                                            {/* Acceptée */}

                                            {livraisonAcceptee &&
                                                !commandePrete &&
                                                !commandeEnLivraison && (
                                                    <div className="alert alert-primary">

                                                        <strong>
                                                            🤝 Livraison acceptée
                                                        </strong>

                                                        <p className="mb-0 mt-1">
                                                            Vous avez accepté
                                                            cette livraison.
                                                            Attendez les
                                                            instructions de
                                                            l'administration.
                                                        </p>

                                                    </div>
                                                )}

                                            {/* Refus */}

                                            {livraisonRefusee && (
                                                <div className="alert alert-danger">

                                                    <strong>
                                                        ❌ Livraison refusée
                                                    </strong>

                                                    <p className="mb-0 mt-2">

                                                        <strong>
                                                            Motif :
                                                        </strong>{" "}

                                                        {livraison.motif_refus ||
                                                            "Aucun motif indiqué"}

                                                    </p>

                                                </div>
                                            )}

                                            {/* Client */}

                                            <div className="mb-3">

                                                <h6 className="fw-bold">
                                                    👤 Client
                                                </h6>

                                                <p className="mb-1">
                                                    {livraison.client_nom ||
                                                        "Nom non disponible"}
                                                </p>

                                            </div>

                                            {/* Téléphone */}

                                            <div className="mb-3">

                                                <h6 className="fw-bold">
                                                    📞 Téléphone
                                                </h6>

                                                <p className="mb-1">
                                                    {livraison.client_telephone ||
                                                        "Téléphone non disponible"}
                                                </p>

                                            </div>

                                            {/* Adresse */}

                                            <div className="mb-3">

                                                <h6 className="fw-bold">
                                                    📍 Adresse
                                                </h6>

                                                <p className="mb-1">
                                                    {livraison.adresse ||
                                                        "Adresse non disponible"}
                                                </p>

                                            </div>

                                            {/* Distance + frais */}

                                            <div className="row g-2 mb-3">

                                                <div className="col-6">

                                                    <div className="border rounded p-2">

                                                        <small className="text-muted d-block">
                                                            Distance
                                                        </small>

                                                        <strong>
                                                            {livraison.distance_km ||
                                                                0}{" "}
                                                            km
                                                        </strong>

                                                    </div>

                                                </div>

                                                <div className="col-6">

                                                    <div className="border rounded p-2">

                                                        <small className="text-muted d-block">
                                                            Frais
                                                        </small>

                                                        <strong>
                                                            {formaterMontant(
                                                                livraison.frais_livraison
                                                            )}{" "}
                                                            FBu
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* Date attribution */}

                                            {livraison.date_attribution && (
                                                <p className="small text-muted mb-3">

                                                    🕒 Attribution :{" "}

                                                    {new Date(
                                                        livraison.date_attribution
                                                    ).toLocaleString(
                                                        "fr-FR"
                                                    )}

                                                </p>
                                            )}

                                            {/* Date prise en charge */}

                                            {livraison.date_prise_en_charge && (
                                                <p className="small text-muted mb-3">

                                                    🤝 Prise en charge :{" "}

                                                    {new Date(
                                                        livraison.date_prise_en_charge
                                                    ).toLocaleString(
                                                        "fr-FR"
                                                    )}

                                                </p>
                                            )}

                                            {/* Motif refus */}

                                            {livraisonRefusee &&
                                                livraison.motif_refus && (
                                                    <div className="border border-danger rounded p-3 mb-3">

                                                        <h6 className="text-danger fw-bold">
                                                            Motif du refus
                                                        </h6>

                                                        <p className="mb-0">
                                                            {livraison.motif_refus}
                                                        </p>

                                                    </div>
                                                )}

                                            {/* Détails */}

                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={() =>
                                                    navigate(
                                                        `/livreur/livraison/${livraison.id}`
                                                    )
                                                }
                                            >

                                                {livraisonRefusee
                                                    ? "👁️ Voir le refus"
                                                    : commandeEnLivraison
                                                        ? "🚚 Ouvrir la livraison"
                                                        : commandePrete
                                                            ? "📦 Voir la commande"
                                                            : livraisonAttribuee
                                                                ? "🔎 Répondre à la livraison"
                                                                : "👁️ Voir les détails"}

                                            </button>

                                        </div>

                                        {/* PIED */}

                                        <div className="card-footer bg-white text-muted small">

                                            <div className="d-flex justify-content-between">

                                                <span>
                                                    ID livraison :{" "}
                                                    {livraison.id}
                                                </span>

                                                <span>
                                                    ID commande :{" "}
                                                    {livraison.commande_id}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                )}

                {/* ==========================================
                    INFORMATIONS IMPORTANTES
                ========================================== */}

                <div className="alert alert-secondary mt-4">

                    <h6 className="fw-bold">
                        ℹ️ Informations importantes
                    </h6>

                    <ul className="mb-0">

                        <li>
                            Vous pouvez accepter ou refuser une livraison
                            attribuée.
                        </li>

                        <li>
                            Une livraison refusée apparaît dans le filtre
                            « Refusées ».
                        </li>

                        <li>
                            Le motif du refus est conservé dans l'historique.
                        </li>

                        <li>
                            Seule l'administration peut mettre une commande
                            en livraison.
                        </li>

                        <li>
                            Le client confirme la réception de la commande.
                        </li>

                    </ul>

                </div>

            </div>

        </div>
    );
}

export default DashboardLivreur;