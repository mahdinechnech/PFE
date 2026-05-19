import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Navbar from "../components/navbar";

/* ─── helpers ─── */
const resolveImage = (p) =>
  !p
    ? ""
    : p.startsWith("http")
      ? p
      : `${import.meta.env.VITE_API_URL || ""}${p}`;

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

const STATUS_CFG = {
  pending: {
    label: "En attente de validation",
    icon: "mdi:clock-outline",
    bar: "from-amber-400 to-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
  },
  approved: {
    label: "Annonce approuvée",
    icon: "mdi:check-circle-outline",
    bar: "from-emerald-400 to-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
  },

  rejected: {
    label: "Annonce rejetée",
    icon: "mdi:close-circle-outline",
    bar: "from-red-400 to-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
  },
  closed: {
    label: "Annonce fermée",
    icon: "mdi:lock-outline",
    bar: "from-gray-400 to-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
  },
};

/* ─── Skeleton ─── */
const DetailSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-80 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-3xl" />
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
        <div className="h-4 bg-gray-100 rounded-full w-1/4" />
        <div className="h-8 bg-gray-100 rounded-full w-3/4" />
        <div className="h-4 bg-gray-100 rounded-full w-full" />
        <div className="h-4 bg-gray-100 rounded-full w-5/6" />
        <div className="h-4 bg-gray-100 rounded-full w-4/6" />
      </div>
      <div className="space-y-4">
        <div className="h-48 bg-gray-100 rounded-2xl" />
        <div className="h-24 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  </div>
);

