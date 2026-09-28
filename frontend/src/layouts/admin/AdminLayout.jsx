import { NavLink, Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {

  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: "bi-speedometer2",
      end: true
    },
    {
      name: "Statistiques",
      path: "/admin/statistiques",
      icon: "bi-bar-chart-line"
    },
    {
      name: "Catégories",
      path: "/admin/categories",
      icon: "bi-grid"
    },
    {
      name: "Plats",
      path: "/admin/plats",
      icon: "bi-egg-fried"
    },
    {
      name: "Commandes",
      path: "/admin/commandes",
      icon: "bi-cart3"
    },
    {
      name: "Livreurs",
      path: "/admin/livreurs",
      icon: "bi-person-badge"
    },
    {
      name: "Livraisons",
      path: "/admin/livraisons",
      icon: "bi-truck"
    },
    {
      name: "Paiements",
      path: "/admin/paiements",
      icon: "bi-credit-card"
    },
    {
      name: "Tarifs livraison",
      path: "/admin/tarifs",
      icon: "bi-geo-alt"
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: "bi-bell"
    }
  ];


  return (

    <div className="d-flex min-vh-100 bg-light">


      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside
        className="bg-dark text-white d-flex flex-column"
        style={{
          width: "260px",
          minHeight: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000
        }}
      >


        {/* LOGO */}

        <div className="p-4 border-bottom border-secondary">

          <div className="d-flex align-items-center gap-3">

            <div
              className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{
                width: "42px",
                height: "42px"
              }}
            >
              A
            </div>


            <div>

              <h5 className="mb-0 fw-bold">
                AZPRO
              </h5>

              <small className="text-secondary">
                RESTAURANT
              </small>

            </div>

          </div>

        </div>



        {/* MENU */}

        <nav className="p-3 flex-grow-1">

          <div className="text-uppercase text-secondary small fw-bold mb-3 px-2">
            Administration
          </div>


          <div className="d-flex flex-column gap-1">

            {menuItems.map((item) => (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `text-decoration-none rounded px-3 py-2 d-flex align-items-center gap-3 ${
                    isActive
                      ? "bg-white text-dark fw-semibold"
                      : "text-white"
                  }`
                }
              >

                <i className={`bi ${item.icon}`}></i>

                <span>
                  {item.name}
                </span>

              </NavLink>

            ))}

          </div>

        </nav>



        {/* BAS SIDEBAR */}

        <div className="p-3 border-top border-secondary">

          <div className="d-flex align-items-center gap-3">

            <div
              className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "38px",
                height: "38px"
              }}
            >
              <i className="bi bi-person"></i>
            </div>


            <div>

              <div className="fw-semibold">
                Administrateur
              </div>

              <small className="text-secondary">
                Compte admin
              </small>

            </div>

          </div>

        </div>

      </aside>



      {/* ==========================================
          CONTENU PRINCIPAL
      ========================================== */}

      <div
        className="flex-grow-1"
        style={{
          marginLeft: "260px"
        }}
      >


        {/* ==========================================
            TOPBAR
        ========================================== */}

        <header className="bg-white border-bottom px-4 py-3">

          <div className="d-flex justify-content-between align-items-center">


            {/* TITRE */}

            <div>

              <h5 className="mb-0 fw-bold">
                Administration
              </h5>

              <small className="text-muted">
                Gestion de votre restaurant
              </small>

            </div>



            {/* ACTIONS */}

            <div className="d-flex align-items-center gap-3">


              {/* ==========================================
                  BOUTON NOTIFICATIONS
              ========================================== */}

              <button
                type="button"
                className="btn btn-light position-relative"
                onClick={() => navigate("/admin/notifications")}
                title="Voir les notifications"
              >

                <i className="bi bi-bell fs-5"></i>


                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                  style={{
                    fontSize: "9px"
                  }}
                >
                  0
                </span>

              </button>



              {/* ==========================================
                  PROFIL
              ========================================== */}

              <div className="d-flex align-items-center gap-2">

                <div
                  className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: "38px",
                    height: "38px"
                  }}
                >
                  <i className="bi bi-person"></i>
                </div>


                <div className="d-none d-md-block">

                  <div className="fw-semibold">
                    Admin
                  </div>

                  <small className="text-muted">
                    Administrateur
                  </small>

                </div>

              </div>

            </div>

          </div>

        </header>



        {/* ==========================================
            PAGE
        ========================================== */}

        <main className="p-4">

          <Outlet />

        </main>


      </div>

    </div>

  );

}


export default AdminLayout;