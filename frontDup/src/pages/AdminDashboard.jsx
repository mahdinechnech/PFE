/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const API = import.meta.env.VITE_API_URL || "";
const token = () => localStorage.getItem("token");
const apiFetch = (path, opts = {}) =>
  fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
      ...(opts.headers || {}),
    },
  });

const resolveImage = (p) => (!p ? "" : p.startsWith("http") ? p : `${API}${p}`);

const fmt = (n) => Number(n || 0).toLocaleString("fr-DZ");

const STATUS_CFG = {
  pending: {
    label: "En attente",
    cls: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Approuvée",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  open: {
    label: "Active",
    cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  rejected: {
    label: "Rejetée",
    cls: "bg-red-500/15 text-red-400 border-red-500/30",
    dot: "bg-red-400",
  },
  closed: {
    label: "Fermée",
    cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    dot: "bg-zinc-400",
  },
};

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

/* ─────────────────────────────────────────────────────────────
   SMALL SHARED COMPONENTS
───────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${c.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

const Avatar = ({ user, size = "sm" }) => {
  const s = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${s} rounded-xl bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center text-white font-black overflow-hidden shrink-0`}
    >
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
  );
};

const Spinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-10 h-10 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MODAL WRAPPER
───────────────────────────────────────────────────────────── */
const Modal = ({ title, onClose, children, wide }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(5,5,5,0.75)", backdropFilter: "blur(10px)" }}
  >
    <motion.div
      initial={{ scale: 0.88, y: 30, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.88, y: 30, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className={`bg-[#1a1a1a] border border-white/8 rounded-2xl shadow-2xl overflow-hidden ${wide ? "w-full max-w-2xl" : "w-full max-w-md"}`}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
        <h3 className="text-base font-black text-white">{title}</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl hover:bg-white/8 flex items-center justify-center text-zinc-500 hover:text-white transition cursor-pointer"
        >
          <Icon icon="mdi:close" className="text-lg" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   FIELD helpers
───────────────────────────────────────────────────────────── */
const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
      {label}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);
const Input = (props) => (
  <input
    {...props}
    className="w-full bg-white/5 border border-white/10 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition"
  />
);
const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full bg-[#111] border border-white/10 focus:border-orange-500/60 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition cursor-pointer"
  >
    {children}
  </select>
);
const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full bg-white/5 border border-white/10 focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none transition resize-none"
  />
);

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color, delay = 0 }) => {
  const colors = {
    orange:
      "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    emerald:
      "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    amber:
      "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    red: "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
    violet:
      "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative bg-gradient-to-br ${colors[color] || colors.orange} border rounded-2xl p-5 overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 blur-xl bg-current" />
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl bg-current/10 flex items-center justify-center`}
        >
          <Icon
            icon={icon}
            className={`text-xl ${colors[color]?.split(" ")[3]}`}
          />
        </div>
        {sub !== undefined && (
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-current/10 ${colors[color]?.split(" ")[3]}`}
          >
            {sub}
          </span>
        )}
      </div>
      <p className="text-3xl font-black text-white mb-1">{fmt(value)}</p>
      <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
        {label}
      </p>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MINI BAR CHART
───────────────────────────────────────────────────────────── */
const MiniBar = ({ data, color = "#f97316" }) => {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((d, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.05 }}
          style={{
            originY: 1,
            height: `${(d.v / max) * 100}%`,
            background: color,
            opacity: 0.6 + (i / data.length) * 0.4,
          }}
          className="flex-1 rounded-t-sm min-h-[4px]"
          title={`${d.l}: ${d.v}`}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CONFIRM DELETE MODAL
───────────────────────────────────────────────────────────── */
const ConfirmDelete = ({ label, onConfirm, onCancel, loading }) => (
  <Modal title="Confirmer la suppression" onClose={onCancel}>
    <div className="text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
        <Icon icon="mdi:trash-can-outline" className="text-3xl text-red-400" />
      </div>
      <p className="text-sm text-zinc-400 leading-relaxed">
        Supprimer <span className="font-bold text-white">«{label}»</span>{" "}
        définitivement ?
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white font-bold text-sm transition cursor-pointer"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-lg shadow-red-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Icon icon="mdi:loading" className="animate-spin" />
          ) : (
            <Icon icon="mdi:trash-can-outline" />
          )}{" "}
          Supprimer
        </button>
      </div>
    </div>
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: -48, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -48, scale: 0.94 }}
        className={`fixed top-5 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold pointer-events-none
          ${toast.type === "error" ? "bg-[#1a0808] border-red-500/30 text-red-400" : "bg-[#081a0e] border-emerald-500/30 text-emerald-400"}`}
      >
        <Icon
          icon={
            toast.type === "error"
              ? "mdi:alert-circle-outline"
              : "mdi:check-circle-outline"
          }
          className="text-xl"
        />
        {toast.msg}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─────────────────────────────────────────────────────────────
   NAV SIDEBAR ITEMS
