import { useState } from "react";
import { Wrench, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";

const categories = [
  "Plomberie",
  "Électricité",
  "Mécanique",
  "Beauté",
  "Ménage",
  "Jardinage",
  "Livraison",
  "maçonnerie",
  "Peinture",
  "Charpenterie",
];

const wilayas = [
  "Alger", "Oran", "Blida", "Constantine", "Annaba", "Sétif", "Batna", "Djelfa", "Biskra", "Tiaret",
];

export default function CreateService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    location: "",
    price: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/");
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220]">
      <Navbar showLinks={false} showSidebar={false} />
      <div className="flex items-center justify-center pt-28 pb-12 px-4">
        <div className="w-full max-w-xl bg-[#0f172a] text-white p-8 rounded-2xl shadow-xl border border-gray-700">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-6">
            <Wrench className="text-orange-500" size={28} />
            <span>Proposer un service</span>
          </h1>

          {error && (
            <div className="bg-red-900/40 text-red-300 p-3 rounded-lg mb-6 border border-red-500/40 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Catégorie de métier*</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="">Choisir catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Titre de votre service*</label>
              <input
                type="text"
                name="title"
                value={form.title}
                placeholder="ex: Réparation climatisation toutes marques"
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description de vos prestations*</label>
              <textarea
                name="description"
                value={form.description}
                placeholder="Détaillez ce que vous proposez..."
                onChange={handleChange}
                rows="4"
                className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Lieu d'intervention*</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  placeholder="ex: Alger, Blida..."
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tarif indicatif (DA)*</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  placeholder="0.00"
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 rounded-lg bg-orange-500 text-white font-bold hover:bg-orange-600 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Publier mon service"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
