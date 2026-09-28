import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function DetailLivraison() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [livraison, setLivraison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erreur, setErreur] = useState("");
    const [miseAJour, setMiseAJour] = useState(false);

    // ==========================================
    // ÉTAT DU REFUS
    // ==========================================

    const [afficherRefus, setAfficherRefus] = useState(false);
    const [motifRefus, setMotifRefus] = useState("");


    // ==========================================
    // RÉCUPÉRER LA LIVRAISON
    // ==========================================

    const chargerLivraison = async (affichageChargement = true) => {

        try {

            if (affichageChargement) {
                setLoading(true);
            }

            setErreur("");

            const response = await axios.get(
                `http://localhost:5000/api/livraisons/${id}`
            );

            setLivraison(response.data.data);

        } catch (error) {

            console.error(error);

            setErreur(
                "Impossible de récupérer cette livraison."
            );

        } finally {

            if (affichageChargement) {
                setLoading(false);
            }
        }
    };


    // ==========================================
    // CHARGEMENT INITIAL
    // + ACTUALISATION AUTOMATIQUE
    // ==========================================

    useEffect(() => {

        chargerLivraison();

        // Vérifier automatiquement le statut
        // toutes les 10 secondes
        const intervalle = setInterval(() => {
            chargerLivraison(false);
        }, 10000);

        return () => {
            clearInterval(intervalle);
        };

    }, [id]);


    // ==========================================
    // STATUT DE LA LIVRAISON
    // ==========================================

    const getStatut = (statut) => {

        switch (statut) {

            case "attribuee":
                return {
                    texte: "Attribuée",
                    couleur: "warning"
                };

            case "prise_en_charge":
                return {
                    texte: "Prise en charge",
                    couleur: "info"
                };

            case "en_livraison":
                return {
                    texte: "En livraison",
                    couleur: "primary"
                };

            case "livree":
                return {
                    texte: "Livrée",
                    couleur: "success"
                };

            case "annulee":
                return {
                    texte: "Refusée",
                    couleur: "danger"
                };

            default:
                return {
                    texte: statut,
                    couleur: "secondary"
                };
        }
    };


    // ==========================================
    // CHANGER LE STATUT
    // ==========================================
    // IMPORTANT :
    // Le livreur peut uniquement passer
    // attribuee → prise_en_charge.
    //
    // Il ne peut PAS passer directement
    // à en_livraison.
    // ==========================================

    const changerStatut = async (nouveauStatut) => {

        // Sécurité côté interface
        if (nouveauStatut !== "prise_en_charge") {

            alert(
                "Le passage en livraison est effectué par l'administration."
            );

            return;
        }

        try {

            setMiseAJour(true);

            await axios.patch(
                `http://localhost:5000/api/livraisons/${id}/statut`,
                {
                    statut: nouveauStatut
                }
            );

            await chargerLivraison(false);

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Erreur lors de la modification du statut."
            );

        } finally {

            setMiseAJour(false);
        }
    };


    // ==========================================
    // REFUSER LA LIVRAISON
    // ==========================================

    const refuserLivraison = async () => {

        if (!motifRefus.trim()) {

            alert(
                "Veuillez indiquer le motif du refus."
            );

            return;
        }

        if (motifRefus.trim().length < 3) {

            alert(
                "Le motif du refus doit contenir au moins 3 caractères."
            );

            return;
        }

        const confirmation = window.confirm(
            "Voulez-vous vraiment refuser cette livraison ?"
        );

        if (!confirmation) {
            return;
        }

        try {

            setMiseAJour(true);

            await axios.patch(
                `http://localhost:5000/api/livraisons/${id}/refuser`,
                {
                    motif_refus: motifRefus.trim()
                }
            );

            alert(
                "La livraison a été refusée. L'administrateur en sera informé."
            );

            await chargerLivraison(false);

            setAfficherRefus(false);
            setMotifRefus("");

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Erreur lors du refus de la livraison."
            );

        } finally {

            setMiseAJour(false);
        }
    };


    // ==========================================
    // OUVRIR GOOGLE MAPS
    // ==========================================

    const ouvrirLocalisation = () => {

        if (
            !livraison ||
            livraison.latitude === null ||
            livraison.longitude === null
        ) {

            alert(
                "La localisation du client n'est pas disponible."
            );

            return;
        }

        const latitude = livraison.latitude;
        const longitude = livraison.longitude;

        const url =
            `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        window.open(url, "_blank");
    };


    // ==========================================
    // CHARGEMENT
    // ==========================================

    if (loading) {

        return (
            <div className="container py-5 text-center">

                <div
                    className="spinner-border text-primary"
                    role="status"
                />

                <p className="mt-3">
                    Chargement de la livraison...
                </p>

            </div>
        );
    }


    // ==========================================
    // ERREUR
    // ==========================================

    if (erreur || !livraison) {

        return (

            <div className="container py-5">

                <div className="alert alert-danger">
                    {erreur || "Livraison introuvable"}
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/livreur")}
                >
                    ← Retour
                </button>

            </div>
        );
    }


    const statut = getStatut(livraison.statut);


    // ==========================================
    // STATUT DE LA COMMANDE
    // ==========================================

    const commandePrete =
        livraison.commande_statut === "prete" &&
        livraison.statut === "prise_en_charge";


    const commandeEnPreparation =
        livraison.commande_statut === "en_preparation" &&
        livraison.statut === "prise_en_charge";


    const commandeEnAttente =
        livraison.statut === "prise_en_charge" &&
        (
            livraison.commande_statut === "livreur_assigne" ||
            livraison.commande_statut === "approuvee"
        );


    // ==========================================
    // COMMANDE PRÊTE MAIS ADMIN PAS ENCORE
    // LIVRAISON
    // ==========================================

    const attenteLancementAdmin =
        livraison.commande_statut === "prete" &&
        livraison.statut === "prise_en_charge";


    return (

        <div className="container-fluid bg-light min-vh-100 py-4">

            <div className="container">


                {/* ==================================
                    RETOUR
                ================================== */}

                <button
                    className="btn btn-outline-secondary mb-4"
                    onClick={() => navigate("/livreur")}
                >
                    ← Mes livraisons
                </button>


                {/* ==================================
                    TITRE
                ================================== */}

                <div className="d-flex justify-content-between align-items-center mb-4">

                    <div>

                        <small className="text-muted">
                            Livraison
                        </small>

                        <h2 className="fw-bold mb-0">
                            #{livraison.numero_commande}
                        </h2>

                    </div>


                    <span
                        className={`badge fs-6 text-bg-${statut.couleur}`}
                    >
                        {statut.texte}
                    </span>

                </div>


                {/* ==================================
                    COMMANDE PRÊTE
                ================================== */}

                {commandePrete && (

                    <div className="alert alert-success shadow-sm mb-4">

                        <div className="fw-bold fs-4">
                            🟢 COMMANDE PRÊTE
                        </div>

                        <div className="mt-2">
                            La cuisine a terminé la préparation
                            de la commande.
                        </div>

                        <div className="fw-semibold mt-2">
                            Vous avez déjà pris en charge la livraison.
                        </div>

                        <div className="mt-2">
                            ⏳ Attendez que l'administration
                            mette la commande en livraison.
                        </div>

                        <div className="small mt-2">
                            Cette page se met automatiquement
                            à jour toutes les 10 secondes.
                        </div>

                    </div>

                )}


                {/* ==================================
                    COMMANDE EN PRÉPARATION
                ================================== */}

                {commandeEnPreparation && (

                    <div className="alert alert-info shadow-sm mb-4">

                        <div className="fw-bold fs-5">
                            ⏳ COMMANDE EN PRÉPARATION
                        </div>

                        <div className="mt-1">
                            La cuisine prépare actuellement
                            la commande.
                        </div>

                        <div className="small mt-2">
                            Cette page sera automatiquement
                            actualisée lorsque la commande sera prête.
                        </div>

                    </div>

                )}


                {/* ==================================
                    EN ATTENTE DE PRÉPARATION
                ================================== */}

                {commandeEnAttente && (

                    <div className="alert alert-warning shadow-sm mb-4">

                        <div className="fw-bold">
                            ⏳ EN ATTENTE DE PRÉPARATION
                        </div>

                        <div className="small mt-1">
                            La commande n'est pas encore passée
                            en préparation.
                        </div>

                        <div className="small mt-2">
                            Attendez que l'administration
                            démarre la préparation.
                        </div>

                    </div>

                )}


                <div className="row g-4">


                    {/* ==================================
                        INFORMATIONS CLIENT
                    ================================== */}

                    <div className="col-12 col-lg-7">

                        <div className="card border-0 shadow-sm mb-4">

                            <div className="card-header bg-white">

                                <h5 className="fw-bold mb-0">
                                    👤 Informations client
                                </h5>

                            </div>


                            <div className="card-body">

                                <div className="mb-3">

                                    <strong>
                                        Nom
                                    </strong>

                                    <div>
                                        {livraison.client_nom}
                                    </div>

                                </div>


                                <div className="mb-3">

                                    <strong>
                                        Téléphone
                                    </strong>

                                    <div>
                                        {livraison.client_telephone}
                                    </div>

                                </div>


                                <div>

                                    <strong>
                                        Adresse
                                    </strong>

                                    <div>
                                        {livraison.adresse}
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ==================================
                            LOCALISATION
                        ================================== */}

                        <div className="card border-0 shadow-sm mb-4">

                            <div className="card-header bg-white">

                                <h5 className="fw-bold mb-0">
                                    📍 Localisation
                                </h5>

                            </div>


                            <div className="card-body">

                                <div className="row">

                                    <div className="col-6">

                                        <small className="text-muted">
                                            Latitude
                                        </small>

                                        <div className="fw-semibold">
                                            {livraison.latitude}
                                        </div>

                                    </div>


                                    <div className="col-6">

                                        <small className="text-muted">
                                            Longitude
                                        </small>

                                        <div className="fw-semibold">
                                            {livraison.longitude}
                                        </div>

                                    </div>

                                </div>


                                <button
                                    className="btn btn-primary w-100 mt-4"
                                    onClick={ouvrirLocalisation}
                                >
                                    🗺️ Ouvrir la localisation
                                </button>

                            </div>

                        </div>

                    </div>


                    {/* ==================================
                        RÉSUMÉ LIVRAISON
                    ================================== */}

                    <div className="col-12 col-lg-5">

                        <div className="card border-0 shadow-sm mb-4">

                            <div className="card-header bg-white">

                                <h5 className="fw-bold mb-0">
                                    📦 Résumé
                                </h5>

                            </div>


                            <div className="card-body">

                                <div className="d-flex justify-content-between mb-3">

                                    <span>
                                        Distance
                                    </span>

                                    <strong>
                                        {livraison.distance_km} km
                                    </strong>

                                </div>


                                <div className="d-flex justify-content-between mb-3">

                                    <span>
                                        Frais de livraison
                                    </span>

                                    <strong>
                                        {Number(
                                            livraison.frais_livraison || 0
                                        ).toLocaleString()}{" "}
                                        FBu
                                    </strong>

                                </div>


                                <div className="d-flex justify-content-between mb-3">

                                    <span>
                                        Total plats
                                    </span>

                                    <strong>
                                        {Number(
                                            livraison.total_plats || 0
                                        ).toLocaleString()}{" "}
                                        FBu
                                    </strong>

                                </div>


                                <hr />


                                <div className="d-flex justify-content-between">

                                    <span className="fw-bold">
                                        Total commande
                                    </span>

                                    <strong className="text-primary fs-5">

                                        {Number(
                                            livraison.total_commande || 0
                                        ).toLocaleString()}{" "}
                                        FBu

                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* ==================================
                            ACTIONS
                        ================================== */}

                        <div className="card border-0 shadow-sm">

                            <div className="card-header bg-white">

                                <h5 className="fw-bold mb-0">
                                    🚚 Actions
                                </h5>

                            </div>


                            <div className="card-body">


                                {/* ==================================
                                    LIVRAISON ATTRIBUÉE
                                ================================== */}

                                {livraison.statut === "attribuee" && (

                                    <>

                                        {!afficherRefus && (

                                            <div className="d-grid gap-2">

                                                <button
                                                    className="btn btn-info text-white"
                                                    disabled={miseAJour}
                                                    onClick={() =>
                                                        changerStatut(
                                                            "prise_en_charge"
                                                        )
                                                    }
                                                >
                                                    {miseAJour
                                                        ? "Mise à jour..."
                                                        : "📦 Prendre en charge"}
                                                </button>


                                                <button
                                                    className="btn btn-outline-danger"
                                                    disabled={miseAJour}
                                                    onClick={() =>
                                                        setAfficherRefus(true)
                                                    }
                                                >
                                                    ❌ Refuser la livraison
                                                </button>

                                            </div>

                                        )}


                                        {/* ==================================
                                            FORMULAIRE DE REFUS
                                        ================================== */}

                                        {afficherRefus && (

                                            <div>

                                                <div className="alert alert-danger">

                                                    <strong>
                                                        Refuser cette livraison
                                                    </strong>

                                                    <div className="small mt-1">
                                                        L'administrateur sera informé
                                                        du motif du refus.
                                                    </div>

                                                </div>


                                                <label className="form-label fw-semibold">
                                                    Motif du refus
                                                </label>


                                                <textarea
                                                    className="form-control mb-3"
                                                    rows="4"
                                                    placeholder="Exemple : problème de véhicule, indisponibilité..."
                                                    value={motifRefus}
                                                    onChange={(e) =>
                                                        setMotifRefus(
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={miseAJour}
                                                />


                                                <div className="d-grid gap-2">

                                                    <button
                                                        className="btn btn-danger"
                                                        disabled={miseAJour}
                                                        onClick={refuserLivraison}
                                                    >
                                                        {miseAJour
                                                            ? "Refus en cours..."
                                                            : "❌ Confirmer le refus"}
                                                    </button>


                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        disabled={miseAJour}
                                                        onClick={() => {
                                                            setAfficherRefus(false);
                                                            setMotifRefus("");
                                                        }}
                                                    >
                                                        Annuler
                                                    </button>

                                                </div>

                                            </div>

                                        )}

                                    </>

                                )}


                                {/* ==================================
                                    PRISE EN CHARGE
                                ================================== */}

                                {livraison.statut === "prise_en_charge" && (

                                    <>

                                        {/* ==================================
                                            COMMANDE PRÊTE
                                        ================================== */}

                                        {commandePrete && (

                                            <div className="alert alert-success mb-0">

                                                <div className="fw-bold fs-5">
                                                    🟢 Commande prête
                                                </div>

                                                <div className="mt-2">
                                                    La commande est prête à partir.
                                                </div>

                                                <div className="fw-semibold mt-2">
                                                    ⏳ Attendez que l'administration
                                                    mette la commande en livraison.
                                                </div>

                                                <div className="small mt-2">
                                                    Vous n'avez aucune action à effectuer
                                                    pour le moment.
                                                </div>

                                            </div>

                                        )}


                                        {/* ==================================
                                            EN PRÉPARATION
                                        ================================== */}

                                        {commandeEnPreparation && (

                                            <div className="alert alert-info mb-0">

                                                <div className="fw-bold">
                                                    ⏳ Préparation en cours
                                                </div>

                                                <div className="small mt-1">
                                                    Vous avez pris en charge
                                                    cette livraison.
                                                    Attendez que la cuisine
                                                    termine la commande.
                                                </div>

                                            </div>

                                        )}


                                        {/* ==================================
                                            EN ATTENTE
                                        ================================== */}

                                        {commandeEnAttente && (

                                            <div className="alert alert-warning mb-0">

                                                <div className="fw-bold">
                                                    ⏳ En attente
                                                </div>

                                                <div className="small mt-1">
                                                    La commande doit d'abord
                                                    passer en préparation,
                                                    puis être déclarée prête.
                                                </div>

                                            </div>

                                        )}

                                    </>

                                )}


                                {/* ==================================
                                    EN LIVRAISON
                                ================================== */}

                                {livraison.statut === "en_livraison" && (

                                    <div className="alert alert-warning mb-0">

                                        <div className="fw-bold">
                                            🚚 Livraison en cours
                                        </div>

                                        <div className="mt-2">
                                            Vous pouvez maintenant vous rendre
                                            chez le client.
                                        </div>

                                        <div className="mt-2">
                                            <strong>
                                                Attendez que le client confirme
                                                la réception de sa commande.
                                            </strong>
                                        </div>

                                    </div>

                                )}


                                {/* ==================================
                                    LIVRÉE
                                ================================== */}

                                {livraison.statut === "livree" && (

                                    <div className="alert alert-success mb-0">

                                        <div className="fw-bold">
                                            ✅ Cette livraison est terminée.
                                        </div>

                                        <div className="small mt-2">
                                            Le client a confirmé la réception
                                            de sa commande.
                                        </div>

                                    </div>

                                )}


                                {/* ==================================
                                    REFUSÉE
                                ================================== */}

                                {livraison.statut === "annulee" && (

                                    <div className="alert alert-danger mb-0">

                                        <div className="fw-bold">
                                            ❌ Cette livraison a été refusée.
                                        </div>

                                        {livraison.motif_refus && (

                                            <div className="mt-2">

                                                <strong>
                                                    Motif :
                                                </strong>

                                                <br />

                                                {livraison.motif_refus}

                                            </div>

                                        )}

                                    </div>

                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default DetailLivraison;