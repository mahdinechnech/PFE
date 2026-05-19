import { useState, useEffect, useRef } from "react";
import {
  User,
  MapPin,
  FileText,
  Camera,
  Save,
  X,
  Loader2,
  Trash2,
  Edit3,
  Megaphone,
  AlertTriangle,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/contact";
import { motion, AnimatePresence } from "framer-motion";

const wilayas = [
  "Alger",
  "Chlef",
  "Oran",
  "Blida",
  "Annaba",
  "Constantine",
  "Tlemcen",
  "Sétif",
  "Béjaïa",
  "Batna",
  "Djelfa",
  "Sidi Bel Abbès",
  "Tiaret",
  "Tizi Ouzou",
  "Skikda",
  "Biskra",
  "Béchar",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
];

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

/* ─── Decorative blobs for hero cover ─── */
const HeroBlobs = () => (
  <svg
    className="absolute inset-0 w-full h-full"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <radialGradient id="g1" cx="20%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="g2" cx="80%" cy="30%" r="50%">
        <stop offset="0%" stopColor="#fde68a" stopOpacity="0.4" />
        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="10%" cy="80%" r="180" fill="rgba(255,255,255,0.06)" />
    <circle cx="85%" cy="15%" r="120" fill="rgba(255,255,255,0.08)" />
    <circle cx="60%" cy="90%" r="90" fill="rgba(255,255,255,0.05)" />
    <rect
      x="75%"
      y="50%"
      width="60"
      height="60"
      rx="12"
      fill="rgba(255,255,255,0.07)"
      transform="rotate(25 0 0)"
    />
    <rect
      x="5%"
      y="10%"
      width="40"
      height="40"
      rx="8"
      fill="rgba(255,255,255,0.07)"
      transform="rotate(-15 0 0)"
    />
    <rect fill="url(#g1)" width="100%" height="100%" />
    <rect fill="url(#g2)" width="100%" height="100%" />
  </svg>
);

/* ─── Stat pill ─── */
const StatPill = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
    <Icon size={14} className="text-orange-200" />
    <span className="text-white/80 text-xs font-semibold">{label}</span>
    <span className="text-white font-black text-sm">{value}</span>
  </div>
);

