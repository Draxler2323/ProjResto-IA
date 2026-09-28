import { Routes, Route, Navigate } from "react-router-dom";

// ==============================
// ADMIN
// ==============================
import Dashboard from "./pages/admin/Dashboard";
import Statistiques from "./pages/admin/Statistiques";
import Categories from "./pages/admin/Categories";
import Plats from "./pages/admin/Plats";
import Commandes from "./pages/admin/Commandes";
import Livreurs from "./pages/admin/Livreurs";
import Livraisons from "./pages/admin/Livraisons";
import Notifications from "./pages/admin/Notifications";

import AdminLayout from "./layouts/admin/AdminLayout";


// ==============================
// LIVREUR
// ==============================
import DashboardLivreur from "./pages/livreur/DashboardLivreur";
import DetailLivraison from "./pages/livreur/DetailLivraison";
import LoginLivreur from "./pages/livreur/LoginLivreur";


// ==============================
// CLIENT
// ==============================
import Menu from "./pages/client/Menu";
import Checkout from "./pages/client/Checkout";
import SuiviCommande from "./pages/client/SuiviCommande";
import MesCommandes from "./pages/client/MesCommandes";



function App() {

    return (

        <Routes>


            {/* ==========================================
                ESPACE ADMIN
            ========================================== */}

            <Route
                path="/admin"
                element={<AdminLayout />}
            >

                {/* Dashboard */}
                <Route
                    index
                    element={<Dashboard />}
                />


                {/* Statistiques */}
                <Route
                    path="statistiques"
                    element={<Statistiques />}
                />


                {/* Catégories */}
                <Route
                    path="categories"
                    element={<Categories />}
                />


                {/* Plats */}
                <Route
                    path="plats"
                    element={<Plats />}
                />


                {/* Commandes */}
                <Route
                    path="commandes"
                    element={<Commandes />}
                />


                {/* Livreurs */}
                <Route
                    path="livreurs"
                    element={<Livreurs />}
                />


                {/* Livraisons */}
                <Route
                    path="livraisons"
                    element={<Livraisons />}
                />


                {/* Notifications */}
                <Route
                    path="notifications"
                    element={<Notifications />}
                />

            </Route>



            {/* ==========================================
                ESPACE LIVREUR
            ========================================== */}

            <Route
                path="/livreur"
                element={<DashboardLivreur />}
            />


            <Route
                path="/livreur/livraison/:id"
                element={<DetailLivraison />}
            />


            <Route
                path="/livreur/login"
                element={<LoginLivreur />}
            />



            {/* ==========================================
                ESPACE CLIENT
            ========================================== */}

            <Route
                path="/menu"
                element={<Menu />}
            />


            <Route
                path="/checkout"
                element={<Checkout />}
            />


            <Route
                path="/suivi-commande/:id"
                element={<SuiviCommande />}
            />


            <Route
                path="/mes-commandes"
                element={<MesCommandes />}
            />



            {/* ==========================================
                ROUTES PAR DÉFAUT
            ========================================== */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/admin"
                        replace
                    />
                }
            />


            <Route
                path="*"
                element={
                    <Navigate
                        to="/admin"
                        replace
                    />
                }
            />

        </Routes>

    );

}


export default App;