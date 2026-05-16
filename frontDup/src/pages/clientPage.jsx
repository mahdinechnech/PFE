import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Navbar from "../components/navbar";

/* ─── constants ─── */
const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents", icon: "mdi:clock-outline" },
  { value: "oldest", label: "Plus anciens", icon: "mdi:clock-check-outline" },
  { value: "price_asc", label: "Prix croissant", icon: "mdi:sort-ascending" },
  {
    value: "price_desc",
    label: "Prix décroissant",
    icon: "mdi:sort-descending",
  },
];

const VIEW_MODES = [
  { value: "grid", icon: "mdi:view-grid-outline" },
  { value: "list", icon: "mdi:view-list-outline" },
];

// "Tous" is UI-only, not in the backend enum
const CATEGORIES = [
  "Tous",
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
  Tous: "mdi:apps",
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

const NAV_ITEMS = [
  {
    id: "explorer",
    label: "Explorer",
    icon: "mdi:compass-outline",
    activeIcon: "mdi:compass",
  },
  {
    id: "mes-annonces",
    label: "Mes Annonces",
    icon: "mdi:bullhorn-outline",
    activeIcon: "mdi:bullhorn",
  },
  {
    id: "ma-liste",
    label: "Ma Liste",
    icon: "mdi:heart-outline",
    activeIcon: "mdi:heart",
  },
  {
    id: "parametres",
    label: "Paramètres",
    icon: "mdi:cog-outline",
    activeIcon: "mdi:cog",
  },
];

/* ─── helpers ─── */
// Backend stores images as "/uploads/filename" — prepend origin if needed
const resolveImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_API_URL || ""}${path}`;
};

/* ─── skeleton card ─── */
const SkeletonCard = () => (
  <div className="bg-white rounded-[1.25rem] overflow-hidden border border-gray-100 animate-pulse">
    <div className="h-44 bg-gray-100" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-100 rounded-full w-1/3" />
      <div className="h-4 bg-gray-100 rounded-full w-3/4" />
      <div className="h-3 bg-gray-100 rounded-full w-full" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-100 rounded-full w-1/4" />
        <div className="h-8 w-8 bg-gray-100 rounded-xl" />
      </div>
    </div>
  </div>
);

/* ─── announce card ─── */
const AnnounceCard = ({
  annonce,
  saved,
  onToggleSave,
  viewMode,
  onDelete,
  isOwner = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const isList = viewMode === "list";
  const imgSrc = resolveImage(annonce.image);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: isList ? 0 : -4 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative bg-white border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/40 rounded-[1.25rem] overflow-hidden transition-all duration-300 cursor-pointer ${
        isList ? "flex" : "flex flex-col"
      }`}
    >
      {/* image */}
      <div
        className={`relative overflow-hidden bg-linear-to-br from-orange-50 to-amber-50 shrink-0 ${
          isList ? "w-52 min-h-35" : "h-44 w-full"
        }`}
      >
        {imgSrc && !imgError ? (
          <img
            src={imgSrc}
            alt={annonce.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon
              icon={CAT_ICONS[annonce.category] || "mdi:image-outline"}
              className="text-4xl text-orange-200"
            />
          </div>
        )}

        {/* category badge */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-orange-600 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm border border-orange-100/50 tracking-wider">
          {annonce.category}
        </span>

        {/* status badge */}
        {annonce.status === "closed" && (
          <span className="absolute bottom-3 left-3 bg-gray-800/80 backdrop-blur-sm text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider">
            Fermée
          </span>
        )}

        {/* save button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave(annonce._id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all cursor-pointer ${
            saved
              ? "bg-orange-500 text-white shadow-orange-200"
              : "bg-white/90 backdrop-blur-sm text-gray-400 hover:bg-orange-500 hover:text-white"
          }`}
        >
          <Icon
            icon={saved ? "mdi:heart" : "mdi:heart-outline"}
            className="text-base"
          />
        </button>

        {/* delete button */}
        {isOwner && (
          <button
            onClick={(e) => {
              e.stopPropagation();

              const confirmDelete = window.confirm(
                "Voulez-vous vraiment supprimer cette annonce ?",
              );

              if (confirmDelete) {
                onDelete(annonce._id);
              }
            }}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all cursor-pointer bg-red-500/90 text-white hover:bg-red-600 backdrop-blur-sm"
          >
            <Icon icon="mdi:trash-can-outline" className="text-base" />
          </button>
        )}
      </div>

      {/* content */}
      <div className={`flex flex-col flex-1 ${isList ? "p-5" : "p-4"}`}>
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-6 h-6 rounded-lg bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[10px] font-black overflow-hidden shrink-0">
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

          <span className="text-xs text-gray-400 font-semibold truncate">
            {annonce.creator?.username || "Anonyme"}
          </span>

          <span className="ml-auto text-[10px] text-gray-300 font-medium shrink-0">
            {new Date(annonce.createdAt).toLocaleDateString("fr-DZ", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>

        <h3
          className={`font-black text-gray-900 leading-snug mb-1.5 group-hover:text-orange-600 transition-colors line-clamp-2 ${
            isList ? "text-base" : "text-sm"
          }`}
        >
          {annonce.title}
        </h3>

        <p
          className={`text-gray-400 text-xs leading-relaxed flex-1 ${
            isList ? "line-clamp-3" : "line-clamp-2"
          }`}
        >
          {annonce.description}
        </p>

        {annonce.location && (
          <div className="flex items-center gap-1 mt-2 text-gray-300">
            <Icon icon="mdi:map-marker-outline" className="text-sm shrink-0" />
            <span className="text-[11px] font-semibold truncate">
              {annonce.location}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <span className="text-base font-black text-gray-900">
            {annonce.budget && annonce.budget > 0
              ? `${Number(annonce.budget).toLocaleString("fr-DZ")} DA`
              : "À discuter"}
          </span>

          <Link
            to={`/annonces/${annonce._id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-500 text-orange-500 hover:text-white text-xs font-black rounded-xl transition-all border border-orange-100 hover:border-orange-500"
          >
            Voir <Icon icon="mdi:arrow-right" className="text-sm" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── empty saved list view ─── */
const EmptyList = ({ onExplore }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-28 gap-5"
  >
    <div className="w-24 h-24 rounded-3xl bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center">
      <Icon icon="mdi:heart-outline" className="text-5xl text-orange-300" />
    </div>
    <div className="text-center">
      <h3 className="text-lg font-black text-gray-800">Votre liste est vide</h3>
      <p className="text-gray-400 text-sm mt-1 font-medium">
        Ajoutez des annonces à votre liste en cliquant sur le cœur.
      </p>
    </div>
    <button
      onClick={onExplore}
      className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-black hover:bg-orange-600 transition cursor-pointer shadow-lg shadow-orange-200"
    >
      Explorer les annonces
    </button>
  </motion.div>
);

/* ─── settings panel ─── */
const SettingsPanel = ({ user }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-xl mx-auto space-y-5 py-4"
  >
    <h2 className="text-2xl font-black text-gray-900">Paramètres</h2>

    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-xl overflow-hidden shrink-0">
        {user?.avatar ? (
          <img
            src={resolveImage(user.avatar)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          (user?.username?.[0] || "?").toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-900 truncate">{user?.username}</p>
        <p className="text-xs text-gray-400 font-medium truncate">
          {user?.email || user?.phone}
        </p>
        <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase rounded-lg tracking-wider">
          {user?.role}
        </span>
      </div>
      <Link
        to="/profile"
        className="shrink-0 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-black rounded-xl transition border border-orange-100"
      >
        Modifier
      </Link>
    </div>

    {[
      {
        icon: "mdi:account-edit-outline",
        label: "Modifier le profil",
        desc: "Changer votre photo, bio et wilaya",
        to: "/profile",
      },
      {
        icon: "mdi:lock-outline",
        label: "Mot de passe",
        desc: "Modifier votre mot de passe",
        to: "/profile/password",
      },
      {
        icon: "mdi:bell-outline",
        label: "Notifications",
        desc: "Gérer vos préférences de notification",
        to: "/profile/notifications",
      },
    ].map(({ icon, label, desc, to }) => (
      <Link
        key={label}
        to={to}
        className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-orange-200 hover:shadow-md hover:shadow-orange-50 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors shrink-0">
          <Icon icon={icon} className="text-orange-500 text-xl" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-gray-800 group-hover:text-orange-600 transition-colors">
            {label}
          </p>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
        <Icon
          icon="mdi:chevron-right"
          className="text-gray-300 group-hover:text-orange-400 transition-colors"
        />
      </Link>
    ))}
  </motion.div>
);

/* ═══════════════════════════════ MAIN PAGE ═══════════════════════════════ */
export default function AnnoncesPage() {
  const navigate = useNavigate();
  const searchLoc = useLocation(); // FIX: was assigned useNavigate() by mistake
  const searchParams = new URLSearchParams(searchLoc.search);

  /* layout */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("explorer");

  /* annonces state — single source of truth, no duplicate useState/useQuery */
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sort, setSort] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [category, setCategory] = useState(
    searchParams.get("category") || "Tous",
  );
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedQ, setDebouncedQ] = useState(search);
  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("savedAnnonces") || "[]");
    } catch {
      return [];
    }
  });
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const sortRef = useRef(null);

  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  });

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  /* close sort dropdown on outside click */
  useEffect(() => {
    const h = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* fetch annonces from backend — GET /api/annonces */
  const fetchAnnonces = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/annonces");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur serveur");
      setAnnonces(data); // data is an array of populated annonces
    } catch (err) {
      setError(err.message || "Impossible de charger les annonces.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAnnonces();
  }, [fetchAnnonces]);

  /* persist saved list */
  useEffect(() => {
    localStorage.setItem("savedAnnonces", JSON.stringify(savedIds));
  }, [savedIds]);

  const toggleSave = useCallback((id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleDeleteAnnonce = useCallback(
    async (id) => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`/api/annonces/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Erreur suppression");
        }

        // remove from annonces
        setAnnonces((prev) => prev.filter((a) => a._id !== id));

        // remove from saved
        setSavedIds((prev) => prev.filter((x) => x !== id));
      } catch (err) {
        alert(err.message || "Impossible de supprimer l'annonce");
      }
    },
    [setAnnonces],
  );

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  /* filter + sort — status "open" filter matches backend default */
  const filtered = annonces
    .filter((a) => {
      // Only show open annonces in the explorer
      if (activeNav === "explorer" && a.status === "closed") return false;

      const qMatch =
        !debouncedQ ||
        [a.title, a.description, a.category, a.location]
          .join(" ")
          .toLowerCase()
          .includes(debouncedQ.toLowerCase());
      const cMatch = category === "Tous" || a.category === category;
      const minMatch =
        !searchParams.get("priceMin") ||
        Number(a.budget) >= Number(searchParams.get("priceMin"));
      const maxMatch =
        !searchParams.get("priceMax") ||
        Number(a.budget) <= Number(searchParams.get("priceMax"));
      const wMatch =
        !searchParams.get("wilaya") ||
        a.location === searchParams.get("wilaya");
      return qMatch && cMatch && minMatch && maxMatch && wMatch;
    })
    .sort((a, b) => {
      if (sort === "recent")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === "price_asc") return (a.budget || 0) - (b.budget || 0);
      if (sort === "price_desc") return (b.budget || 0) - (a.budget || 0);
      return 0;
    });

  // FIX: compare both populated object id and raw ObjectId string
  const savedAnnonces = annonces.filter((a) => savedIds.includes(a._id));
  const myAnnonces = annonces.filter(
    (a) =>
      a.creator?._id === user?._id ||
      a.creator?._id?.toString() === user?._id ||
      a.creator === user?._id,
  );
  const paginated = filtered.slice(0, page * PER_PAGE);
  const hasMore = paginated.length < filtered.length;

  const activeFiltersCount = [
    searchParams.get("priceMin"),
    searchParams.get("priceMax"),
    searchParams.get("wilaya"),
    category !== "Tous" ? category : null,
  ].filter(Boolean).length;

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label;
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  /* ── render ── */
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(160deg,#fafaf8 0%,#fff7ed 60%,#fafaf8 100%)",
      }}
    >
      <Navbar showSidebar={false} />

      <div className="flex flex-1 pt-17">
        {/* ══════════ SIDEBAR ══════════ */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? 72 : 240 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed left-0 top-17 h-[calc(100vh-68px)] bg-white border-r border-gray-100 flex flex-col z-40 shadow-sm overflow-hidden"
          style={{ minWidth: sidebarCollapsed ? 72 : 240 }}
        >
          {/* collapse toggle */}
          <div
            className={`flex items-center px-4 py-4 border-b border-gray-100 ${sidebarCollapsed ? "justify-center" : "justify-between"}`}
          >
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img
                      src={resolveImage(user.avatar)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-gray-900 truncate leading-tight">
                    {user?.username || "Utilisateur"}
                  </p>
                  <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider truncate">
                    {user?.role || "client"}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              className="w-8 h-8 rounded-xl hover:bg-orange-50 flex items-center justify-center transition-all cursor-pointer shrink-0 text-gray-400 hover:text-orange-500"
            >
              <Icon
                icon={
                  sidebarCollapsed ? "mdi:chevron-right" : "mdi:chevron-left"
                }
                className="text-lg"
              />
            </button>
          </div>

          {/* nav items */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                      : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                >
                  {isActive && !sidebarCollapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white/50 rounded-r-full" />
                  )}
                  <Icon
                    icon={isActive ? item.activeIcon : item.icon}
                    className={`text-xl shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                  />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-bold truncate">
                      {item.label}
                    </span>
                  )}

                  {item.id === "ma-liste" && savedIds.length > 0 && (
                    <span
                      className={`ml-auto shrink-0 min-w-5 h-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center ${isActive ? "bg-white/30 text-white" : "bg-orange-100 text-orange-600"} ${sidebarCollapsed ? "absolute -top-1 -right-1 min-w-4 h-4" : ""}`}
                    >
                      {savedIds.length}
                    </span>
                  )}
                  {item.id === "mes-annonces" && myAnnonces.length > 0 && (
                    <span
                      className={`ml-auto shrink-0 min-w-5 h-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center ${isActive ? "bg-white/30 text-white" : "bg-orange-100 text-orange-600"} ${sidebarCollapsed ? "absolute -top-1 -right-1 min-w-4 h-4" : ""}`}
                    >
                      {myAnnonces.length}
                    </span>
                  )}

                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* logout */}
          <div className="px-2 py-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              title={sidebarCollapsed ? "Déconnexion" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer group ${sidebarCollapsed ? "justify-center" : ""}`}
            >
              <Icon
                icon="mdi:logout"
                className="text-xl shrink-0 group-hover:scale-105 transition-transform"
              />
              {!sidebarCollapsed && (
                <span className="text-sm font-bold">Déconnexion</span>
              )}
              {sidebarCollapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Déconnexion
                </span>
              )}
            </button>
          </div>
        </motion.aside>

        {/* ══════════ MAIN CONTENT ══════════ */}
        <motion.main
          animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 min-w-0"
        >
          {/* ── EXPLORER ── */}
          {activeNav === "explorer" && (
            <div>
              {/* hero */}
              <div className="relative bg-linear-to-br from-orange-500 via-orange-500 to-amber-400 overflow-hidden">
                <svg
                  className="absolute inset-0 w-full h-full opacity-10"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <circle cx="10%" cy="80%" r="200" fill="white" />
                  <circle cx="90%" cy="20%" r="140" fill="white" />
                  <rect
                    x="70%"
                    y="60%"
                    width="80"
                    height="80"
                    rx="16"
                    fill="white"
                    transform="rotate(20 0 0)"
                  />
                </svg>
                <div className="relative max-w-full px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-white leading-tight">
                      Explorer les annonces
                    </h1>
                    <p className="text-orange-100 mt-1 text-sm font-medium">
                      {loading
                        ? "Chargement…"
                        : `${filtered.length} annonce${filtered.length !== 1 ? "s" : ""} disponible${filtered.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  {/* search */}
                  <div className="w-full sm:w-72 relative">
                    <Icon
                      icon="mdi:magnify"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none"
                    />
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Rechercher une annonce…"
                      className="w-full bg-white/95 backdrop-blur border border-white/60 rounded-2xl pl-11 pr-10 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-white/60 placeholder:text-gray-300 shadow-lg"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 cursor-pointer"
                      >
                        <Icon icon="mdi:close-circle" className="text-lg" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 space-y-5">
                {/* toolbar */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* category tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1 min-w-0">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setPage(1);
                        }}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          category === cat
                            ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200"
                            : "bg-white text-gray-500 border-gray-100 hover:border-orange-200 hover:text-orange-500"
                        }`}
                      >
                        <Icon icon={CAT_ICONS[cat]} className="text-sm" />
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* view mode */}
                  <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 gap-0.5 shrink-0">
                    {VIEW_MODES.map(({ value, icon }) => (
                      <button
                        key={value}
                        onClick={() => setViewMode(value)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewMode === value ? "bg-orange-500 text-white shadow-sm" : "text-gray-400 hover:text-orange-500"}`}
                      >
                        <Icon icon={icon} className="text-base" />
                      </button>
                    ))}
                  </div>

                  {/* sort */}
                  <div className="relative shrink-0" ref={sortRef}>
                    <button
                      onClick={() => setSortOpen((v) => !v)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 hover:border-orange-200 rounded-xl text-sm font-bold text-gray-600 transition-all cursor-pointer"
                    >
                      <Icon
                        icon="mdi:sort"
                        className="text-orange-400 text-base"
                      />
                      {currentSortLabel}
                      <Icon
                        icon="mdi:chevron-down"
                        className={`text-gray-300 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {sortOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -6 }}
                          transition={{
                            duration: 0.15,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden z-30 p-2"
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setSort(opt.value);
                                setSortOpen(false);
                                setPage(1);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${sort === opt.value ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-50"}`}
                            >
                              <Icon
                                icon={opt.icon}
                                className="text-base text-orange-400"
                              />
                              {opt.label}
                              {sort === opt.value && (
                                <Icon
                                  icon="mdi:check"
                                  className="ml-auto text-orange-500"
                                />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={() => navigate("/annonces")}
                      className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-black rounded-xl hover:bg-orange-100 transition-all cursor-pointer shrink-0"
                    >
                      <Icon
                        icon="mdi:filter-remove-outline"
                        className="text-sm"
                      />
                      Effacer ({activeFiltersCount})
                    </button>
                  )}
                </div>

                {/* saved banner */}
                {savedIds.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-5 py-3.5 bg-white border border-orange-100 rounded-2xl shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Icon
                        icon="mdi:heart"
                        className="text-orange-500 text-base"
                      />
                    </div>
                    <p className="text-sm text-gray-600 font-semibold flex-1">
                      <span className="font-black text-orange-500">
                        {savedIds.length}
                      </span>{" "}
                      annonce{savedIds.length > 1 ? "s" : ""} dans ma liste
                    </p>
                    <button
                      onClick={() => setActiveNav("ma-liste")}
                      className="text-xs font-black text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                    >
                      Voir <Icon icon="mdi:arrow-right" className="text-sm" />
                    </button>
                  </motion.div>
                )}

                {/* grid / list */}
                {loading ? (
                  <div
                    className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"}`}
                  >
                    {Array.from({ length: 10 }).map((_, i) => (
                      <SkeletonCard key={i} />
                    ))}
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                      <Icon
                        icon="mdi:wifi-off"
                        className="text-3xl text-red-400"
                      />
                    </div>
                    <p className="text-gray-400 font-bold text-sm">{error}</p>
                    <button
                      onClick={fetchAnnonces}
                      className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-black hover:bg-orange-600 transition cursor-pointer"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-28 gap-5"
                  >
                    <div className="w-24 h-24 rounded-3xl bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center">
                      <Icon
                        icon="mdi:bullhorn-outline"
                        className="text-5xl text-orange-300"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-black text-gray-800">
                        Aucun service disponible pour le moment.
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 font-medium">
                        {debouncedQ || category !== "Tous"
                          ? "Essayez de modifier vos filtres ou votre recherche."
                          : "Revenez bientôt, des annonces seront publiées prochainement."}
                      </p>
                    </div>
                    {(debouncedQ || category !== "Tous") && (
                      <button
                        onClick={() => {
                          setSearch("");
                          setCategory("Tous");
                        }}
                        className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-black hover:bg-orange-600 transition cursor-pointer shadow-lg shadow-orange-200"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      layout
                      className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"}`}
                    >
                      <AnimatePresence mode="popLayout">
                        {paginated.map((annonce) => (
                          <AnnounceCard
                            key={annonce._id}
                            annonce={annonce}
                            saved={savedIds.includes(annonce._id)}
                            onToggleSave={toggleSave}
                            onDelete={handleDeleteAnnonce}
                            isOwner={true}
                            viewMode="grid"
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {hasMore && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => setPage((p) => p + 1)}
                          className="flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-100 hover:border-orange-300 text-gray-600 hover:text-orange-600 font-black text-sm rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          <Icon icon="mdi:refresh" className="text-base" />
                          Charger plus ({filtered.length -
                            paginated.length}{" "}
                          restants)
                        </button>
                      </div>
                    )}
                    <p className="text-center text-xs text-gray-300 font-medium pb-4">
                      Affichage de {paginated.length} sur {filtered.length}{" "}
                      annonce{filtered.length > 1 ? "s" : ""}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── MES ANNONCES ── */}
          {activeNav === "mes-annonces" && (
            <div className="px-6 py-8 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Mes Annonces
                  </h2>
                  <p className="text-sm text-gray-400 font-medium mt-0.5">
                    {myAnnonces.length} annonce
                    {myAnnonces.length !== 1 ? "s" : ""} publiée
                    {myAnnonces.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Link
                  to="/create-annonce"
                  className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-xl shadow-md shadow-orange-200 transition-all"
                >
                  <Icon icon="mdi:plus" className="text-base" /> Créer une
                  annonce
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : myAnnonces.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-28 gap-5"
                >
                  <div className="w-24 h-24 rounded-3xl bg-orange-50 border-2 border-dashed border-orange-200 flex items-center justify-center">
                    <Icon
                      icon="mdi:bullhorn-outline"
                      className="text-5xl text-orange-300"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-black text-gray-800">
                      Aucune annonce publiée
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Créez votre première annonce et touchez des clients.
                    </p>
                  </div>
                  <Link
                    to="/create-annonce"
                    className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-black hover:bg-orange-600 transition cursor-pointer shadow-lg shadow-orange-200"
                  >
                    Créer une annonce
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {myAnnonces.map((annonce) => (
                      <AnnounceCard
                        key={annonce._id}
                        annonce={annonce}
                        saved={savedIds.includes(annonce._id)}
                        onToggleSave={toggleSave}
                        viewMode="grid"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* ── MA LISTE ── */}
          {activeNav === "ma-liste" && (
            <div className="px-6 py-8 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">
                    Ma Liste
                  </h2>
                  <p className="text-sm text-gray-400 font-medium mt-0.5">
                    {savedAnnonces.length} annonce
                    {savedAnnonces.length !== 1 ? "s" : ""} sauvegardée
                    {savedAnnonces.length !== 1 ? "s" : ""}
                  </p>
                </div>
                {savedAnnonces.length > 0 && (
                  <button
                    onClick={() => setSavedIds([])}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer border border-transparent hover:border-red-100"
                  >
                    <Icon icon="mdi:trash-can-outline" className="text-sm" />{" "}
                    Tout effacer
                  </button>
                )}
              </div>

              {savedAnnonces.length === 0 ? (
                <EmptyList onExplore={() => setActiveNav("explorer")} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {savedAnnonces.map((annonce) => (
                      <AnnounceCard
                        key={annonce._id}
                        annonce={annonce}
                        saved={true}
                        onToggleSave={toggleSave}
                        viewMode="grid"
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* ── PARAMÈTRES ── */}
          {activeNav === "parametres" && (
            <div className="px-6 py-8">
              <SettingsPanel user={user} />
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
}
