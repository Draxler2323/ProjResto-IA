import { useEffect, useMemo, useState } from "react";
import axios from "axios";

function Notifications() {

    // ==========================================
    // ÉTATS
    // ==========================================

    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [filtre, setFiltre] = useState("toutes");

    const [actionLoading, setActionLoading] = useState(null);


    // ==========================================
    // RÉCUPÉRER LES NOTIFICATIONS
    // ==========================================

    const chargerNotifications = async () => {

        try {

            setLoading(true);

            setError("");

            const response = await axios.get(
                "http://localhost:5000/api/notifications"
            );


            let donnees = [];


            if (Array.isArray(response.data)) {

                donnees = response.data;

            } else if (Array.isArray(response.data?.data)) {

                donnees = response.data.data;

            } else if (Array.isArray(response.data?.notifications)) {

                donnees = response.data.notifications;

            }


            setNotifications(donnees);

        } catch (error) {

            console.error(
                "Erreur récupération notifications :",
                error
            );

            setError(
                "Impossible de récupérer les notifications."
            );

        } finally {

            setLoading(false);

        }

    };


    // ==========================================
    // CHARGEMENT INITIAL
    // ==========================================

    useEffect(() => {

        chargerNotifications();

    }, []);



    // ==========================================
    // STATISTIQUES
    // ==========================================

    const totalNotifications = notifications.length;


    const notificationsNonLues = notifications.filter(
        (notification) =>
            notification.lu === 0 ||
            notification.lu === false ||
            notification.lu === "0"
    ).length;


    const notificationsLues = totalNotifications - notificationsNonLues;



    // ==========================================
    // FILTRER LES NOTIFICATIONS
    // ==========================================

    const notificationsFiltrees = useMemo(() => {

        if (filtre === "non_lues") {

            return notifications.filter(
                (notification) =>
                    notification.lu === 0 ||
                    notification.lu === false ||
                    notification.lu === "0"
            );

        }


        if (filtre === "lues") {

            return notifications.filter(
                (notification) =>
                    notification.lu === 1 ||
                    notification.lu === true ||
                    notification.lu === "1"
            );

        }


        return notifications;

    }, [notifications, filtre]);



    // ==========================================
    // VÉRIFIER SI UNE NOTIFICATION EST LUE
    // ==========================================

    const estLue = (notification) => {

        return (
            notification.lu === 1 ||
            notification.lu === true ||
            notification.lu === "1"
        );

    };



    // ==========================================
    // MARQUER COMME LUE
    // ==========================================

    const marquerCommeLue = async (id) => {

        try {

            setActionLoading(id);


            await axios.patch(
                `http://localhost:5000/api/notifications/${id}/lue`
            );


            setNotifications((anciennesNotifications) =>

                anciennesNotifications.map((notification) =>

                    notification.id === id
                        ? {
                            ...notification,
                            lu: 1
                        }
                        : notification

                )

            );

        } catch (error) {

            console.error(
                "Erreur marquage notification :",
                error
            );

            alert(
                "Impossible de marquer la notification comme lue."
            );

        } finally {

            setActionLoading(null);

        }

    };



    // ==========================================
    // SUPPRIMER UNE NOTIFICATION
    // ==========================================

    const supprimerNotification = async (id) => {

        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer cette notification ?"
        );


        if (!confirmation) {

            return;

        }


        try {

            setActionLoading(id);


            await axios.delete(
                `http://localhost:5000/api/notifications/${id}`
            );


            setNotifications((anciennesNotifications) =>

                anciennesNotifications.filter(
                    (notification) =>
                        notification.id !== id
                )

            );

        } catch (error) {

            console.error(
                "Erreur suppression notification :",
                error
            );

            alert(
                "Impossible de supprimer la notification."
            );

        } finally {

            setActionLoading(null);

        }

    };



    // ==========================================
    // FORMATAGE DE LA DATE
    // ==========================================

    const formaterDate = (date) => {

        if (!date) {

            return "Date inconnue";

        }


        const dateFormatee = new Date(date);


        if (Number.isNaN(dateFormatee.getTime())) {

            return date;

        }


        return dateFormatee.toLocaleString("fr-FR", {

            day: "2-digit",

            month: "2-digit",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"

        });

    };



    // ==========================================
    // COULEUR DU TYPE
    // ==========================================

    const getTypeBadge = (type) => {

        switch (type) {

            case "success":

                return "bg-success";

            case "warning":

                return "bg-warning text-dark";

            case "danger":

                return "bg-danger";

            case "info":

                return "bg-info text-dark";

            default:

                return "bg-secondary";

        }

    };



    // ==========================================
    // ICÔNE DU TYPE
    // ==========================================

    const getTypeIcon = (type) => {

        switch (type) {

            case "success":

                return "bi-check-circle";

            case "warning":

                return "bi-exclamation-triangle";

            case "danger":

                return "bi-x-circle";

            case "info":

                return "bi-info-circle";

            default:

                return "bi-bell";

        }

    };



    // ==========================================
    // AFFICHAGE CHARGEMENT
    // ==========================================

    if (loading) {

        return (

            <div className="container-fluid">

                <div className="text-center py-5">

                    <div
                        className="spinner-border text-primary"
                        role="status"
                    ></div>

                    <p className="text-muted mt-3">
                        Chargement des notifications...
                    </p>

                </div>

            </div>

        );

    }



    // ==========================================
    // AFFICHAGE PRINCIPAL
    // ==========================================

    return (

        <div className="container-fluid">


            {/* ==========================================
                EN-TÊTE
            ========================================== */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">

                        <i className="bi bi-bell me-2"></i>

                        Notifications

                    </h2>

                    <p className="text-muted mb-0">

                        Gérez les notifications de votre restaurant.

                    </p>

                </div>


                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={chargerNotifications}
                    disabled={loading}
                >

                    <i className="bi bi-arrow-clockwise me-2"></i>

                    Actualiser

                </button>

            </div>



            {/* ==========================================
                MESSAGE D'ERREUR
            ========================================== */}

            {error && (

                <div
                    className="alert alert-danger d-flex justify-content-between align-items-center"
                    role="alert"
                >

                    <span>

                        <i className="bi bi-exclamation-triangle me-2"></i>

                        {error}

                    </span>


                    <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={chargerNotifications}
                    >

                        Réessayer

                    </button>

                </div>

            )}



            {/* ==========================================
                CARTES STATISTIQUES
            ========================================== */}

            <div className="row g-3 mb-4">


                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body d-flex align-items-center">

                            <div
                                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{
                                    width: "50px",
                                    height: "50px"
                                }}
                            >

                                <i className="bi bi-bell fs-4"></i>

                            </div>


                            <div>

                                <h6 className="text-muted mb-1">
                                    Total notifications
                                </h6>

                                <h3 className="fw-bold mb-0">
                                    {totalNotifications}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>



                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body d-flex align-items-center">

                            <div
                                className="bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{
                                    width: "50px",
                                    height: "50px"
                                }}
                            >

                                <i className="bi bi-bell-fill fs-4"></i>

                            </div>


                            <div>

                                <h6 className="text-muted mb-1">
                                    Non lues
                                </h6>

                                <h3 className="fw-bold mb-0">
                                    {notificationsNonLues}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>



                <div className="col-md-4">

                    <div className="card border-0 shadow-sm h-100">

                        <div className="card-body d-flex align-items-center">

                            <div
                                className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{
                                    width: "50px",
                                    height: "50px"
                                }}
                            >

                                <i className="bi bi-check-circle fs-4"></i>

                            </div>


                            <div>

                                <h6 className="text-muted mb-1">
                                    Lues
                                </h6>

                                <h3 className="fw-bold mb-0">
                                    {notificationsLues}
                                </h3>

                            </div>

                        </div>

                    </div>

                </div>


            </div>



            {/* ==========================================
                FILTRES
            ========================================== */}

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex flex-wrap gap-2">

                        <button
                            type="button"
                            className={
                                filtre === "toutes"
                                    ? "btn btn-primary"
                                    : "btn btn-outline-primary"
                            }
                            onClick={() => setFiltre("toutes")}
                        >

                            Toutes

                            <span className="badge bg-light text-dark ms-2">

                                {totalNotifications}

                            </span>

                        </button>


                        <button
                            type="button"
                            className={
                                filtre === "non_lues"
                                    ? "btn btn-danger"
                                    : "btn btn-outline-danger"
                            }
                            onClick={() => setFiltre("non_lues")}
                        >

                            Non lues

                            <span className="badge bg-light text-dark ms-2">

                                {notificationsNonLues}

                            </span>

                        </button>


                        <button
                            type="button"
                            className={
                                filtre === "lues"
                                    ? "btn btn-success"
                                    : "btn btn-outline-success"
                            }
                            onClick={() => setFiltre("lues")}
                        >

                            Lues

                            <span className="badge bg-light text-dark ms-2">

                                {notificationsLues}

                            </span>

                        </button>

                    </div>

                </div>

            </div>



            {/* ==========================================
                LISTE DES NOTIFICATIONS
            ========================================== */}

            {notificationsFiltrees.length === 0 ? (

                <div className="card border-0 shadow-sm">

                    <div className="card-body text-center py-5">

                        <i className="bi bi-bell-slash fs-1 text-muted"></i>

                        <h5 className="mt-3">
                            Aucune notification
                        </h5>

                        <p className="text-muted mb-0">

                            Aucune notification ne correspond à ce filtre.

                        </p>

                    </div>

                </div>

            ) : (

                <div className="d-flex flex-column gap-3">

                    {notificationsFiltrees.map((notification) => (

                        <div
                            key={notification.id}
                            className={
                                `card border-0 shadow-sm ${
                                    !estLue(notification)
                                        ? "border-start border-4 border-primary"
                                        : ""
                                }`
                            }
                        >

                            <div className="card-body">

                                <div className="d-flex justify-content-between align-items-start gap-3">


                                    {/* ICÔNE */}

                                    <div
                                        className={
                                            `rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 ${getTypeBadge(notification.type)}`
                                        }
                                        style={{
                                            width: "45px",
                                            height: "45px"
                                        }}
                                    >

                                        <i
                                            className={
                                                `bi ${getTypeIcon(notification.type)}`
                                            }
                                        ></i>

                                    </div>



                                    {/* CONTENU */}

                                    <div className="flex-grow-1">

                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">

                                            <h5
                                                className={
                                                    `mb-0 ${
                                                        !estLue(notification)
                                                            ? "fw-bold"
                                                            : ""
                                                    }`
                                                }
                                            >

                                                {notification.titre}

                                            </h5>


                                            {!estLue(notification) && (

                                                <span className="badge bg-primary">

                                                    Non lue

                                                </span>

                                            )}

                                        </div>


                                        <p className="text-muted mb-2">

                                            {notification.message}

                                        </p>


                                        <div className="d-flex flex-wrap gap-3 text-muted small">

                                            <span>

                                                <i className="bi bi-clock me-1"></i>

                                                {formaterDate(
                                                    notification.created_at ||
                                                    notification.date_creation
                                                )}

                                            </span>


                                            {notification.commande_id && (

                                                <span>

                                                    <i className="bi bi-cart me-1"></i>

                                                    Commande #{notification.commande_id}

                                                </span>

                                            )}


                                            {notification.type && (

                                                <span>

                                                    <i className="bi bi-tag me-1"></i>

                                                    {notification.type}

                                                </span>

                                            )}

                                        </div>

                                    </div>



                                    {/* ACTIONS */}

                                    <div className="d-flex flex-column gap-2">


                                        {!estLue(notification) && (

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-success"
                                                title="Marquer comme lue"
                                                disabled={actionLoading === notification.id}
                                                onClick={() =>
                                                    marquerCommeLue(
                                                        notification.id
                                                    )
                                                }
                                            >

                                                <i className="bi bi-check2 me-1"></i>

                                                <span className="d-none d-md-inline">
                                                    Lue
                                                </span>

                                            </button>

                                        )}



                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            title="Supprimer"
                                            disabled={actionLoading === notification.id}
                                            onClick={() =>
                                                supprimerNotification(
                                                    notification.id
                                                )
                                            }
                                        >

                                            <i className="bi bi-trash"></i>

                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export default Notifications;