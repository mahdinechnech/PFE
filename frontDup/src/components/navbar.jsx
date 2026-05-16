import { Icon } from "@iconify/react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
  "Maçonnerie",
  "Peinture",
  "Charpenterie",
  "Autre",
];

const navLinks = [
  { label: "Accueil", to: "/", isAnchor: false },
  { label: "Services", anchor: "#services" },
  { label: "Annonces", to: "/annonces", isAnchor: false },
  { label: "Forum", to: "/forum", isAnchor: false },
  { label: "Contact", anchor: "#contact" },
];

/* ── tiny helpers ── */
const dot = "w-1 h-1 rounded-full bg-orange-400 inline-block";

export default function Navbar({ showSidebar = true }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // filter state
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [category, setCategory] = useState("");

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  /* ── mount effects ── */
  useEffect(() => {
    try {
      const u = localStorage.getItem("currentUser");
      if (u) setUser(JSON.parse(u));
    } catch {}

    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);

    const onOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onOutside);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);
    if (wilaya) params.set("wilaya", wilaya);
    if (category) params.set("category", category);
    navigate(`/annonces?${params.toString()}`);
    setSidebarOpen(false);
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";

  /* ── nav link helper ── */
  const renderLink = ({ label, to, anchor }, i) => {
    const cls =
      "relative text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors group";
    if (anchor) {
      const href = isHome ? anchor : `/${anchor}`;
      return (
        <li key={i}>
          <a href={href} className={cls}>
            {label}
            <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-orange-400 rounded-full group-hover:w-full transition-all duration-300" />
          </a>
        </li>
      );
    }
    return (
      <li key={i}>
        <Link to={to} className={cls}>
          {label}
          <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-orange-400 rounded-full group-hover:w-full transition-all duration-300" />
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* ══════════════════ HEADER ══════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.07)]"
            : "bg-white/80 backdrop-blur-md"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-5 flex items-center justify-between h-17 gap-4">
          {/* LEFT — sidebar toggle (always shown) */}
          <div className="flex items-center gap-3 shrink-0">
            {showSidebar && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 transition-all cursor-pointer"
                aria-label="Ouvrir les filtres"
              >
                <Icon
                  icon="mdi:tune-variant"
                  className="text-xl text-gray-400 group-hover:text-orange-500 transition-colors"
                />
              </button>
            )}

            {/* LOGO */}
            <Link className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-linear-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
                <span className="text-white font-black text-base leading-none">
                  F
                </span>
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">
                Fix<span className="text-orange-500">It</span>
              </span>
            </Link>
          </div>

          {/* CENTER — links (only when NOT logged in) */}
          {!user && (
            <ul className="hidden md:flex items-center gap-7">
              {navLinks.map(renderLink)}
            </ul>
          )}

          {/* RIGHT */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              /* ── LOGGED IN: profile only ── */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer group"
                >
                  {/* avatar */}
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-orange-100 overflow-hidden border-2 border-white">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-sm font-black text-gray-900">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <Icon
                    icon="mdi:chevron-down"
                    className={`text-gray-300 text-lg transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* ── dropdown ── */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-full mt-3 w-60 bg-white rounded-[1.25rem] shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden"
                    >
                      {/* header stripe */}
                      <div className="px-4 py-3.5 bg-linear-to-r from-orange-50 to-amber-50 border-b border-orange-100/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-black text-sm overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">
                              {user.username}
                            </p>
                            <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                              {user.role}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* items */}
                      <div className="p-2 space-y-0.5">
                        {[
                          {
                            icon: "mdi:account-circle-outline",
                            label: "Mon Profil",
                            to: "/profile",
                          },
                          {
                            icon: "mdi:heart-outline",
                            label: "Ma Liste",
                            to: "/ma-liste",
                          },
                          {
                            icon: "mdi:bullhorn-outline",
                            label: "Mes Annonces",
                            to: "/profile#annonces",
                          },
                        ].map(({ icon, label, to }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all group"
                          >
                            <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                              <Icon
                                icon={icon}
                                className="text-base text-gray-400 group-hover:text-orange-500 transition-colors"
                              />
                            </span>
                            {label}
                          </Link>
                        ))}

                        {user.role === "admin" && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all group"
                          >
                            <span className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                              <Icon
                                icon="mdi:shield-account"
                                className="text-base text-red-400"
                              />
                            </span>
                            Dashboard Admin
                          </Link>
                        )}
                      </div>

                      {/* logout */}
                      <div className="p-2 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all group cursor-pointer"
                        >
                          <span className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                            <Icon
                              icon="mdi:logout"
                              className="text-base text-gray-400 group-hover:text-red-500 transition-colors"
                            />
                          </span>
                          Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── NOT logged in: auth buttons ── */
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-orange-500 rounded-xl hover:bg-orange-50 transition-all"
                >
                  Connexion
                </Link>
                <Link
                  to="/signUp"
                  className="px-4 py-2 text-sm font-black text-white bg-linear-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-amber-500 rounded-xl shadow-md shadow-orange-200 transition-all"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ══════════════════ FILTER SIDEBAR ══════════════════ */}
      {/* Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            className="fixed top-0 left-0 h-full w-80 bg-white z-70 flex flex-col shadow-2xl shadow-black/10"
          >
            {/* sidebar header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Icon
                    icon="mdi:tune-variant"
                    className="text-orange-500 text-xl"
                  />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-900">
                    Filtres
                  </h2>
                  <p className="text-[11px] text-gray-400 font-medium">
                    Affinez votre recherche
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center transition cursor-pointer"
              >
                <Icon icon="mdi:close" className="text-gray-400 text-lg" />
              </button>
            </div>

            {/* form */}
            <form
              onSubmit={handleFilterSubmit}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
            >
              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <Icon
                    icon="mdi:cash-multiple"
                    className="text-orange-400 text-base"
                  />
                  Prix (DA)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder:text-gray-300 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent placeholder:text-gray-300 transition-all"
                    />
                  </div>
                </div>
                {/* visual range bar (decorative) */}
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-orange-300 to-orange-500 rounded-full w-1/2" />
                </div>
              </div>

              {/* Wilaya */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <Icon
                    icon="mdi:map-marker-outline"
                    className="text-orange-400 text-base"
                  />
                  Wilaya
                </label>
                <div className="relative">
                  <select
                    value={wilaya}
                    onChange={(e) => setWilaya(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 pr-10 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent appearance-none cursor-pointer transition-all"
                  >
                    <option value="">Toutes les wilayas</option>
                    {wilayas.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                  <Icon
                    icon="mdi:chevron-down"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xl pointer-events-none"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  <Icon
                    icon="mdi:shape-outline"
                    className="text-orange-400 text-base"
                  />
                  Catégorie
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 pr-10 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent appearance-none cursor-pointer transition-all"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Icon
                    icon="mdi:chevron-down"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xl pointer-events-none"
                  />
                </div>

                {/* category pills */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {categories.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(category === c ? "" : c)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        category === c
                          ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                          : "bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* reset link */}
              <button
                type="button"
                onClick={() => {
                  setPriceMin("");
                  setPriceMax("");
                  setWilaya("");
                  setCategory("");
                }}
                className="text-xs font-bold text-gray-300 hover:text-orange-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Icon icon="mdi:refresh" className="text-base" />
                Réinitialiser les filtres
              </button>
            </form>

            {/* sticky submit */}
            <div className="px-6 py-5 border-t border-gray-100 bg-white">
              <button
                onClick={handleFilterSubmit}
                className="w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Icon icon="mdi:magnify" className="text-lg" />
                Appliquer les filtres
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
