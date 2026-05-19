import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

const CATEGORIES = [
  "Plomberie",
  "Électricité",
  "Mécanique",
  "Beauté",
  "Ménage",
  "Jardinage",
  "Livraison",
  "Baby sitting",
  "Maçonnerie",
  "Peinture",
  "Charpenterie",
  "Autre",
];
const CAT_ICONS = {
  Plomberie: "mdi:pipe-wrench",
  Électricité: "mdi:lightning-bolt",
  Mécanique: "mdi:car-wrench",
  Beauté: "mdi:face-woman-shimmer-outline",
  Ménage: "mdi:broom",
  Jardinage: "mdi:flower-outline",
  Livraison: "mdi:truck-outline",
  "Baby sitting": "mdi:baby-face-outline",
  Maçonnerie: "mdi:hammer-wrench",
  Peinture: "mdi:brush-outline",
  Charpenterie: "mdi:toolbox-outline",
  Autre: "mdi:dots-horizontal-circle-outline",
};
const WILAYAS = [
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

/* ─────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: "Catégorie", icon: "mdi:tag-outline" },
  { id: 2, label: "Description", icon: "mdi:text-box-outline" },
  { id: 3, label: "Localisation", icon: "mdi:map-marker-outline" },
  { id: 4, label: "Photo", icon: "mdi:image-outline" },
];

export default function CreateAnnonce() {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    wilaya: "",
    budget: "",
    phone: "",
    image: null,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  /* validate per step */
  const canNext = () => {
    if (step === 1) return !!form.category;
    if (step === 2)
      return form.title.length >= 5 && form.description.length >= 10;
    if (step === 3) return !!form.wilaya && form.phone.length >= 9;
    return true;
  };

  const processFile = (file) => {
    if (!file?.type.startsWith("image/")) {
      setError("Fichier image requis.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Max 10 Mo.");
      return;
    }
    setError("");
    set("image", file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("description", form.description);
      fd.append("location", form.wilaya);
      fd.append("phone", form.phone);
      fd.append("status", "pending"); // Changed from "pending"
      if (form.budget) fd.append("budget", form.budget);
      if (form.image) fd.append("image", form.image);

      // Debug log
      console.log("Sending announcement:", {
        title: form.title,
        category: form.category,
        status: "pending",
      });

      const res = await fetch("/api/annonces", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Don't set Content-Type when using FormData
        },
        body: fd,
      });

      const data = await res.json();
      console.log("Response:", data);

      if (!res.ok)
        throw new Error(data.message || data.error || "Erreur serveur");
      setSuccess(true);
    } catch (e) {
      console.error("Error creating announcement:", e);
      setError(e.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  /* ── SUCCESS SCREEN ── */
  if (success)
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          background:
            "linear-gradient(160deg,#fafaf8 0%,#fff7ed 60%,#fafaf8 100%)",
        }}
      >
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="bg-white rounded-3xl border border-orange-100 shadow-2xl shadow-orange-100/50 p-10 max-w-md w-full text-center"
          >
            {/* animated check */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-300/40"
              >
                <Icon
                  icon="mdi:clock-check-outline"
                  className="text-5xl text-white"
                />
              </motion.div>
              {/* pulse ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.3, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.6,
                  ease: "easeOut",
                  delay: 0.4,
                }}
                className="absolute inset-0 rounded-3xl bg-orange-400/30"
              />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Annonce soumise !
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              Votre annonce est en cours d'examen par notre équipe.
            </p>
            <p className="text-gray-400 text-xs leading-relaxed mb-8">
              Vous serez notifié dès qu'elle sera approuvée ou rejetée —
              généralement en moins de 24h.
            </p>

            {/* status timeline */}
            <div className="flex items-center justify-center gap-0 mb-8">
              {[
                { icon: "mdi:send-outline", label: "Envoyée", done: true },
                {
                  icon: "mdi:clock-outline",
                  label: "En attente",
                  done: true,
                  active: true,
                },
                {
                  icon: "mdi:check-circle-outline",
                  label: "Approuvée",
                  done: false,
                },
              ].map((s, i, arr) => (
                <div key={i} className="flex items-center">
                  <div
                    className={`flex flex-col items-center gap-1 ${s.active ? "scale-105" : ""}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition
                    ${s.active ? "bg-amber-500 text-white shadow-lg shadow-amber-200" : s.done ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-300"}`}
                    >
                      <Icon icon={s.icon} />
                    </div>
                    <p
                      className={`text-[10px] font-bold ${s.active ? "text-amber-600" : s.done ? "text-orange-500" : "text-gray-300"}`}
                    >
                      {s.label}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mb-4 ${s.done ? "bg-orange-200" : "bg-gray-100"}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigate("/annonces", { state: { tab: "mes-annonces" } })
                }
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-orange-200 cursor-pointer"
              >
                Mes annonces
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setStep(1);
                  setForm({
                    category: "",
                    title: "",
                    description: "",
                    wilaya: "",
                    budget: "",
                    phone: "",
                    image: null,
                  });
                  setPreview(null);
                }}
                className="flex-1 py-3 bg-orange-50 hover:bg-orange-100 text-orange-600 font-black text-sm rounded-2xl border border-orange-100 transition cursor-pointer"
              >
                Nouvelle annonce
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );

  /* ── MAIN FORM ── */
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg,#fafaf8 0%,#fff7ed 60%,#fafaf8 100%)",
      }}
    >
      <div className="flex-1 flex items-start justify-center pt-24 pb-16 px-4">
        <div className="w-full max-w-xl">
          {/* back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 font-semibold mb-6 transition cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 group-hover:border-orange-300 flex items-center justify-center transition shadow-sm">
              <Icon icon="mdi:arrow-left" className="text-sm" />
            </div>
            Retour
          </button>

          {/* header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 leading-tight">
              Créer une annonce
            </h1>
            <p className="text-gray-400 text-sm mt-1.5 flex items-center gap-1.5">
              <Icon
                icon="mdi:shield-check-outline"
                className="text-orange-400"
              />
              Votre annonce sera examinée avant publication — délai &lt; 24h.
            </p>
          </div>

          {/* step indicator */}
          <div className="flex items-center gap-0 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <button
                  onClick={() => step > s.id && setStep(s.id)}
                  className={`flex items-center gap-1.5 transition ${step > s.id ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black transition-all
                    ${
                      step === s.id
                        ? "bg-orange-500 text-white shadow-md shadow-orange-200 scale-110"
                        : step > s.id
                          ? "bg-orange-100 text-orange-500"
                          : "bg-gray-100 text-gray-300"
                    }`}
                  >
                    {step > s.id ? (
                      <Icon icon="mdi:check" className="text-sm" />
                    ) : (
                      s.id
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold hidden sm:block ${step === s.id ? "text-orange-600" : step > s.id ? "text-gray-400" : "text-gray-300"}`}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${step > s.id ? "bg-orange-300" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-5 text-sm font-semibold"
              >
                <Icon
                  icon="mdi:alert-circle-outline"
                  className="text-lg shrink-0"
                />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-orange-50/60 p-8"
          >
            {/* ── STEP 1: category ── */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-black text-gray-900 mb-1">
                  Choisissez une catégorie
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                  Sélectionnez le type de service dont vous avez besoin.
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => set("category", cat)}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer
                        ${
                          form.category === cat
                            ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200"
                            : "bg-gray-50 text-gray-500 border-transparent hover:border-orange-200 hover:text-orange-500"
                        }`}
                    >
                      <Icon
                        icon={CAT_ICONS[cat]}
                        className={`text-2xl ${form.category === cat ? "text-white" : "text-gray-400"}`}
                      />
                      <span className="leading-tight text-center">{cat}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2: title + description ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-0.5">
                    Décrivez votre besoin
                  </h2>
                  <p className="text-gray-400 text-sm mb-5">
                    Plus c'est précis, plus vous recevrez des offres adaptées.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Titre <span className="text-orange-500">*</span>
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    maxLength={100}
                    placeholder="ex: Besoin d'un électricien en urgence à Alger"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-orange-400 focus:bg-white outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-300 transition"
                  />
                  <div className="flex justify-between mt-1">
                    {form.title.length < 5 && form.title.length > 0 && (
                      <span className="text-xs text-red-400 font-semibold">
                        Au moins 5 caractères
                      </span>
                    )}
                    <span className="text-xs text-gray-300 ml-auto">
                      {form.title.length}/100
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Description <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    maxLength={1000}
                    rows={5}
                    placeholder="Décrivez votre problème en détail : urgence, matériaux disponibles, accès au lieu, disponibilités…"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-orange-400 focus:bg-white outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-300 transition resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    {form.description.length < 10 &&
                      form.description.length > 0 && (
                        <span className="text-xs text-red-400 font-semibold">
                          Au moins 10 caractères
                        </span>
                      )}
                    <span className="text-xs text-gray-300 ml-auto">
                      {form.description.length}/1000
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: location + budget ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-0.5">
                    Localisation, contact & budget
                  </h2>
                  <p className="text-gray-400 text-sm mb-5">
                    Où êtes-vous, comment vous joindre, et quel est votre budget
                    ?
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Wilaya <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Icon
                      icon="mdi:map-marker-outline"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"
                    />
                    <select
                      value={form.wilaya}
                      onChange={(e) => set("wilaya", e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-orange-400 focus:bg-white outline-none text-sm font-semibold text-gray-800 transition cursor-pointer appearance-none"
                    >
                      <option value="">Choisir votre wilaya…</option>
                      {WILAYAS.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                    <Icon
                      icon="mdi:chevron-down"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Budget estimé{" "}
                    <span className="text-gray-300 font-medium normal-case tracking-normal">
                      (optionnel)
                    </span>
                  </label>
                  <div className="relative">
                    <Icon
                      icon="mdi:cash-multiple"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"
                    />
                    <input
                      type="number"
                      value={form.budget}
                      onChange={(e) => set("budget", e.target.value)}
                      min={0}
                      placeholder="0"
                      className="w-full pl-11 pr-16 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-orange-400 focus:bg-white outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-300 transition"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">
                      DA
                    </span>
                  </div>
                  {!form.budget && (
                    <p className="text-xs text-gray-300 mt-1.5 px-1">
                      Laissez vide pour afficher "À discuter"
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">
                    Numéro de téléphone{" "}
                    <span className="text-orange-500">*</span>
                  </label>
                  <div className="relative">
                    <Icon
                      icon="mdi:phone-outline"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none"
                    />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        set(
                          "phone",
                          e.target.value.replace(/[^\d+\s\-().]/g, ""),
                        )
                      }
                      placeholder="ex: 0555 12 34 56"
                      maxLength={15}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-orange-400 focus:bg-white outline-none text-sm font-semibold text-gray-800 placeholder:text-gray-300 transition"
                    />
                  </div>
                  {form.phone.length > 0 && form.phone.length < 9 && (
                    <p className="text-xs text-red-400 font-semibold mt-1.5 px-1">
                      Numéro invalide (min. 9 chiffres)
                    </p>
                  )}
                  <p className="text-xs text-gray-300 mt-1.5 px-1">
                    Visible par les techniciens intéressés par votre annonce.
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 4: image ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-black text-gray-900 mb-0.5">
                    Ajouter une photo
                  </h2>
                  <p className="text-gray-400 text-sm mb-5">
                    Une image aide les techniciens à mieux comprendre votre
                    besoin. <span className="text-gray-300">(optionnel)</span>
                  </p>
                </div>

                {!preview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      processFile(e.dataTransfer.files[0]);
                    }}
                    onClick={() => fileRef.current?.click()}
                    className={`h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all
                      ${dragOver ? "border-orange-400 bg-orange-50 scale-[1.01]" : "border-gray-200 bg-gray-50/50 hover:border-orange-300 hover:bg-orange-50/30"}`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${dragOver ? "bg-orange-100" : "bg-gray-100"}`}
                    >
                      <Icon
                        icon="mdi:cloud-upload-outline"
                        className={`text-3xl transition-colors ${dragOver ? "text-orange-500" : "text-gray-300"}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-gray-500">
                        {dragOver
                          ? "Déposez ici"
                          : "Cliquez ou glissez une image"}
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5">
                        JPG, PNG, WebP, HEIC… — Max 10 Mo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-orange-100 group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-52 object-contain bg-gray-50"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          set("image", null);
                          setPreview(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="opacity-0 group-hover:opacity-100 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg transition cursor-pointer"
                      >
                        <Icon icon="mdi:trash-can-outline" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur rounded-xl px-2.5 py-1 flex items-center gap-1.5">
                      <Icon
                        icon="mdi:image-check-outline"
                        className="text-white text-xs"
                      />
                      <span className="text-white text-[10px] font-bold">
                        Photo ajoutée
                      </span>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileRef}
                  onChange={(e) => processFile(e.target.files[0])}
                  accept="image/*"
                  className="hidden"
                />

                {/* preview of complete annonce */}
                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                    Récapitulatif
                  </p>
                  <div className="space-y-2 text-sm">
                    {[
                      { icon: "mdi:tag-outline", label: form.category },
                      { icon: "mdi:text-short", label: form.title },
                      { icon: "mdi:map-marker-outline", label: form.wilaya },
                      { icon: "mdi:phone-outline", label: form.phone },
                      {
                        icon: "mdi:cash-multiple",
                        label: form.budget
                          ? `${Number(form.budget).toLocaleString("fr-DZ")} DA`
                          : "À discuter",
                      },
                    ].map(({ icon, label }) => (
                      <div key={icon} className="flex items-center gap-2">
                        <Icon
                          icon={icon}
                          className="text-orange-400 text-base shrink-0"
                        />
                        <span className="text-gray-600 font-semibold truncate">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* navigation buttons */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-3.5 bg-white border border-gray-200 hover:border-orange-300 text-gray-600 hover:text-orange-600 font-black text-sm rounded-2xl transition cursor-pointer shadow-sm"
              >
                <Icon icon="mdi:arrow-left" />
                Précédent
              </button>
            )}
            {step < 4 ? (
              <button
                onClick={() => {
                  if (canNext()) setStep((s) => s + 1);
                }}
                disabled={!canNext()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl transition shadow-lg shadow-orange-200 cursor-pointer"
              >
                Suivant <Icon icon="mdi:arrow-right" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black text-sm rounded-2xl transition shadow-lg shadow-orange-200 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin text-lg" />
                    Envoi en cours…
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:send-outline" className="text-lg" />
                    Soumettre l'annonce
                  </>
                )}
              </button>
            )}
          </div>

          {/* info footer */}
          <div className="flex items-center gap-2 mt-6 px-1">
            <Icon
              icon="mdi:shield-lock-outline"
              className="text-gray-300 shrink-0"
            />
            <p className="text-xs text-gray-300 font-medium leading-snug">
              Votre annonce sera{" "}
              <strong className="text-gray-400">
                examinée par notre équipe
              </strong>{" "}
              avant d'être visible. Elle apparaîtra comme «En attente» dans vos
              annonces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