/* ─── Message Bubble ─── */
const Bubble = ({ msg, isMe }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.2 }}
    className={`flex gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}
  >
    <div
      className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 overflow-hidden
      ${isMe ? "bg-gradient-to-br from-orange-400 to-orange-600" : "bg-gradient-to-br from-gray-600 to-gray-800"}`}
    >
      {msg.avatar ? (
        <img
          src={resolveImage(msg.avatar)}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        (msg.sender?.[0] || "?").toUpperCase()
      )}
    </div>
    <div
      className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}
    >
      <div
        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium shadow-sm
        ${
          isMe
            ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
        }`}
      >
        {msg.text}
      </div>
      <span className="text-[10px] text-gray-300 font-medium px-1">
        {msg.time}
      </span>
    </div>
  </motion.div>
);

/* ═══════════ PAGE ═══════════ */
export default function AnnonceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("detail"); // detail | contact
  const [messages, setMessages] = useState([]);
  const [msgInput, setMsgInput] = useState("");
  const [msgSending, setMsgSending] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [lightbox, setLightbox] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("savedAnnonces") || "[]");
    setSaved(ids.includes(id));
  }, [id]);

  useEffect(() => {
    const fetchAnnonce = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/annonces/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Annonce introuvable");
        setAnnonce(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnonce();
  }, [id]);

  // fetch messages
  useEffect(() => {
    if (!annonce) return;
    const fetchMsgs = async () => {
      try {
        const res = await fetch(`/api/annonces/${id}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(
            data.map((m) => ({
              id: m._id,
              sender: m.sender?.username || "?",
              avatar: m.sender?.avatar,
              text: m.content,
              time: new Date(m.createdAt).toLocaleTimeString("fr-DZ", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isMe: m.sender?._id === user?._id,
            })),
          );
        }
      } catch {}
    };
    fetchMsgs();
  }, [annonce, id, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const toggleSave = () => {
    const ids = JSON.parse(localStorage.getItem("savedAnnonces") || "[]");
    const updated = ids.includes(id)
      ? ids.filter((x) => x !== id)
      : [...ids, id];
    localStorage.setItem("savedAnnonces", JSON.stringify(updated));
    setSaved(!saved);
  };

  const handleShare = async () => {
    try {
      if (navigator.share)
        await navigator.share({
          title: annonce?.title,
          url: window.location.href,
        });
      else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = msgInput.trim();
    if (!text) return;
    setMsgSending(true);
    setMsgError("");
    try {
      const res = await fetch(`/api/annonces/${id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      setMessages((p) => [
        ...p,
        {
          id: data._id || Date.now(),
          sender: user?.username || "Moi",
          avatar: user?.avatar,
          text,
          time: new Date().toLocaleTimeString("fr-DZ", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: true,
        },
      ]);
      setMsgInput("");
    } catch (e) {
      setMsgError(e.message || "Impossible d'envoyer.");
    } finally {
      setMsgSending(false);
    }
  };

  const isOwner =
    annonce &&
    user &&
    (annonce.creator?._id === user._id ||
      annonce.creator?._id?.toString() === user._id ||
      annonce.creator === user._id);
  const scfg = STATUS_CFG[annonce?.status] || STATUS_CFG.open;
  const imgSrc = resolveImage(annonce?.image);
  const catIcon = CAT_ICONS[annonce?.category] || "mdi:briefcase-outline";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(160deg,#fafaf8 0%,#fff7ed 50%,#fafaf8 100%)",
      }}
    >
      <Navbar showSidebar={false} />

      {/* lightbox */}
      <AnimatePresence>
        {lightbox && imgSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            style={{
              background: "rgba(5,5,5,0.92)",
              backdropFilter: "blur(12px)",
            }}
          >
            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              src={imgSrc}
              alt={annonce?.title}
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white transition cursor-pointer"
            >
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* back */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 font-bold mb-8 transition cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 group-hover:border-orange-300 flex items-center justify-center transition shadow-sm">
            <Icon icon="mdi:arrow-left" className="text-base" />
          </div>
          Retour aux annonces
        </motion.button>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-32 gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
              <Icon
                icon="mdi:alert-circle-outline"
                className="text-3xl text-red-400"
              />
            </div>
            <p className="text-gray-500 font-bold text-sm">{error}</p>
            <button
              onClick={() => navigate("/annonces")}
              className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-black hover:bg-orange-600 transition cursor-pointer"
            >
              Toutes les annonces
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── HERO IMAGE ── */}
            <div
              className="relative rounded-3xl overflow-hidden mb-8 group"
              style={{ background: "linear-gradient(135deg,#fff7ed,#fef3c7)" }}
            >
              <div className="h-72 sm:h-96 relative overflow-hidden">
                {imgSrc && !imgError ? (
                  <img
                    src={imgSrc}
                    alt={annonce.title}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02] cursor-zoom-in"
                    onClick={() => setLightbox(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Icon
                        icon={catIcon}
                        className="text-9xl text-orange-400"
                      />
                    </div>
                  </div>
                )}
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* top actions */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 bg-white/90 backdrop-blur text-orange-600 text-xs font-black uppercase px-3 py-1.5 rounded-xl border border-orange-100/60 shadow-md tracking-wider">
                    <Icon icon={catIcon} className="text-sm" />
                    {annonce.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {imgSrc && !imgError && (
                    <button
                      onClick={() => setLightbox(true)}
                      title="Agrandir"
                      className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-gray-600 hover:text-orange-500 shadow-md transition cursor-pointer"
                    >
                      <Icon icon="mdi:fullscreen" className="text-base" />
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    title="Partager"
                    className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-gray-600 hover:text-orange-500 shadow-md transition cursor-pointer"
                  >
                    <Icon
                      icon={copied ? "mdi:check" : "mdi:share-variant-outline"}
                      className="text-base"
                    />
                  </button>
                  <button
                    onClick={toggleSave}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition cursor-pointer ${saved ? "bg-orange-500 text-white shadow-orange-300" : "bg-white/90 backdrop-blur text-gray-500 hover:bg-orange-500 hover:text-white"}`}
                  >
                    <Icon
                      icon={saved ? "mdi:heart" : "mdi:heart-outline"}
                      className="text-base"
                    />
                  </button>
                  {isOwner && (
                    <>
                      <Link
                        to={`/annonces/${id}/edit`}
                        title="Modifier"
                        className="w-9 h-9 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white shadow-md transition cursor-pointer"
                      >
                        <Icon icon="mdi:pencil-outline" className="text-base" />
                      </Link>
                    </>
                  )}
                </div>

                {/* bottom title overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg line-clamp-2">
                        {annonce.title}
                      </h1>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {annonce.location && (
                          <span className="flex items-center gap-1 text-white/80 text-sm font-semibold">
                            <Icon
                              icon="mdi:map-marker"
                              className="text-orange-300"
                            />
                            {annonce.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-white/80 text-sm font-semibold">
                          <Icon
                            icon="mdi:calendar"
                            className="text-orange-300"
                          />
                          {new Date(annonce.createdAt).toLocaleDateString(
                            "fr-DZ",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 bg-white/90 backdrop-blur rounded-2xl px-4 py-2.5 text-right shadow-lg">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Budget
                      </p>
                      <p className="text-lg font-black text-gray-900 leading-tight">
                        {annonce.budget > 0
                          ? `${Number(annonce.budget).toLocaleString("fr-DZ")} DA`
                          : "À discuter"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── STATUS BANNER (owner only) ── */}
            {isOwner && annonce.status !== "pending" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl border mb-6 ${scfg.bg} ${scfg.border}`}
              >
                <div
                  className={`w-2 h-10 rounded-full bg-gradient-to-b ${scfg.bar} shrink-0`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-black ${scfg.text} flex items-center gap-2`}
                  >
                    <Icon icon={scfg.icon} className="text-base" />
                    {scfg.label}
                  </p>
                  {annonce.status === "pending" && (
                    <p className={`text-xs mt-0.5 ${scfg.text} opacity-70`}>
                      Votre annonce est en cours de vérification par notre
                      équipe. Délai : moins de 24h.
                    </p>
                  )}
                  {annonce.status === "rejected" && (
                    <p className={`text-xs mt-0.5 ${scfg.text} opacity-70`}>
                      {annonce.rejectReason
                        ? "Raison : " + annonce.rejectReason
                        : "Contactez le support pour plus d'informations."}
                    </p>
                  )}
                  {annonce.status === "approved" && (
                    <p className={`text-xs mt-0.5 ${scfg.text} opacity-70`}>
                      Votre annonce est maintenant visible par tous les
                      utilisateurs.
                    </p>
                  )}
                </div>
                {annonce.status === "rejected" && (
                  <Link
                    to="/create-annonce"
                    className={`shrink-0 px-3 py-2 rounded-xl text-xs font-black border ${scfg.border} ${scfg.text} hover:opacity-80 transition cursor-pointer`}
                  >
                    Recréer
                  </Link>
                )}
              </motion.div>
            )}

            {/* ── BODY GRID ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT: tabs */}
              <div className="lg:col-span-2 space-y-6">
                {/* tab switcher */}
                <div className="flex bg-white rounded-2xl border border-gray-100 p-1.5 gap-1 shadow-sm">
                  {[
                    {
                      key: "detail",
                      label: "Détails",
                      icon: "mdi:text-box-outline",
                    },
                    {
                      key: "contact",
                      label: "Contacter",
                      icon: "mdi:message-text-outline",
                      badge: messages.length || null,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition cursor-pointer relative
                        ${activeTab === tab.key ? "bg-orange-500 text-white shadow-md shadow-orange-200" : "text-gray-400 hover:text-orange-500"}`}
                    >
                      <Icon icon={tab.icon} className="text-base" />
                      {tab.label}
                      {tab.badge > 0 && (
                        <span
                          className={`min-w-5 h-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center ${activeTab === tab.key ? "bg-white/30 text-white" : "bg-orange-100 text-orange-600"}`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── DETAIL TAB ── */}
                {activeTab === "detail" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    {/* description */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                        <Icon
                          icon="mdi:text-box-outline"
                          className="text-orange-400"
                        />
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                          Description
                        </h2>
                      </div>
                      <div className="px-6 py-5">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {annonce.description}
                        </p>
                      </div>
                    </div>

                    {/* details grid */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                        <Icon
                          icon="mdi:information-outline"
                          className="text-orange-400"
                        />
                        <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest">
                          Informations
                        </h2>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-3">
                        {[
                          {
                            icon: "mdi:tag-outline",
                            label: "Catégorie",
                            value: annonce.category,
                          },
                          {
                            icon: "mdi:map-marker-outline",
                            label: "Wilaya",
                            value: annonce.location || "Non précisé",
                          },
                          {
                            icon: "mdi:cash-multiple",
                            label: "Budget",
                            value:
                              annonce.budget > 0
                                ? `${Number(annonce.budget).toLocaleString("fr-DZ")} DA`
                                : "À discuter",
                          },
                          {
                            icon: "mdi:calendar-outline",
                            label: "Publiée le",
                            value: new Date(
                              annonce.createdAt,
                            ).toLocaleDateString("fr-DZ", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }),
                          },
                        ].map(({ icon, label, value }) => (
                          <div
                            key={label}
                            className="flex items-center gap-3 bg-gray-50/70 rounded-xl p-3.5"
                          >
                            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                              <Icon icon={icon} className="text-orange-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                {label}
                              </p>
                              <p className="text-sm font-black text-gray-800 truncate">
                                {value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── CONTACT TAB ── */}
                {activeTab === "contact" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                    style={{ height: "520px" }}
                  >
                    {/* header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm overflow-hidden shrink-0">
                        {annonce.creator?.avatar ? (
                          <img
                            src={resolveImage(annonce.creator.avatar)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (annonce.creator?.username?.[0] || "?").toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">
                          {annonce.creator?.username || "Prestataire"}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs text-gray-400 font-medium">
                            Disponible
                          </span>
                        </div>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        {annonce.creator?.phone && (
                          <>
                            <a
                              href={`tel:${annonce.creator.phone}`}
                              title="Appeler"
                              className="w-9 h-9 bg-orange-50 hover:bg-orange-500 text-orange-500 hover:text-white rounded-xl flex items-center justify-center transition cursor-pointer border border-orange-100 hover:border-orange-500"
                            >
                              <Icon
                                icon="mdi:phone-outline"
                                className="text-base"
                              />
                            </a>
                            <a
                              href={`https://wa.me/${annonce.creator.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp"
                              className="w-9 h-9 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white rounded-xl flex items-center justify-center transition cursor-pointer border border-green-100 hover:border-green-500"
                            >
                              <Icon icon="mdi:whatsapp" className="text-base" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* messages area */}
                    <div
                      className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-8">
                          <div className="w-16 h-16 rounded-2xl bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center">
                            <Icon
                              icon="mdi:message-text-outline"
                              className="text-3xl text-orange-300"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-700">
                              Démarrez la conversation
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Envoyez un message au prestataire pour discuter
                              des détails.
                            </p>
                          </div>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <Bubble key={msg.id} msg={msg} isMe={msg.isMe} />
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* divider */}
                    <div className="border-t border-gray-100" />

                    {/* message input */}
                    {user ? (
                      <div className="px-4 py-3">
                        {msgError && (
                          <p className="text-xs text-red-500 font-semibold mb-2 px-1">
                            {msgError}
                          </p>
                        )}
                        <form
                          onSubmit={sendMessage}
                          className="flex items-end gap-2"
                        >
                          <div className="flex-1 bg-gray-50 border border-gray-200 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 rounded-2xl px-4 py-2.5 transition">
                            <textarea
                              value={msgInput}
                              onChange={(e) => setMsgInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  sendMessage(e);
                                }
                              }}
                              placeholder="Écrivez votre message… (Entrée pour envoyer)"
                              maxLength={500}
                              rows={2}
                              className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-300 font-medium outline-none resize-none"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={msgSending || !msgInput.trim()}
                            className="w-11 h-11 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center shadow-md shadow-orange-200 transition cursor-pointer shrink-0 self-end"
                          >
                            {msgSending ? (
                              <Icon
                                icon="mdi:loading"
                                className="animate-spin text-base"
                              />
                            ) : (
                              <Icon icon="mdi:send" className="text-base" />
                            )}
                          </button>
                        </form>
                        <p className="text-[10px] text-gray-300 mt-1.5 px-1 text-right">
                          {msgInput.length}/500
                        </p>
                      </div>
                    ) : (
                      <div className="px-5 py-4 text-center">
                        <p className="text-sm text-gray-400 font-medium mb-3">
                          Connectez-vous pour envoyer un message.
                        </p>
                        <Link
                          to="/login"
                          className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-black hover:bg-orange-600 transition shadow-md shadow-orange-200"
                        >
                          Se connecter
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <div className="space-y-5">
                {/* creator card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* top accent bar */}
                  <div className="h-1.5 bg-linear-to-r from-orange-400 to-amber-400" />
                  <div className="p-5">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-4">
                      Prestataire
                    </p>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-xl overflow-hidden shrink-0 shadow-lg shadow-orange-200">
                        {annonce.creator?.avatar ? (
                          <img
                            src={resolveImage(annonce.creator.avatar)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (annonce.creator?.username?.[0] || "?").toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-gray-900 truncate">
                          {annonce.creator?.username || "Anonyme"}
                        </p>
                        {annonce.creator?.role && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-lg tracking-wider">
                            {annonce.creator.role}
                          </span>
                        )}
                        {annonce.creator?.wilaya && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Icon
                              icon="mdi:map-marker-outline"
                              className="text-sm"
                            />
                            {annonce.creator.wilaya}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isOwner &&
                      (annonce.status === "pending" ||
                        annonce.status === "approved") && (
                        <div className="space-y-2">
                          <button
                            onClick={() => setActiveTab("contact")}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-xl shadow-md shadow-orange-200 transition cursor-pointer"
                          >
                            <Icon
                              icon="mdi:message-text-outline"
                              className="text-base"
                            />
                            Envoyer un message
                          </button>
                          {annonce.creator?.phone && (
                            <div className="grid grid-cols-2 gap-2">
                              <a
                                href={`tel:${annonce.creator.phone}`}
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-black text-xs rounded-xl border border-gray-200 transition cursor-pointer"
                              >
                                <Icon
                                  icon="mdi:phone-outline"
                                  className="text-sm"
                                />
                                Appeler
                              </a>
                              <a
                                href={`https://wa.me/${annonce.creator.phone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1.5 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-black text-xs rounded-xl border border-green-200 transition cursor-pointer"
                              >
                                <Icon icon="mdi:whatsapp" className="text-sm" />
                                WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                    {isOwner && (
                      <div className="space-y-2 pt-1">
                        <Link
                          to={`/annonces/${id}/edit`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-black text-xs rounded-xl border border-blue-100 transition cursor-pointer"
                        >
                          <Icon icon="mdi:pencil-outline" />
                          Modifier l'annonce
                        </Link>
                        <button
                          onClick={() =>
                            navigate("/annonces", {
                              state: { tab: "mes-annonces" },
                            })
                          }
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-black text-xs rounded-xl border border-gray-100 transition cursor-pointer"
                        >
                          <Icon icon="mdi:bullhorn-outline" />
                          Mes annonces
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* quick info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    En résumé
                  </p>
                  {[
                    {
                      icon: "mdi:tag-outline",
                      label: "Catégorie",
                      value: annonce.category,
                    },
                    {
                      icon: "mdi:map-marker-outline",
                      label: "Lieu",
                      value: annonce.location || "—",
                    },
                    {
                      icon: "mdi:cash-multiple",
                      label: "Budget",
                      value:
                        annonce.budget > 0
                          ? `${Number(annonce.budget).toLocaleString("fr-DZ")} DA`
                          : "À discuter",
                    },
                    {
                      icon: "mdi:calendar-outline",
                      label: "Date",
                      value: new Date(annonce.createdAt).toLocaleDateString(
                        "fr-DZ",
                        { day: "numeric", month: "short", year: "numeric" },
                      ),
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                        <Icon icon={icon} className="text-orange-500 text-sm" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide leading-none">
                          {label}
                        </p>
                        <p className="text-xs font-black text-gray-700 truncate mt-0.5">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* save + share */}
                <div className="flex gap-2">
                  <button
                    onClick={toggleSave}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border transition cursor-pointer
                      ${saved ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200" : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-500"}`}
                  >
                    <Icon icon={saved ? "mdi:heart" : "mdi:heart-outline"} />
                    {saved ? "Sauvegardée" : "Sauvegarder"}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border border-gray-200 bg-white text-gray-500 hover:border-orange-300 hover:text-orange-500 transition cursor-pointer"
                  >
                    <Icon
                      icon={copied ? "mdi:check" : "mdi:share-variant-outline"}
                    />
                    {copied ? "Copié !" : "Partager"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
