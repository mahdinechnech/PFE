import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { MapPin, Loader2, Megaphone, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import Navbar from "../components/navbar";
import Footer from "../components/contact";

const PublicProfile = () => {
  // =========================
  // URL PARAM
  // =========================
  const { id } = useParams();

  // =========================
  // TANSTACK FORM STATE
  // =========================
  const form = useForm({
    defaultValues: {
      user: null,
      annonces: [],
      loading: true,
      error: null,
      currentUser: null,
    },
    onSubmit: async () => {},
  });

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        form.setFieldValue("loading", true);
        form.setFieldValue("error", null);

        // ================= USER =================
        const userRes = await fetch(`/api/users/${id}`);
        const userData = await userRes.json();

        if (!userRes.ok) {
          throw new Error(userData.message || "Utilisateur non trouvé");
        }

        form.setFieldValue("user", userData);

        // ================= ANNONCES =================
        const annoncesRes = await fetch("/api/annonces");
        const annoncesData = await annoncesRes.json();

        if (annoncesRes.ok && Array.isArray(annoncesData)) {
          const filtered = annoncesData.filter((a) => {
            return (a.creator && a.creator._id === id) || a.creator === id;
          });

          form.setFieldValue("annonces", filtered);
        }

        // ================= CURRENT USER =================
        try {
          const stored = localStorage.getItem("currentUser");
          if (stored) {
            form.setFieldValue("currentUser", JSON.parse(stored));
          }
        } catch (e) {
          console.log("localStorage error", e);
        }
      } catch (err) {
        form.setFieldValue("error", err.message || "Erreur serveur");
      } finally {
        form.setFieldValue("loading", false);
      }
    };

    fetchData();
  }, [form, id]);

  // =========================
  // DELETE ANNONCE
  // =========================
  const handleDeleteAnnonce = async (annonceId) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;

    try {
      const res = await fetch(`/api/annonces/${annonceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur suppression");
      }

      const updated = form.state.values.annonces.filter(
        (a) => a._id !== annonceId,
      );

      form.setFieldValue("annonces", updated);
    } catch (err) {
      alert(err.message || "Erreur serveur");
    }
  };

  // =========================
  // EXTRACT VALUES
  // =========================
  const { user, annonces, loading, error, currentUser } = form.state.values;

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/annonces">Retour</Link>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto pt-32 px-4">
        {/* PROFILE */}
        <div className="bg-white rounded-2xl p-6 mb-8">
          <h1 className="text-2xl font-bold">{user.username}</h1>

          <p className="text-gray-500 flex items-center gap-2">
            <MapPin size={14} />
            {user.location}
          </p>

          {user.bio && <p className="mt-4 text-gray-600">{user.bio}</p>}
        </div>

        {/* ANNONCES */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Megaphone />
          Annonces
        </h2>

        {annonces.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {annonces.map((a) => {
              const isOwner =
                currentUser &&
                (a.creator === currentUser._id ||
                  (a.creator && a.creator._id === currentUser._id));

              return (
                <motion.div
                  key={a._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-4 rounded-xl"
                >
                  <div className="flex justify-between">
                    <span className="text-xs bg-orange-100 px-2 py-1 rounded">
                      {a.category}
                    </span>

                    {isOwner && (
                      <button onClick={() => handleDeleteAnnonce(a._id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <h3 className="font-bold mt-2">{a.title}</h3>
                  <p className="text-sm text-gray-600">{a.description}</p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">Aucun annonce disponible</p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PublicProfile;
