import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Checkout() {
  const navigate = useNavigate();

  const [panier] = useState(() => {
    const panierSauvegarde = localStorage.getItem("panier");

    return panierSauvegarde
      ? JSON.parse(panierSauvegarde)
      : [];
  });

  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [localisation, setLocalisation] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [loadingCommande, setLoadingCommande] = useState(false);

  const totalPlats = panier.reduce(
    (total, item) =>
      total + Number(item.prix) * item.quantite,
    0
  );


  // ==========================================
  // OBTENIR LA LOCALISATION GPS
  // ==========================================

  const obtenirLocalisation = () => {

    if (!navigator.geolocation) {

      alert(
        "La géolocalisation n'est pas supportée par votre navigateur."
      );

      return;
    }

    setLoadingGPS(true);

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);

        setLocalisation(true);
        setLoadingGPS(false);
      },

      (error) => {

        console.error(
          "Erreur localisation :",
          error
        );

        setLoadingGPS(false);

        alert(
          "Impossible d'obtenir votre localisation. Vérifiez que le GPS est activé et autorisez le navigateur à accéder à votre position."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };


  // ==========================================
  // ENVOYER LA COMMANDE
  // ==========================================

  const envoyerCommande = async (e) => {

    e.preventDefault();


    // Vérifier le panier
    if (panier.length === 0) {

      alert("Votre panier est vide.");

      return;
    }


    // Vérifier le nom
    if (!nom.trim()) {

      alert("Veuillez entrer votre nom.");

      return;
    }


    // Vérifier le téléphone
    if (!telephone.trim()) {

      alert(
        "Veuillez entrer votre numéro de téléphone."
      );

      return;
    }


    // Vérifier le GPS
    if (!latitude || !longitude) {

      alert(
        "Veuillez obtenir votre localisation GPS."
      );

      return;
    }


    // Vérifier l'adresse
    if (!adresse.trim()) {

      alert(
        "Veuillez entrer votre adresse."
      );

      return;
    }


    try {

      setLoadingCommande(true);


      // ==========================================
      // Préparer les plats
      // ==========================================

      const panierBackend = panier.map((item) => ({
        plat_id: item.id,
        quantite: item.quantite
      }));


      // ==========================================
      // Envoyer au backend
      // ==========================================

      const response = await axios.post(
        "http://localhost:5000/api/commandes",
        {
          client_nom: nom.trim(),
          client_telephone: telephone.trim(),
          latitude,
          longitude,
          adresse: adresse.trim(),
          panier: panierBackend
        }
      );


      // ==========================================
      // Vérifier la réponse
      // ==========================================

      if (response.data.success) {
        const commande = response.data.data;
      
        // Mémoriser la dernière commande
        localStorage.setItem("derniereCommandeId", commande.id);
        
        localStorage.setItem("clientTelephone", telephone.trim());
      
        // Vider le panier
        localStorage.removeItem("panier");
      
        alert(
          `Commande envoyée avec succès !\n\nNuméro : ${commande.numero_commande}`
        );
      
        // Aller au suivi de la commande
        navigate(`/suivi-commande/${commande.id}`);
      

      } else {

        alert(
          response.data.message ||
          "Impossible d'envoyer la commande."
        );
      }


    } catch (error) {

      console.error(
        "Erreur envoi commande :",
        error
      );


      alert(
        error.response?.data?.message ||
        "Une erreur est survenue lors de l'envoi de la commande."
      );

    } finally {

      setLoadingCommande(false);

    }
  };


  return (
    <div className="container py-5">

      {/* RETOUR */}

      <div className="mb-4">

        <button
          type="button"
          className="btn btn-outline-dark"
          onClick={() => navigate("/menu")}
        >
          <i className="bi bi-arrow-left me-2"></i>

          Retour au menu
        </button>

      </div>


      <div className="row g-4">


        {/* =====================================
            FORMULAIRE
        ====================================== */}

        <div className="col-lg-7">

          <div className="card border-0 shadow-sm">

            <div className="card-header bg-dark text-white py-3">

              <h4 className="mb-0">
                Informations de livraison
              </h4>

            </div>


            <div className="card-body p-4">

              <form onSubmit={envoyerCommande}>


                {/* NOM */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Nom complet
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Votre nom"
                    value={nom}
                    onChange={(e) =>
                      setNom(e.target.value)
                    }
                  />

                </div>


                {/* TELEPHONE */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Téléphone
                  </label>

                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Votre numéro"
                    value={telephone}
                    onChange={(e) =>
                      setTelephone(e.target.value)
                    }
                  />

                </div>


                {/* GPS */}

                <div className="mb-3">

                  <label className="form-label fw-semibold">
                    Localisation GPS
                  </label>


                  <button
                    type="button"
                    className="btn btn-dark"
                    onClick={obtenirLocalisation}
                    disabled={loadingGPS}
                  >

                    {loadingGPS ? (

                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Localisation...
                      </>

                    ) : (

                      <>
                        <i className="bi bi-geo-alt me-2"></i>
                        Obtenir ma position
                      </>

                    )}

                  </button>


                  {localisation && (

                    <div className="alert alert-success mt-3 mb-0">

                      <i className="bi bi-check-circle me-2"></i>

                      Position obtenue avec succès.

                      <div className="small mt-2">

                        Latitude : {latitude}

                        <br />

                        Longitude : {longitude}

                      </div>

                    </div>

                  )}

                </div>


                {/* ADRESSE */}

                <div className="mb-4">

                  <label className="form-label fw-semibold">
                    Adresse
                  </label>

                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Quartier, avenue, numéro de maison..."
                    value={adresse}
                    onChange={(e) =>
                      setAdresse(e.target.value)
                    }
                  ></textarea>

                </div>


                {/* BOUTON */}

                <button
                  type="submit"
                  className="btn btn-dark w-100 py-2"
                  disabled={loadingCommande}
                >

                  {loadingCommande ? (

                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Envoi de la commande...
                    </>

                  ) : (

                    <>
                      <i className="bi bi-send me-2"></i>
                      Envoyer la commande
                    </>

                  )}

                </button>

              </form>

            </div>

          </div>

        </div>


        {/* =====================================
            RÉCAPITULATIF
        ====================================== */}

        <div className="col-lg-5">

          <div className="card border-0 shadow-sm">

            <div className="card-header bg-dark text-white py-3">

              <h5 className="mb-0">

                <i className="bi bi-cart3 me-2"></i>

                Récapitulatif

              </h5>

            </div>


            <div className="card-body">

              {panier.length === 0 ? (

                <p className="text-muted text-center">
                  Votre panier est vide.
                </p>

              ) : (

                <>

                  {panier.map((item) => (

                    <div
                      key={item.id}
                      className="d-flex justify-content-between border-bottom py-3"
                    >

                      <div>

                        <div className="fw-semibold">
                          {item.nom}
                        </div>

                        <small className="text-muted">

                          {item.quantite} ×{" "}

                          {Number(
                            item.prix
                          ).toLocaleString("fr-FR")}{" "}

                          FBu

                        </small>

                      </div>


                      <strong>

                        {(
                          Number(item.prix) *
                          item.quantite
                        ).toLocaleString("fr-FR")}{" "}

                        FBu

                      </strong>

                    </div>

                  ))}


                  <div className="d-flex justify-content-between mt-4 fs-5 fw-bold">

                    <span>
                      Total plats
                    </span>

                    <span>

                      {totalPlats.toLocaleString(
                        "fr-FR"
                      )}{" "}

                      FBu

                    </span>

                  </div>


                  <div className="alert alert-info mt-3 mb-0 small">

                    <i className="bi bi-info-circle me-2"></i>

                    Les frais de livraison seront
                    déterminés après validation de
                    votre commande.

                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Checkout;