import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/contact";
import { Menu, X, Star, ShoppingCart, Megaphone, MapPin, BadgeDollarSign, Clock, User, PlusCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const wilayas = [
  "Alger", "Chlef", "Oran", "Blida", "Annaba", "Constantine", "Tlemcen", "Sétif", "Béjaïa", "Batna",
  "Djelfa", "Sidi Bel Abbès", "Tiaret", "Tizi Ouzou", "Skikda", "Biskra", "Béchar", "Bouira", "Tamanrasset",
  "Tébessa", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "El Bayadh", "Illizi", "Bordj Bou Arréridj",
  "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila",
  "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane",
];

const categories = [
  "Plomberie", "Électricité", "Mécanique", "Beauté", "Ménage", "Jardinage", "Livraison", "Baby sitting",
  "maçonnerie", "Peinture", "Charpenterie", "Autre",
];

export default function AnnoncesPage() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filters, setFilters] = useState({
    min: "",
    max: "",
    wilaya: "",
    category: "",
  });
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchAnnonces();
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) setCurrentUser(JSON.parse(userStr));
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }, []);

  const fetchAnnonces = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/annonces");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de la récupération des annonces");
      }
      
      if (Array.isArray(data)) {
        setAnnonces(data);
      } else {
        setAnnonces([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Impossible de se connecter au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (annonceId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;

    try {
      const res = await fetch(`/api/annonces/${annonceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        setAnnonces(annonces.filter(a => a._id !== annonceId));
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Erreur de connexion au serveur");
    }
  };

  // FILTER LOGIC
  const filteredData = annonces.filter(a => {
    const budget = a.budget || 0;
    const matchesMin = !filters.min || budget >= parseFloat(filters.min);
    const matchesMax = !filters.max || budget <= parseFloat(filters.max);
    const matchesWilaya = !filters.wilaya || a.location === filters.wilaya;
    const matchesCategory = !filters.category || a.category === filters.category;
    return matchesMin && matchesMax && matchesWilaya && matchesCategory;
  });

  // SORT LOGIC
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "old") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "budget") return (b.budget || 0) - (a.budget || 0);
    return 0;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSidebar={false} />

      <div className="pt-28 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Megaphone className="text-orange-500" />
              Toutes les Annonces
            </h1>
            <p className="text-gray-500 mt-1">Consultez et filtrez les demandes de services</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link 
              to="/create-annonce"
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all font-bold flex-1 md:flex-none"
            >
              <PlusCircle size={20} />
              <span>Publier une annonce</span>
            </Link>

            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-semibold flex-1 md:flex-none"
            >
              <Menu size={20} />
              <span>Filtres</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-orange-500 font-semibold flex-1 md:flex-none"
            >
              <option value="recent">Plus récent</option>
              <option value="old">Plus ancien</option>
              <option value="budget">Budget élevé</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl mb-8 flex flex-col items-center gap-3">
            <p className="font-bold text-lg">{error}</p>
            <button 
              onClick={fetchAnnonces}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-xl font-bold transition-all"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity"
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-180px)]">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Budget (DA)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min}
                  onChange={(e) => setFilters({ ...filters, min: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max}
                  onChange={(e) => setFilters({ ...filters, max: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Wilaya</label>
              <select
                value={filters.wilaya}
                onChange={(e) => setFilters({ ...filters, wilaya: e.target.value })}
                className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              >
                <option value="">Toutes les wilayas</option>
                {wilayas.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Catégorie</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full border border-gray-200 p-2.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 bg-gray-50"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setFilters({ min: "", max: "", wilaya: "", category: "" })}
              className="w-full text-orange-500 font-bold text-sm py-2 hover:bg-orange-50 rounded-xl transition"
            >
              Réinitialiser les filtres
            </button>
          </div>

          <div className="absolute bottom-0 w-full p-6 border-t bg-white">
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition"
            >
              Appliquer
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {sortedData.map((annonce) => (
            <motion.div
              key={annonce._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 hover:border-orange-300 transition-all shadow-sm hover:shadow-xl group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-orange-50 text-orange-600 text-[10px] font-bold uppercase px-3 py-1 rounded-lg">
                  {annonce.category}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[10px] flex items-center gap-1">
                    <Clock size={12} /> {new Date(annonce.createdAt).toLocaleDateString()}
                  </span>
                  {currentUser && (annonce.creator?._id === currentUser._id || annonce.creator === currentUser._id) && (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(annonce._id);
                      }}
                      className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Supprimer l'annonce"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {annonce.image && (
                <div className="mb-4 h-56 w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group-hover:shadow-md transition-all">
                  <img src={annonce.image} alt={annonce.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}

              <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-orange-500 transition-colors">
                {annonce.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-wrap leading-loose">{annonce.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-700">
                  <BadgeDollarSign size={18} className="text-green-500" />
                  <span className="font-bold">{annonce.budget || 'À discuter'} DA</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin size={18} className="text-red-500" />
                  <span className="truncate">{annonce.location}</span>
                </div>
              </div>
              
              <Link 
                to={`/profile/${annonce.creator?._id || annonce.creator}`}
                className="mt-4 flex items-center gap-3 bg-gray-50 p-3 rounded-2xl hover:bg-orange-50 transition-colors"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                  {annonce.creator?.avatar ? (
                    <img src={annonce.creator.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    annonce.creator?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs text-gray-600 font-bold truncate">{annonce.creator?.username}</span>
                  <span className={`text-[9px] font-bold uppercase ${
                    annonce.creator?.role === 'admin' ? 'text-red-500' : 
                    annonce.creator?.role === 'technicien' ? 'text-orange-500' : 'text-blue-500'
                  }`}>
                    {annonce.creator?.role || 'client'}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {sortedData.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm mb-12">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone size={40} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-medium text-lg">Aucune annonce ne correspond à vos critères.</p>
            <button 
              onClick={() => setFilters({ min: "", max: "", wilaya: "", category: "" })}
              className="mt-4 text-orange-500 font-bold hover:underline"
            >
              Effacer tous les filtres
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