───────────────────────────────────────────────────────────── */
const NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "mdi:view-dashboard-outline",
    activeIcon: "mdi:view-dashboard",
  },
  {
    id: "requests",
    label: "Demandes",
    icon: "mdi:inbox-outline",
    activeIcon: "mdi:inbox",
    badge: "pending",
  },
  {
    id: "announces",
    label: "Annonces",
    icon: "mdi:bullhorn-outline",
    activeIcon: "mdi:bullhorn",
  },
  {
    id: "users",
    label: "Utilisateurs",
    icon: "mdi:account-group-outline",
    activeIcon: "mdi:account-group",
  },
  {
    id: "reports",
    label: "Signalements",
    icon: "mdi:flag-outline",
    activeIcon: "mdi:flag",
    badge: "reports",
  },
];

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
const WILAYAS = [
  "Alger",
  "Oran",
  "Constantine",
  "Annaba",
  "Blida",
  "Batna",
  "Sétif",
  "Béjaïa",
  "Tizi Ouzou",
  "Tlemcen",
  "Médéa",
  "Skikda",
  "Sidi Bel Abbès",
  "Biskra",
  "Béchar",
  "Mostaganem",
  "Tiaret",
  "Bordj Bou Arréridj",
  "Ouargla",
  "Boumerdès",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Ghardaïa",
  "Relizane",
  "Autre",
];

/* ═════════════════════════════════════════════════════════════
   SECTIONS
═════════════════════════════════════════════════════════════ */

