import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginLivreur() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setMessage("");

        if (!email || !password) {
            setMessage("Veuillez remplir tous les champs.");
            return;
        }

        try {
            setLoading(true);

            const response = await axios.post(
                "http://localhost:5000/api/users/login",
                {
                    email,
                    password
                }
            );

            if (response.data.success) {
                const livreur = response.data.data;

                // Mémoriser les informations du livreur connecté
                localStorage.setItem(
                    "livreurConnecte",
                    JSON.stringify(livreur)
                );

                // Aller au dashboard livreur
                navigate("/livreur");
            }

        } catch (error) {
            console.error("Erreur connexion :", error);

            setMessage(
                error.response?.data?.message ||
                "Erreur lors de la connexion."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-5">

                    <div className="card shadow">
                        <div className="card-body p-4">

                            <h3 className="text-center mb-4">
                                Connexion Livreur
                            </h3>

                            {message && (
                                <div className="alert alert-danger">
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleLogin}>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Adresse Gmail
                                    </label>

                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="exemple@gmail.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Mot de passe
                                    </label>

                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Votre mot de passe"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Connexion..."
                                        : "Se connecter"}
                                </button>

                            </form>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default LoginLivreur;