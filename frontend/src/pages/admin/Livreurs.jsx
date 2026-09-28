import { useEffect, useState } from "react";
import axios from "axios";

function Livreurs() {

    const [livreurs, setLivreurs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const [formData, setFormData] = useState({
        nom: "",
        telephone: "",
        email: "",
        password: "",
        numero_piece: "",
        statut: "indisponible"
    });

    // =========================
    // CHARGER LES LIVREURS
    // =========================
    const chargerLivreurs = async () => {

        try {

            setLoading(true);

            const response = await axios.get(
                "http://localhost:5000/api/livreurs"
            );

            if (response.data.success) {
                setLivreurs(response.data.data);
            }

        } catch (error) {

            console.error("Erreur chargement livreurs :", error);

            alert("Erreur lors du chargement des livreurs");

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {
        chargerLivreurs();
    }, []);


    // =========================
    // CHANGEMENT FORMULAIRE
    // =========================
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    // =========================
    // AJOUTER UN LIVREUR
    // =========================
    const ajouterLivreur = async (e) => {

        e.preventDefault();

        try {

            setLoadingAction(true);

            const response = await axios.post(
                "http://localhost:5000/api/livreurs",
                formData
            );

            if (response.data.success) {

                alert("Livreur créé avec succès !");

                setFormData({
                    nom: "",
                    telephone: "",
                    email: "",
                    password: "",
                    numero_piece: "",
                    statut: "indisponible"
                });

                setShowForm(false);

                chargerLivreurs();
            }

        } catch (error) {

            console.error("Erreur création livreur :", error);

            const message =
                error.response?.data?.message ||
                "Erreur lors de la création du livreur";

            alert(message);

        } finally {

            setLoadingAction(false);
        }
    };


    // =========================
    // CHANGER STATUT
    // =========================
    const changerStatut = async (id, statut) => {

        try {

            const response = await axios.patch(
                `http://localhost:5000/api/livreurs/${id}/status`,
                { statut }
            );

            if (response.data.success) {

                chargerLivreurs();

            }

        } catch (error) {

            console.error("Erreur changement statut :", error);

            alert(
                error.response?.data?.message ||
                "Erreur lors du changement de statut"
            );
        }
    };


    // =========================
    // SUPPRIMER
    // =========================
    const supprimerLivreur = async (id, nom) => {

        const confirmation = window.confirm(
            `Voulez-vous vraiment supprimer le livreur "${nom}" ?`
        );

        if (!confirmation) {
            return;
        }

        try {

            const response = await axios.delete(
                `http://localhost:5000/api/livreurs/${id}`
            );

            if (response.data.success) {

                alert("Livreur supprimé avec succès");

                chargerLivreurs();
            }

        } catch (error) {

            console.error("Erreur suppression livreur :", error);

            alert(
                error.response?.data?.message ||
                "Erreur lors de la suppression du livreur"
            );
        }
    };


    // =========================
    // BADGE STATUT
    // =========================
    const afficherStatut = (statut) => {

        if (statut === "disponible") {
            return (
                <span className="badge bg-success">
                    Disponible
                </span>
            );
        }

        if (statut === "en_livraison") {
            return (
                <span className="badge bg-warning text-dark">
                    En livraison
                </span>
            );
        }

        return (
            <span className="badge bg-secondary">
                Indisponible
            </span>
        );
    };


    // =========================
    // AFFICHAGE
    // =========================
    return (
        <div className="container-fluid py-4">

            {/* TITRE */}
            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="fw-bold mb-1">
                        Gestion des livreurs
                    </h2>

                    <p className="text-muted mb-0">
                        Gérer les livreurs de votre restaurant
                    </p>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Fermer" : "Ajouter un livreur"}
                </button>

            </div>


            {/* FORMULAIRE */}
            {showForm && (

                <div className="card shadow-sm mb-4">

                    <div className="card-header bg-white">
                        <h5 className="mb-0">
                            Nouveau livreur
                        </h5>
                    </div>

                    <div className="card-body">

                        <form onSubmit={ajouterLivreur}>

                            <div className="row">

                                {/* NOM */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Nom complet *
                                    </label>

                                    <input
                                        type="text"
                                        name="nom"
                                        className="form-control"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        placeholder="Ex : Jean Dupont"
                                        required
                                    />

                                </div>


                                {/* TELEPHONE */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Téléphone *
                                    </label>

                                    <input
                                        type="tel"
                                        name="telephone"
                                        className="form-control"
                                        value={formData.telephone}
                                        onChange={handleChange}
                                        placeholder="Ex : 79000000"
                                        required
                                    />

                                </div>


                                {/* EMAIL */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Ex : jean@email.com"
                                    />

                                </div>


                                {/* MOT DE PASSE */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Mot de passe *
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Mot de passe"
                                        required
                                    />

                                </div>


                                {/* NUMERO PIECE */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Numéro de pièce
                                    </label>

                                    <input
                                        type="text"
                                        name="numero_piece"
                                        className="form-control"
                                        value={formData.numero_piece}
                                        onChange={handleChange}
                                        placeholder="Ex : ID123456"
                                    />

                                </div>


                                {/* STATUT */}
                                <div className="col-md-6 mb-3">

                                    <label className="form-label">
                                        Statut initial
                                    </label>

                                    <select
                                        name="statut"
                                        className="form-select"
                                        value={formData.statut}
                                        onChange={handleChange}
                                    >

                                        <option value="indisponible">
                                            Indisponible
                                        </option>

                                        <option value="disponible">
                                            Disponible
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={loadingAction}
                            >
                                {loadingAction
                                    ? "Création..."
                                    : "Créer le livreur"
                                }
                            </button>

                        </form>

                    </div>

                </div>
            )}


            {/* LISTE */}
            <div className="card shadow-sm">

                <div className="card-header bg-white d-flex justify-content-between align-items-center">

                    <h5 className="mb-0">
                        Liste des livreurs
                    </h5>

                    <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={chargerLivreurs}
                    >
                        Actualiser
                    </button>

                </div>


                <div className="card-body p-0">

                    {loading ? (

                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                            </div>

                            <p className="mt-2 text-muted">
                                Chargement...
                            </p>
                        </div>

                    ) : livreurs.length === 0 ? (

                        <div className="text-center py-5">

                            <h5>
                                Aucun livreur
                            </h5>

                            <p className="text-muted">
                                Aucun livreur n'a encore été enregistré.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">

                                <thead className="table-light">

                                    <tr>
                                        <th>#</th>
                                        <th>Nom</th>
                                        <th>Téléphone</th>
                                        <th>Email</th>
                                        <th>N° pièce</th>
                                        <th>Statut</th>
                                        <th>Compte</th>
                                        <th>Actions</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {livreurs.map((livreur) => (

                                        <tr key={livreur.id}>

                                            <td>
                                                {livreur.id}
                                            </td>

                                            <td className="fw-semibold">
                                                {livreur.nom}
                                            </td>

                                            <td>
                                                {livreur.telephone_user}
                                            </td>

                                            <td>
                                                {livreur.email || "-"}
                                            </td>

                                            <td>
                                                {livreur.numero_piece || "-"}
                                            </td>

                                            <td>
                                                {afficherStatut(livreur.statut)}
                                            </td>

                                            <td>

                                                {livreur.compte_statut === "actif" ? (

                                                    <span className="badge bg-success">
                                                        Actif
                                                    </span>

                                                ) : (

                                                    <span className="badge bg-danger">
                                                        Inactif
                                                    </span>

                                                )}

                                            </td>

                                            <td>

                                                <div className="d-flex gap-2">

                                                    {livreur.statut === "disponible" ? (

                                                        <button
                                                            className="btn btn-warning btn-sm"
                                                            onClick={() =>
                                                                changerStatut(
                                                                    livreur.id,
                                                                    "indisponible"
                                                                )
                                                            }
                                                        >
                                                            Indisponible
                                                        </button>

                                                    ) : livreur.statut === "indisponible" ? (

                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() =>
                                                                changerStatut(
                                                                    livreur.id,
                                                                    "disponible"
                                                                )
                                                            }
                                                        >
                                                            Disponible
                                                        </button>

                                                    ) : (

                                                        <span className="text-muted small">
                                                            En livraison
                                                        </span>

                                                    )}


                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            supprimerLivreur(
                                                                livreur.id,
                                                                livreur.nom
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

export default Livreurs;