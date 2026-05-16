import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldAlert, LogIn } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      // ✅ FIXED: uses VITE_API_URL env variable (points to backend :5000)
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/admin-login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.trim(),
            password: formData.password.trim(),
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");

        // ✅ Redirect to admin dashboard
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(data.message || "Accès refusé");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden p-4">
      {/* Background FX */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-96 h-96 bg-red-700 rounded-full blur-3xl top-10 right-10" />
        <div className="absolute w-96 h-96 bg-red-900 rounded-full blur-3xl bottom-10 left-10" />
      </div>

      {/* Card */}
      <div className="relative max-w-md w-full bg-gray-900 rounded-2xl p-8 shadow-2xl border border-red-500/20">
        {/* Header */}
        <div className="text-center mb-8">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest">
            Portail Admin
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Accès restreint au personnel autorisé
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 text-red-300 p-3 rounded-lg mb-6 border border-red-500/40 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifier */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">
              Email ou nom d'utilisateur
            </label>
            <input
              type="text"
              placeholder="admin@fixit.com"
              required
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setError("");
              }}
              className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none"
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
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setError("");
                }}
                className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none pr-20"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1 bg-gray-800 text-red-400 rounded hover:bg-gray-700 cursor-pointer"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-bold text-white bg-red-600 transition-all flex justify-center items-center gap-2 shadow-lg ${
              loading
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-red-700 hover:scale-[1.02] cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authentification...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-gray-800 pt-4">
          <p className="text-gray-600 text-xs">
            Pas un administrateur ?{" "}
            <Link
              to="/login"
              className="text-gray-400 hover:text-yellow-400 transition underline decoration-dotted"
            >
              Connexion standard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
