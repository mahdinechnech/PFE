import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  MapPin,
  BadgeDollarSign,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AnnoncesFeed() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/annonces")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.message || "Erreur lors de la récupération");
        return data;
      })
      .then((data) => {
        if (Array.isArray(data)) setAnnonces(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  // Only show first 6 on home feed
  const displayAnnonces = annonces.slice(0, 6);

  return (
    <section className="py-12 bg-gray-50" id="annonces">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Megaphone className="text-blue-500" />
              Flux des Annonces
            </h2>
            <p className="text-gray-500 mt-2">
              Découvrez les dernières demandes de notre communauté
            </p>
          </div>

          <Link
            to="/annonces"
            className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
          >
            Voir tout <ArrowRight size={20} />
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayAnnonces.map((annonce) => (
            <motion.div
              key={annonce._id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase px-3 py-1 rounded-lg">
                  {annonce.category}
                </div>
                <span className="text-gray-400 text-[10px] flex items-center gap-1">
                  <Clock size={12} />{" "}
                  {new Date(annonce.createdAt).toLocaleDateString()}
                </span>
              </div>

              {annonce.image && (
                <div className="mb-4 h-48 w-full rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                  <img
                    src={annonce.image}
                    alt={annonce.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {annonce.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 whitespace-pre-wrap leading-loose">
                {annonce.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-700">
                  <BadgeDollarSign size={18} className="text-green-500" />
                  <span className="font-bold">
                    {annonce.budget || "À discuter"} DA
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin size={18} className="text-red-500" />
                  <span className="truncate">{annonce.location}</span>
                </div>
              </div>

              <Link
                to={`/profile/${annonce.creator?._id || annonce.creator}`}
                className="mt-4 flex items-center gap-3 bg-gray-50 p-2 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-white shrink-0">
                  {annonce.creator?.avatar ? (
                    <img
                      src={annonce.creator.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    annonce.creator?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-600 font-medium truncate">
                    Posté par <strong>{annonce.creator?.username}</strong>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      annonce.creator?.role === "admin"
                        ? "text-red-500"
                        : annonce.creator?.role === "technicien"
                          ? "text-orange-500"
                          : "text-blue-500"
                    }`}
                  >
                    {annonce.creator?.role || "client"}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {annonces.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-400">Aucune annonce pour le moment.</p>
          </div>
        )}

        <div className="mt-10 text-center md:hidden">
          <Link
            to="/annonces"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-blue-600 font-bold px-8 py-3 rounded-xl shadow-sm"
          >
            Voir toutes les annonces <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
