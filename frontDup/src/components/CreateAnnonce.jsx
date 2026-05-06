import { useState, useRef } from "react";
import { PlusCircle, Loader2, Camera, X } from "lucide-react";
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
  "Baby sitting",
  "maçonnerie",
  "Peinture",
  "Charpenterie",
  "Autre",
];

const wilayas = [
  "Alger", "Chlef", "Oran", "Blida", "Annaba", "Constantine", "Tlemcen", "Sétif", "Béjaïa", "Batna",
  "Djelfa", "Sidi Bel Abbès", "Tiaret", "Tizi Ouzou", "Skikda", "Biskra", "Béchar", "Bouira", "Tamanrasset",
  "Tébessa", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "El Bayadh", "Illizi", "Bordj Bou Arréridj",
  "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila",
  "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane",
];

export default function CreateAnnonce() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    wilaya: "",
    budget: "",
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setForm({ ...form, image: null });
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.category || !form.title || !form.description || !form.wilaya) {
      setError("Veuillez remplir tous les champs obligatoires");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("location", form.wilaya);
      if (form.budget) formData.append("budget", form.budget);
      if (form.image) formData.append("image", form.image);
      
      const res = await fetch("/api/annonces", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/annonces");
      } else {
        setError(data.message || data.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Upload error:", err);
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
            <PlusCircle className="text-yellow-400" size={28} />
            <span>Créer une annonce</span>
          </h1>

          {error && (
            <div className="bg-red-900/40 text-red-300 p-3 rounded-lg mb-6 border border-red-500/40 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Catégorie*</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Choisir catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Titre de votre demande*</label>
              <input
                type="text"
                name="title"
                value={form.title}
                placeholder="ex: Besoin d'un électricien en urgence"
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description détaillée*</label>
              <textarea
                name="description"
                value={form.description}
                placeholder="Décrivez votre problème..."
                onChange={handleChange}
                rows="4"
                className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
                <Camera size={16} /> Ajouter une photo
              </label>
              
              <div className="mt-2">
                {!preview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-yellow-400 hover:text-yellow-400 transition-all bg-[#020617]"
                  >
                    <PlusCircle size={32} className="mb-2" />
                    <span className="text-sm">Cliquez pour choisir une photo</span>
                  </button>
                ) : (
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border border-gray-700 bg-black/20">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Wilaya*</label>
                <select
                  name="wilaya"
                  value={form.wilaya}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">Choisir wilaya</option>
                  {wilayas.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Budget approx (DA)</label>
                <input
                  type="number"
                  name="budget"
                  value={form.budget}
                  placeholder="Optionnel"
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-[#020617] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 rounded-lg bg-yellow-400 text-black font-bold hover:bg-yellow-500 transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Publier l'annonce"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