/* ─── Field wrapper ─── */
const Field = ({ label, icon: Icon, children }) => (
  <div className="group">
    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
      <Icon size={14} className="text-orange-400" />
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full border border-gray-100 bg-gray-50/80 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none transition-all placeholder:text-gray-300";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
    avatar: "",
    role: "",
    _id: "",
  });
  const [myAnnonces, setMyAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [preview, setPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const [editingAnnonce, setEditingAnnonce] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    budget: "",
    category: "",
    location: "",
    image: null,
  });
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingAnnonce, setUpdatingAnnonce] = useState(false);
  const editImageInputRef = useRef(null);

  const [annonceToDelete, setAnnonceToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAnnonce, setDeletingAnnonce] = useState(false);

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        if (data.avatar) setPreview(data.avatar);
        fetchMyAnnonces(data._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAnnonces = async (userId) => {
    try {
      const res = await fetch("/api/annonces");
      const data = await res.json();
      if (res.ok && Array.isArray(data))
        setMyAnnonces(
          data.filter((a) => a.creator?._id === userId || a.creator === userId),
        );
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteAnnonce = (annonce) => {
    setAnnonceToDelete(annonce);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAnnonce = async () => {
    if (!annonceToDelete) return;
    setDeletingAnnonce(true);
    try {
      const res = await fetch(`/api/annonces/${annonceToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        setMyAnnonces(myAnnonces.filter((a) => a._id !== annonceToDelete._id));
        setIsDeleteModalOpen(false);
        setAnnonceToDelete(null);
        setMessage({ type: "success", text: "Annonce supprimée avec succès" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        const d = await res.json();
        alert(d.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setDeletingAnnonce(false);
    }
  };

  const openEditModal = (annonce) => {
    setEditingAnnonce(annonce);
    setEditForm({
      title: annonce.title,
      description: annonce.description,
      budget: annonce.budget || "",
      category: annonce.category,
      location: annonce.location,
      image: null,
    });
    setEditImagePreview(annonce.image);
    setIsEditModalOpen(true);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({ ...editForm, image: file });
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateAnnonce = async (e) => {
    e.preventDefault();
    setUpdatingAnnonce(true);
    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      formData.append("description", editForm.description);
      formData.append("category", editForm.category);
      formData.append("location", editForm.location);
      if (editForm.budget) formData.append("budget", editForm.budget);
      if (editForm.image) formData.append("image", editForm.image);
      const res = await fetch(`/api/annonces/${editingAnnonce._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        fetchMyAnnonces(profile._id);
        setIsEditModalOpen(false);
        setEditingAnnonce(null);
        setEditImagePreview(null);
        setMessage({
          type: "success",
          text: "Annonce mise à jour avec succès",
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        alert(data.message || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setUpdatingAnnonce(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const formData = new FormData();
      formData.append("bio", profile.bio);
      formData.append("location", profile.location);
      if (avatarFile) formData.append("avatarFile", avatarFile);
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const updatedUser = await res.json();
      if (res.ok) {
        setProfile(updatedUser);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: updatedUser.message || "Erreur lors de la mise à jour",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-200 animate-pulse">
            <Sparkles size={28} className="text-white" />
          </div>
          <p className="text-gray-400 font-semibold text-sm tracking-widest uppercase">
            Chargement...
          </p>
        </div>
      </div>
    );

  const initials = profile.username
    ? profile.username.slice(0, 2).toUpperCase()
    : "U";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg, #fafaf8 0%, #fff7ed 50%, #fafaf8 100%)",
      }}
    >
      <Navbar showSidebar={false} />

      <div className="pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* ── Hero Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-4xl overflow-hidden shadow-2xl shadow-orange-100/60 border border-orange-100"
          >
            {/* Cover */}
            <div className="relative h-52 bg-linear-to-br from-orange-500 via-orange-500 to-amber-400 overflow-hidden">
              <HeroBlobs />

              {/* Stats row */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="flex flex-wrap gap-2">
                  <StatPill
                    icon={Megaphone}
                    label="Annonces"
                    value={myAnnonces.length}
                  />
                  <StatPill
                    icon={Star}
                    label="Membre depuis"
                    value={
                      profile.createdAt
                        ? new Date(profile.createdAt).getFullYear()
                        : "—"
                    }
                  />
                  {profile.location && (
                    <StatPill icon={MapPin} label="" value={profile.location} />
                  )}
                </div>
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  {profile.role}
                </span>
              </div>
            </div>

            {/* Avatar strip */}
            <div className="bg-white px-8 pt-0 pb-8">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-8">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-28 h-28 rounded-[1.25rem] border-4 border-white shadow-xl shadow-orange-100 bg-orange-50 overflow-hidden">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-100 to-orange-50">
                        <span className="text-3xl font-black text-orange-400">
                          {initials}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                    title="Changer la photo"
                  >
                    <Camera size={16} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Name & email */}
                <div className="flex-1 sm:pb-1">
                  <h1 className="text-2xl font-black text-gray-900 leading-tight">
                    {profile.username}
                  </h1>
                  <p className="text-gray-400 text-sm font-medium mt-0.5">
                    {profile.email || profile.phone}
                  </p>
                </div>

                {/* Trending badge */}
                {myAnnonces.length > 0 && (
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-2xl sm:mb-1">
                    <TrendingUp size={16} className="text-orange-500" />
                    <span className="text-orange-600 font-bold text-sm">
                      Profil actif
                    </span>
                  </div>
                )}
              </div>

              {/* Feedback message */}
              <AnimatePresence>
                {message.text && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border text-sm font-bold ${
                      message.type === "success"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-red-50 border-red-100 text-red-600"
                    }`}
                  >
                    <span>{message.type === "success" ? "✓" : "✕"}</span>
                    {message.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Username — read-only, pre-filled from signup */}
                  <Field label="Nom d'affichage" icon={User}>
                    <div className="relative">
                      <input
                        type="text"
                        className={`${inputCls} bg-gray-100/80 cursor-not-allowed text-gray-500 pr-24`}
                        value={profile.username}
                        disabled
                        readOnly
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest bg-gray-200 text-gray-400 px-2 py-1 rounded-lg">
                        Fixe
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-gray-300 font-medium">
                      Défini lors de l'inscription, non modifiable.
                    </p>
                  </Field>

                  <Field label="Votre Wilaya" icon={MapPin}>
                    <select
                      className={inputCls}
                      value={profile.location}
                      onChange={(e) =>
                        setProfile({ ...profile, location: e.target.value })
                      }
                    >
                      <option value="">Sélectionner une wilaya</option>
                      {wilayas.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Bio / Description" icon={FileText}>
                  <textarea
                    rows="4"
                    className={`${inputCls} resize-none leading-relaxed`}
                    value={profile.bio}
                    onChange={(e) =>
                      setProfile({ ...profile, bio: e.target.value })
                    }
                    placeholder="Parlez-nous de vous, vos compétences, vos services…"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-linear-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-amber-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-3 cursor-pointer group text-base"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={22} />
                  ) : (
                    <>
                      <Save
                        size={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                      Enregistrer mon profil
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* ── Annonces Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-4xl shadow-xl shadow-orange-50 border border-orange-50 p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Megaphone size={18} className="text-orange-500" />
                </div>
                Mes Annonces
              </h2>
              {myAnnonces.length > 0 && (
                <span className="text-xs font-black text-orange-500 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full">
                  {myAnnonces.length} publiée{myAnnonces.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {myAnnonces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myAnnonces.map((annonce, i) => (
                  <motion.div
                    key={annonce._id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="group relative bg-linear-to-br from-gray-50 to-orange-50/30 border border-gray-100 hover:border-orange-200 rounded-3xl overflow-hidden transition-all hover:shadow-lg hover:shadow-orange-100/50"
                  >
                    {annonce.image && (
                      <div className="h-44 w-full overflow-hidden bg-gray-100">
                        <img
                          src={annonce.image}
                          alt={annonce.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider">
                          {annonce.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(annonce)}
                            className="w-8 h-8 bg-white text-blue-400 rounded-xl shadow-sm hover:bg-blue-500 hover:text-white transition-all cursor-pointer border border-gray-100 flex items-center justify-center"
                            title="Modifier"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => confirmDeleteAnnonce(annonce)}
                            className="w-8 h-8 bg-white text-red-400 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all cursor-pointer border border-gray-100 flex items-center justify-center"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-black text-gray-800 mb-1.5 text-sm leading-snug">
                        {annonce.title}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                        {annonce.description}
                      </p>

                      <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
                        <span className="font-black text-gray-900 text-sm">
                          {annonce.budget
                            ? `${annonce.budget} DA`
                            : "À discuter"}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-300">
                          <MapPin size={11} />
                          <span className="text-[11px] font-medium">
                            {annonce.location || "—"}
                          </span>
                          <span className="text-[11px] ml-1">
                            {new Date(annonce.createdAt).toLocaleDateString(
                              "fr-DZ",
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 rounded-3xl border-2 border-dashed border-orange-100 bg-orange-50/30">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-4">
                  <Megaphone size={24} className="text-orange-400" />
                </div>
                <p className="text-gray-400 font-bold text-sm">
                  Aucune annonce publiée pour l'instant.
                </p>
                <p className="text-gray-300 text-xs mt-1">
                  Vos annonces apparaîtront ici une fois publiées.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg bg-white rounded-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-7 py-5 border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Edit3 size={15} className="text-orange-500" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">
                    Modifier l'annonce
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 hover:bg-gray-100 rounded-xl flex items-center justify-center transition cursor-pointer"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1">
                <form onSubmit={handleUpdateAnnonce} className="p-7 space-y-5">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className={inputCls}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        Catégorie
                      </label>
                      <select
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({ ...editForm, category: e.target.value })
                        }
                        className={inputCls}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                        Wilaya
                      </label>
                      <select
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        className={inputCls}
                      >
                        {wilayas.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Budget (DA)
                    </label>
                    <input
                      type="number"
                      value={editForm.budget}
                      onChange={(e) =>
                        setEditForm({ ...editForm, budget: e.target.value })
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows="4"
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className={`${inputCls} resize-none leading-relaxed`}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <Camera size={13} /> Image
                    </label>
                    <div
                      className="relative h-36 w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group cursor-pointer"
                      onClick={() => editImageInputRef.current?.click()}
                    >
                      {editImagePreview ? (
                        <img
                          src={editImagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Camera size={28} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                        Changer l'image
                      </div>
                      <input
                        type="file"
                        ref={editImageInputRef}
                        onChange={handleEditImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3 border border-gray-200 rounded-2xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={updatingAnnonce}
                      className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {updatingAnnonce ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        "Enregistrer"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-sm bg-white rounded-4xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">
                Supprimer l'annonce ?
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-7">
                Êtes-vous sûr de vouloir supprimer{" "}
                <span className="font-black text-gray-800">
                  "{annonceToDelete?.title}"
                </span>{" "}
                ?<br />
                Cette action est irréversible.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDeleteAnnonce}
                  disabled={deletingAnnonce}
                  className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deletingAnnonce ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Oui, supprimer"
                  )}
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deletingAnnonce}
                  className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-2xl font-bold transition-all cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Profile;
