/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Wrench, LogIn } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.identifier.trim(),
            password: formData.password.trim(),
          }),
        },
      );
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === "technicien") {
          navigate("/annonces", { replace: true });
        } else {
          navigate("/annonces", { replace: true });
        }
      } else {
        // If admin tries the regular login, guide them
        if (res.status === 403) {
          setError("Compte admin détecté. Utilisez le portail administrateur.");
        } else {
          setError(data.message || "Identifiants invalides");
        }
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden p-4">
      {/* Background FX */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-96 h-96 bg-yellow-500 rounded-full blur-3xl top-10 left-10" />
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full blur-3xl bottom-10 right-10" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Wrench size={40} className="text-yellow-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Fix<span className="text-yellow-400">It</span> Connexion
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Accédez à votre espace de réparation
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 text-red-300 p-3 rounded-lg mb-6 border border-red-500/40">
            {error}
            {/* Show admin portal link if they tried to log in as admin */}
            {error.includes("portail administrateur") && (
              <div className="mt-2">
                <Link
                  to="/admin-login"
                  className="text-red-300 underline font-semibold hover:text-red-200"
                >
                  → Aller au portail admin
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identifier */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Email / Téléphone / Nom d'utilisateur
            </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Entrez votre email, téléphone ou nom d'utilisateur"
              className="w-full px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Entrez votre mot de passe"
                className="w-full px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-20"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1 bg-gray-800 text-yellow-400 rounded hover:bg-gray-700 cursor-pointer"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-400 to-orange-500 transition-all shadow-lg ${
              isSubmitting
                ? "opacity-70 cursor-not-allowed"
                : "hover:from-yellow-300 hover:to-orange-600 hover:scale-[1.02] cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Se connecter à FixIt</span>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-gray-700 pt-4 space-y-2">
          <p className="text-gray-400 text-sm">
            Nouveau ici ?{" "}
            <Link
              to="/signUp"
              className="text-yellow-400 font-semibold hover:underline"
            >
              Créer un compte FixIt
            </Link>
          </p>
          <p className="text-gray-500 text-xs">
            <Link
              to="/forgot-password"
              className="hover:text-yellow-400 transition underline decoration-dotted"
            >
              Mot de passe oublié ?
            </Link>
          </p>
          <p className="text-gray-600 text-xs">
            <Link
              to="/admin-login"
              className="hover:text-red-400 transition underline decoration-dotted"
            >
              Portail administrateur
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