/* ── DASHBOARD ── */
function Dashboard({ stats, loading }) {
  if (loading) return <Spinner />;
  const weekly = stats.weeklyAnnonces || [0, 0, 0, 0, 0, 0, 0];
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const barData = days.map((l, i) => ({ l, v: weekly[i] || 0 }));
  const catData = Object.entries(stats.byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white mb-1">Vue d'ensemble</h2>
        <p className="text-zinc-500 text-sm">
          Statistiques en temps réel de la plateforme.
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon="mdi:account-group"
          label="Utilisateurs"
          value={stats.totalUsers}
          color="blue"
          delay={0}
        />
        <StatCard
          icon="mdi:account-wrench"
          label="Techniciens"
          value={stats.totalTechniciens}
          color="violet"
          delay={0.05}
        />
        <StatCard
          icon="mdi:account-circle"
          label="Clients"
          value={stats.totalClients}
          color="orange"
          delay={0.1}
        />
        <StatCard
          icon="mdi:bullhorn"
          label="Annonces"
          value={stats.totalAnnonces}
          color="emerald"
          delay={0.15}
        />
        <StatCard
          icon="mdi:clock-outline"
          label="En attente"
          value={stats.pendingAnnonces}
          color="amber"
          delay={0.2}
        />
        <StatCard
          icon="mdi:flag"
          label="Signalements"
          value={stats.openReports}
          color="red"
          delay={0.25}
        />
      </div>

      {/* charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* weekly bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#111] border border-white/8 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-white">
                Annonces cette semaine
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                {fmt(weekly.reduce((a, b) => a + b, 0))} au total
              </p>
            </div>
            <Icon icon="mdi:chart-bar" className="text-orange-500 text-xl" />
          </div>
          <MiniBar data={barData} color="#f97316" />
          <div className="flex gap-1 mt-2">
            {days.map((d) => (
              <p
                key={d}
                className="flex-1 text-center text-[10px] text-zinc-600 font-semibold"
              >
                {d}
              </p>
            ))}
          </div>
        </motion.div>

        {/* by status donut-ish */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[#111] border border-white/8 rounded-2xl p-6"
        >
          <h3 className="text-sm font-black text-white mb-5">Par statut</h3>
          <div className="space-y-3">
            {[
              {
                label: "Approuvées",
                value: stats.approvedAnnonces || 0,
                color: "bg-emerald-500",
                max: stats.totalAnnonces,
              },
              {
                label: "En attente",
                value: stats.pendingAnnonces || 0,
                color: "bg-amber-500",
                max: stats.totalAnnonces,
              },
              {
                label: "Rejetées",
                value: stats.rejectedAnnonces || 0,
                color: "bg-red-500",
                max: stats.totalAnnonces,
              },
              {
                label: "Fermées",
                value: stats.closedAnnonces || 0,
                color: "bg-zinc-600",
                max: stats.totalAnnonces,
              },
            ].map(({ label, value, color, max }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400 font-semibold">{label}</span>
                  <span className="text-white font-black">{value}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
                    transition={{
                      delay: 0.5,
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`h-full ${color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* by category */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#111] border border-white/8 rounded-2xl p-6"
      >
        <h3 className="text-sm font-black text-white mb-5">
          Annonces par catégorie
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {catData.length === 0 ? (
            <p className="text-zinc-600 text-sm col-span-full">
              Aucune donnée disponible.
            </p>
          ) : (
            catData.map(([cat, count]) => (
              <div
                key={cat}
                className="bg-white/4 rounded-xl p-3 flex flex-col items-center gap-2 hover:bg-white/8 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Icon
                    icon={CAT_ICONS[cat] || "mdi:briefcase"}
                    className="text-orange-400 text-xl"
                  />
                </div>
                <p className="text-lg font-black text-white">{count}</p>
                <p className="text-[10px] text-zinc-500 font-semibold text-center leading-tight">
                  {cat}
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ── REQUESTS (pending announces) ── */
function Requests({ onToast, onRefreshStats }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/annonces?status=pending");
      const data = await res.json();
      setList(
        Array.isArray(data) ? data.filter((a) => a.status === "pending") : [],
      );
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    load();
  }, [load]);

  const decide = async (id, status, reason = "") => {
    setActionId(id);
    try {
      const res = await apiFetch(`/api/annonces/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, rejectReason: reason }),
      });
      if (!res.ok) throw new Error();
      setList((p) => p.filter((a) => a._id !== id));
      onToast(
        status === "approved" ? "Annonce approuvée ✓" : "Annonce rejetée",
        status === "approved" ? "success" : "error",
      );
      onRefreshStats();
    } catch {
      onToast("Erreur lors de l'action.", "error");
    } finally {
      setActionId(null);
      setRejectModal(null);
      setRejectReason("");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">
            Demandes en attente
          </h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {list.length} annonce{list.length !== 1 ? "s" : ""} à traiter
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-sm font-bold rounded-xl transition cursor-pointer"
        >
          <Icon icon="mdi:refresh" />
          Actualiser
        </button>
      </div>

      {/* reject reason modal */}
      <AnimatePresence>
        {rejectModal && (
          <Modal
            title="Motif du rejet"
            onClose={() => {
              setRejectModal(null);
              setRejectReason("");
            }}
          >
            <div className="space-y-4">
              <Field label="Raison (optionnel)">
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Ex: contenu inapproprié, informations insuffisantes…"
                  rows={3}
                />
              </Field>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={() => decide(rejectModal, "rejected", rejectReason)}
                  disabled={actionId === rejectModal}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-lg shadow-red-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionId === rejectModal ? (
                    <Icon icon="mdi:loading" className="animate-spin" />
                  ) : (
                    <Icon icon="mdi:close-circle-outline" />
                  )}{" "}
                  Rejeter
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {list.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Icon icon="mdi:check-all" className="text-3xl text-emerald-400" />
          </div>
          <p className="text-zinc-500 font-semibold text-sm">
            Aucune demande en attente 🎉
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnimatePresence>
            {list.map((a, i) => (
              <motion.div
                key={a._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="bg-[#111] border border-amber-500/20 rounded-2xl overflow-hidden hover:border-amber-500/40 transition"
              >
                {/* image strip */}
                <div className="h-36 bg-linear-to-br from-amber-900/30 to-orange-900/20 relative overflow-hidden">
                  {a.image ? (
                    <img
                      src={resolveImage(a.image)}
                      alt={a.title}
                      className="w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon
                        icon={CAT_ICONS[a.category] || "mdi:image"}
                        className="text-5xl text-amber-800/50"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-[#111] to-transparent" />
                  <span className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-wider">
                    {a.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white text-sm leading-snug line-clamp-1">
                        {a.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                        {a.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-white">
                        {a.budget > 0 ? `${fmt(a.budget)} DA` : "À discuter"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar user={a.creator} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {a.creator?.username || "Inconnu"}
                      </p>
                      {a.location && (
                        <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                          <Icon
                            icon="mdi:map-marker-outline"
                            className="text-xs"
                          />
                          {a.location}
                        </p>
                      )}
                    </div>
                    <span className="ml-auto text-[10px] text-zinc-600">
                      {new Date(a.createdAt).toLocaleDateString("fr-DZ", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => decide(a._id, "approved")}
                      disabled={actionId === a._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-black rounded-xl transition cursor-pointer disabled:opacity-40"
                    >
                      {actionId === a._id ? (
                        <Icon icon="mdi:loading" className="animate-spin" />
                      ) : (
                        <Icon icon="mdi:check-circle-outline" />
                      )}{" "}
                      Approuver
                    </button>
                    <button
                      onClick={() => setRejectModal(a._id)}
                      disabled={actionId === a._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white text-xs font-black rounded-xl transition cursor-pointer disabled:opacity-40"
                    >
                      <Icon icon="mdi:close-circle-outline" /> Rejeter
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ── ANNOUNCES ── */
function Announces({ onToast }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/annonces/admin/all");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/annonces/${deleteTarget._id}`, { method: "DELETE" });
      setList((p) => p.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
      onToast("Annonce supprimée.");
    } catch {
      onToast("Erreur suppression.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await apiFetch(`/api/annonces/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setList((p) => p.map((a) => (a._id === id ? { ...a, status } : a)));
      onToast("Statut mis à jour.");
    } catch {
      onToast("Erreur.", "error");
    }
  };

  const filtered = list
    .filter((a) => filter === "all" || a.status === filter)
    .filter(
      (a) =>
        !search ||
        [a.title, a.category, a.creator?.username]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    );

  const tabs = [
    { key: "all", label: "Toutes", count: list.length },
    {
      key: "pending",
      label: "En attente",
      count: list.filter((a) => a.status === "pending").length,
    },
    {
      key: "approved",
      label: "Approuvées",
      count: list.filter((a) => a.status === "approved" || a.status === "open")
        .length,
    },
    {
      key: "rejected",
      label: "Rejetées",
      count: list.filter((a) => a.status === "rejected").length,
    },
  ].filter((t) => t.key === "all" || t.count > 0);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDelete
            label={deleteTarget.title}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
        {(editTarget || addModal) && (
          <AnnounceFormModal
            annonce={editTarget}
            onClose={() => {
              setEditTarget(null);
              setAddModal(false);
            }}
            onSaved={(a) => {
              if (editTarget)
                setList((p) => p.map((x) => (x._id === a._id ? a : x)));
              else setList((p) => [a, ...p]);
              setEditTarget(null);
              setAddModal(false);
              onToast(editTarget ? "Annonce modifiée." : "Annonce créée.");
            }}
            onToast={onToast}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">
            Toutes les annonces
          </h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition w-48"
            />
          </div>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer"
          >
            <Icon icon="mdi:plus" />
            Créer
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition cursor-pointer
              ${filter === t.key ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20" : "bg-white/5 text-zinc-400 border-white/10 hover:border-white/20"}`}
          >
            {t.label}
            <span
              className={`min-w-5 h-5 rounded-full text-[10px] px-1 flex items-center justify-center ${filter === t.key ? "bg-white/25" : "bg-white/8"}`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-0 px-5 py-3 border-b border-white/6">
            {["Annonce", "Catégorie", "Auteur", "Statut", "Actions"].map(
              (h) => (
                <p
                  key={h}
                  className="text-[10px] font-black text-zinc-600 uppercase tracking-widest"
                >
                  {h}
                </p>
              ),
            )}
          </div>
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-zinc-600 text-sm">
              Aucune annonce trouvée.
            </p>
          ) : (
            <div className="divide-y divide-white/4">
              {filtered.map((a) => (
                <div
                  key={a._id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-0 px-5 py-4 items-center hover:bg-white/3 transition group"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-bold text-white truncate">
                      {a.title}
                    </p>
                    <p className="text-xs text-zinc-600 truncate">
                      {a.description?.slice(0, 60)}…
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon={CAT_ICONS[a.category] || "mdi:tag"}
                      className="text-orange-400 text-sm shrink-0"
                    />
                    <span className="text-xs text-zinc-400 truncate">
                      {a.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar user={a.creator} />
                    <span className="text-xs text-zinc-400 truncate">
                      {a.creator?.username || "—"}
                    </span>
                  </div>
                  <div>
                    <select
                      value={a.status}
                      onChange={(e) =>
                        handleStatusChange(a._id, e.target.value)
                      }
                      className="bg-transparent border-0 text-xs font-bold cursor-pointer outline-none text-zinc-300"
                    >
                      {[
                        "pending",
                        "approved",
                        "rejected",
                        "closed",
                        "open",
                      ].map((s) => (
                        <option key={s} value={s} className="bg-[#111]">
                          {STATUS_CFG[s]?.label || s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditTarget(a)}
                      title="Modifier"
                      className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 flex items-center justify-center transition cursor-pointer"
                    >
                      <Icon icon="mdi:pencil-outline" className="text-sm" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      title="Supprimer"
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition cursor-pointer"
                    >
                      <Icon icon="mdi:trash-can-outline" className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── ANNOUNCE FORM MODAL ── */
function AnnounceFormModal({ annonce, onClose, onSaved, onToast }) {
  const [form, setForm] = useState({
    title: annonce?.title || "",
    category: annonce?.category || "",
    description: annonce?.description || "",
    location: annonce?.location || "",
    budget: annonce?.budget || "",
    status: annonce?.status || "approved",
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!form.title || !form.category) {
      onToast("Titre et catégorie requis.", "error");
      return;
    }
    setLoading(true);
    try {
      const method = annonce ? "PUT" : "POST";
      const path = annonce ? `/api/annonces/${annonce._id}` : "/api/annonces";
      const res = await apiFetch(path, { method, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSaved(data);
    } catch (e) {
      onToast(e.message || "Erreur.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={annonce ? "Modifier l'annonce" : "Créer une annonce"}
      onClose={onClose}
      wide
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Field label="Titre" required>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Titre de l'annonce"
            />
          </Field>
        </div>
        <Field label="Catégorie" required>
          <Select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Choisir…</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#111]">
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Wilaya">
          <Select
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          >
            <option value="">Choisir…</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w} className="bg-[#111]">
                {w}
              </option>
            ))}
          </Select>
        </Field>
        <div className="col-span-2">
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              placeholder="Description…"
            />
          </Field>
        </div>
        <Field label="Budget (DA)">
          <Input
            type="number"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            placeholder="0"
          />
        </Field>
        <Field label="Statut">
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {["pending", "approved", "rejected", "closed", "open"].map((s) => (
              <option key={s} value={s} className="bg-[#111]">
                {STATUS_CFG[s]?.label || s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm transition cursor-pointer"
        >
          Annuler
        </button>
        <button
          onClick={save}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Icon icon="mdi:loading" className="animate-spin" />
          ) : (
            <Icon icon="mdi:check" />
          )}{" "}
          {annonce ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </Modal>
  );
}

/* ── USERS ── */
function Users({ onToast }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/users");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/admin/users/${deleteTarget._id}`, {
        method: "DELETE",
      });
      setList((p) => p.filter((u) => u._id !== deleteTarget._id));
      setDeleteTarget(null);
      onToast("Utilisateur supprimé.");
    } catch {
      onToast("Erreur suppression.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = list
    .filter((u) => roleFilter === "all" || u.role === roleFilter)
    .filter(
      (u) =>
        !search ||
        [u.username, u.email, u.phone]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
    );

  const roleCounts = {
    all: list.length,
    client: list.filter((u) => u.role === "client").length,
    technicien: list.filter((u) => u.role === "technicien").length,
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDelete
            label={deleteTarget.username}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
        {(editTarget || addModal) && (
          <UserFormModal
            user={editTarget}
            onClose={() => {
              setEditTarget(null);
              setAddModal(false);
            }}
            onSaved={(u) => {
              if (editTarget)
                setList((p) => p.map((x) => (x._id === u._id ? u : x)));
              else setList((p) => [u, ...p]);
              setEditTarget(null);
              setAddModal(false);
              onToast(
                editTarget ? "Utilisateur modifié." : "Utilisateur créé.",
              );
            }}
            onToast={onToast}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Utilisateurs</h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500/50 transition w-48"
            />
          </div>
          {/* role filter dropdown */}
          <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {[
              { key: "all", label: `Tous (${roleCounts.all})` },
              { key: "client", label: `Clients (${roleCounts.client})` },
              {
                key: "technicien",
                label: `Techniciens (${roleCounts.technicien})`,
              },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => setRoleFilter(r.key)}
                className={`px-3 py-2 text-xs font-bold transition cursor-pointer ${roleFilter === r.key ? "bg-orange-500 text-white" : "text-zinc-400 hover:text-white"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-black rounded-xl shadow-lg shadow-orange-500/20 transition cursor-pointer"
          >
            <Icon icon="mdi:plus" />
            Ajouter
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-[#111] border border-white/8 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-0 px-5 py-3 border-b border-white/6">
            {["Utilisateur", "Rôle", "Contact", "Inscrit le", "Actions"].map(
              (h) => (
                <p
                  key={h}
                  className="text-[10px] font-black text-zinc-600 uppercase tracking-widest"
                >
                  {h}
                </p>
              ),
            )}
          </div>
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-zinc-600 text-sm">
              Aucun utilisateur trouvé.
            </p>
          ) : (
            <div className="divide-y divide-white/4">
              {filtered.map((u) => (
                <div
                  key={u._id}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-0 px-5 py-3.5 items-center hover:bg-white/3 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={u} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {u.username}
                      </p>
                      <p className="text-xs text-zinc-600 truncate">
                        {u.email || u.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border
                      ${
                        u.role === "admin"
                          ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                          : u.role === "technicien"
                            ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                            : "bg-zinc-500/15 text-zinc-400 border-zinc-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${u.role === "admin" ? "bg-violet-400" : u.role === "technicien" ? "bg-blue-400" : "bg-zinc-400"}`}
                      />
                      {u.role || "client"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">
                    {u.email || u.phone || "—"}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {new Date(u.createdAt).toLocaleDateString("fr-DZ", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditTarget(u)}
                      title="Modifier"
                      className="w-7 h-7 rounded-lg bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 flex items-center justify-center transition cursor-pointer"
                    >
                      <Icon icon="mdi:pencil-outline" className="text-sm" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      title="Supprimer"
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition cursor-pointer"
                    >
                      <Icon icon="mdi:trash-can-outline" className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── USER FORM MODAL ── */
function UserFormModal({ user, onClose, onSaved, onToast }) {
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "client",
    password: "",
    wilaya: user?.wilaya || "",
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!form.username) {
      onToast("Nom requis.", "error");
      return;
    }
    setLoading(true);
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      const method = user ? "PUT" : "POST";
      const path = user ? `/api/admin/users/${user._id}` : "/api/admin/users";
      const res = await apiFetch(path, { method, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onSaved(data);
    } catch (e) {
      onToast(e.message || "Erreur.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={user ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
      onClose={onClose}
      wide
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nom d'utilisateur" required>
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="username"
          />
        </Field>
        <Field label="Rôle">
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            {["client", "technicien", "admin"].map((r) => (
              <option key={r} value={r} className="bg-[#111]">
                {r}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@exemple.com"
          />
        </Field>
        <Field label="Téléphone">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+213…"
          />
        </Field>
        <Field label="Wilaya">
          <Select
            value={form.wilaya}
            onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
          >
            <option value="">Choisir…</option>
            {WILAYAS.map((w) => (
              <option key={w} value={w} className="bg-[#111]">
                {w}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={user ? "Nouveau mot de passe" : "Mot de passe"}
          required={!user}
        >
          <Input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder={user ? "(inchangé)" : "••••••••"}
          />
        </Field>
      </div>
      <div className="flex gap-3 mt-5">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 font-bold text-sm transition cursor-pointer"
        >
          Annuler
        </button>
        <button
          onClick={save}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-500/20 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Icon icon="mdi:loading" className="animate-spin" />
          ) : (
            <Icon icon="mdi:check" />
          )}{" "}
          {user ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </Modal>
  );
}

/* ── REPORTS ── */
function Reports({ onToast, onRefreshStats }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/reports");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (id, action) => {
    setActionId(id);
    try {
      await apiFetch(`/api/reports/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: action }),
      });
      setList((p) =>
        p.map((r) => (r._id === id ? { ...r, status: action } : r)),
      );
      onToast("Signalement traité.");
      onRefreshStats();
    } catch {
      onToast("Erreur.", "error");
    } finally {
      setActionId(null);
    }
  };

  const filtered = list.filter((r) => filter === "all" || r.status === filter);

  const REPORT_TABS = [
    {
      key: "open",
      label: "Ouverts",
      count: list.filter((r) => r.status === "open").length,
    },
    {
      key: "resolved",
      label: "Résolus",
      count: list.filter((r) => r.status === "resolved").length,
    },
    { key: "all", label: "Tous", count: list.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Signalements</h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {list.filter((r) => r.status === "open").length} signalement
            {list.filter((r) => r.status === "open").length !== 1
              ? "s"
              : ""}{" "}
            ouvert
            {list.filter((r) => r.status === "open").length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-sm font-bold rounded-xl transition cursor-pointer"
        >
          <Icon icon="mdi:refresh" />
          Actualiser
        </button>
      </div>

      <div className="flex gap-2">
        {REPORT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition cursor-pointer
              ${filter === t.key ? "bg-orange-500 text-white border-orange-500" : "bg-white/5 text-zinc-400 border-white/10 hover:border-white/20"}`}
          >
            {t.label}
            <span
              className={`min-w-5 h-5 rounded-full text-[10px] px-1 flex items-center justify-center ${filter === t.key ? "bg-white/25" : "bg-white/8"}`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Icon
              icon="mdi:shield-check-outline"
              className="text-3xl text-emerald-400"
            />
          </div>
          <p className="text-zinc-500 font-semibold text-sm">
            Aucun signalement dans cette catégorie.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-[#111] border rounded-2xl p-5 transition ${r.status === "open" ? "border-red-500/20 hover:border-red-500/40" : "border-white/8 opacity-60"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border
                        ${r.status === "open" ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${r.status === "open" ? "bg-red-400" : "bg-emerald-400"}`}
                        />
                        {r.status === "open" ? "Ouvert" : "Résolu"}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {new Date(r.createdAt).toLocaleDateString("fr-DZ")}
                      </span>
                    </div>
                    <p className="text-sm font-black text-white mb-1">
                      {r.reason || "Signalement"}
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                      {r.description || r.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      {r.reporter && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Icon
                            icon="mdi:account-outline"
                            className="text-sm"
                          />
                          Signalé par :{" "}
                          <span className="text-zinc-300 font-bold">
                            {r.reporter?.username || "—"}
                          </span>
                        </div>
                      )}
                      {r.annonce && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                          <Icon
                            icon="mdi:bullhorn-outline"
                            className="text-sm"
                          />
                          Annonce :{" "}
                          <span className="text-zinc-300 font-bold">
                            {r.annonce?.title || "—"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {r.status === "open" && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => resolve(r._id, "resolved")}
                        disabled={actionId === r._id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white text-xs font-black rounded-xl transition cursor-pointer disabled:opacity-40"
                      >
                        {actionId === r._id ? (
                          <Icon icon="mdi:loading" className="animate-spin" />
                        ) : (
                          <Icon icon="mdi:check" />
                        )}{" "}
                        Résoudre
                      </button>
                      <button
                        onClick={() => resolve(r._id, "dismissed")}
                        disabled={actionId === r._id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-500/10 hover:bg-zinc-500/20 border border-zinc-500/20 text-zinc-500 hover:text-zinc-300 text-xs font-black rounded-xl transition cursor-pointer disabled:opacity-40"
                      >
                        <Icon icon="mdi:close" /> Ignorer
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   MAIN ADMIN PAGE
═════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({});
  const [statsLoading, setStatsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await apiFetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      // fallback: try to compute from available endpoints
      try {
        const [uRes, aRes] = await Promise.all([
          apiFetch("/api/admin/users"),
          apiFetch("/api/annonces/admin/all"),
        ]);
        const users = await uRes.json();
        const annonces = await aRes.json();
        const uArr = Array.isArray(users) ? users : [];
        const aArr = Array.isArray(annonces) ? annonces : [];
        setStats({
          totalUsers: uArr.length,
          totalClients: uArr.filter((u) => u.role === "client").length,
          totalTechniciens: uArr.filter((u) => u.role === "technicien").length,
          totalAnnonces: aArr.length,
          pendingAnnonces: aArr.filter((a) => a.status === "pending").length,
          approvedAnnonces: aArr.filter(
            (a) => a.status === "approved" || a.status === "open",
          ).length,
          rejectedAnnonces: aArr.filter((a) => a.status === "rejected").length,
          closedAnnonces: aArr.filter((a) => a.status === "closed").length,
          openReports: 0,
          byCategory: aArr.reduce(
            (acc, a) => ({ ...acc, [a.category]: (acc[a.category] || 0) + 1 }),
            {},
          ),
          weeklyAnnonces: [0, 0, 0, 0, 0, 0, 0],
        });
      } catch {
        /* empty */
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // guard: only admin
  const adminUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    ["isAuthenticated", "token", "currentUser"].forEach((k) =>
      localStorage.removeItem(k),
    );
    navigate("/login");
  };

  const pendingCount = stats.pendingAnnonces || 0;
  const reportsCount = stats.openReports || 0;

  return (
    <div
      className="min-h-screen flex"
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      <Toast toast={toast} />

      {/* ══════ SIDEBAR ══════ */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden"
        style={{
          background: "#0a0a1a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* logo area */}
        <div
          className={`flex items-center px-4 py-5 gap-3 border-b border-white/5 ${collapsed ? "justify-center" : ""}`}
        >
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30">
                <Icon
                  icon="mdi:shield-crown"
                  className="text-white text-base"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black text-white uppercase tracking-widest">
                  Admin
                </p>
                <p className="text-[10px] text-zinc-600 font-semibold truncate">
                  Panneau de contrôle
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Icon icon="mdi:shield-crown" className="text-white text-base" />
            </div>
          )}
        </div>

        {/* nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const isActive = active === item.id;
            const badge =
              item.badge === "pending"
                ? pendingCount
                : item.badge === "reports"
                  ? reportsCount
                  : 0;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative
                  ${isActive ? "bg-orange-500/15 text-orange-400 border border-orange-500/25" : "text-zinc-500 hover:text-zinc-200 hover:bg-white/4 border border-transparent"}
                  ${collapsed ? "justify-center" : ""}`}
              >
                <Icon
                  icon={isActive ? item.activeIcon : item.icon}
                  className={`text-xl shrink-0 ${isActive ? "scale-110" : ""} transition-transform`}
                />
                {!collapsed && (
                  <span className="text-sm font-bold truncate">
                    {item.label}
                  </span>
                )}
                {badge > 0 && (
                  <span
                    className={`${collapsed ? "absolute -top-1 -right-1 min-w-4 h-4" : "ml-auto min-w-5 h-5"} px-1 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 bg-orange-500 text-white`}
                  >
                    {badge}
                  </span>
                )}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1a1a1a] border border-white/8 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* user + collapse */}
        <div className="px-2 py-3 space-y-1 border-t border-white/5">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1">
              <Avatar user={adminUser} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">
                  {adminUser?.username}
                </p>
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">
                  Admin
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-white/4 transition cursor-pointer ${collapsed ? "justify-center" : ""}`}
          >
            <Icon
              icon={collapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
              className="text-lg"
            />
            {!collapsed && <span className="text-xs font-bold">Réduire</span>}
          </button>
          <button
            onClick={handleLogout}
            title={collapsed ? "Déconnexion" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-600 hover:text-red-400 hover:bg-red-500/8 transition cursor-pointer group ${collapsed ? "justify-center" : ""}`}
          >
            <Icon icon="mdi:logout" className="text-lg" />
            {!collapsed && (
              <span className="text-xs font-bold">Déconnexion</span>
            )}
            {collapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#1a1a1a] border border-white/8 text-white text-xs font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Déconnexion
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* ══════ MAIN ══════ */}
      <motion.main
        animate={{ marginLeft: collapsed ? 68 : 240 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 min-w-0 min-h-screen"
      >
        {/* topbar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-white/5"
          style={{
            background: "rgba(13,13,13,0.85)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div>
            <h1 className="text-lg font-black text-white capitalize">
              {NAV.find((n) => n.id === active)?.label || "Dashboard"}
            </h1>
            <p className="text-xs text-zinc-600">
              {new Date().toLocaleDateString("fr-DZ", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadStats}
              title="Actualiser les stats"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <Icon icon="mdi:refresh" />
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/8 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-zinc-400 font-semibold">
                {pendingCount} en attente
              </span>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {active === "dashboard" && (
                <Dashboard stats={stats} loading={statsLoading} />
              )}
              {active === "requests" && (
                <Requests onToast={showToast} onRefreshStats={loadStats} />
              )}
              {active === "announces" && <Announces onToast={showToast} />}
              {active === "users" && <Users onToast={showToast} />}
              {active === "reports" && (
                <Reports onToast={showToast} onRefreshStats={loadStats} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}
