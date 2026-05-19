/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const API = import.meta.env.VITE_API_URL || "";
const token = () => {
  const t = localStorage.getItem("token");
  console.log("Token exists:", !!t); // Debug log
  return t;
};

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
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  approved: {
    label: "Approuvée",
    cls: "bg-green-50 text-green-700 border-green-200",
    dot: "bg-green-500",
  },

  rejected: {
    label: "Rejetée",
    cls: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
  closed: {
    label: "Fermée",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
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

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    .fixit-root { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8f9fb; color: #1a1a2e; min-height: 100vh; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #e0531a33; border-radius: 4px; }
    .sidebar { background: #fff; border-right: 1px solid #f0f0f0; }
    .nav-btn { transition: all 0.15s ease; border-radius: 12px; width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; background: transparent; border: none; color: #8a8fa8; font-family: inherit; font-size: 14px; font-weight: 500; }
    .nav-btn:hover { background: #fff4f0; color: #e0531a; }
    .nav-btn.active { background: linear-gradient(135deg, #e0531a, #f07030); color: white; box-shadow: 0 4px 14px #e0531a33; }
    .nav-btn.active svg { filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); }
    .card { background: white; border-radius: 16px; border: 1px solid #f0f0f5; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
    .stat-card { background: white; border-radius: 16px; border: 1px solid #f0f0f5; padding: 20px; transition: all 0.2s; cursor: default; }
    .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .btn-primary { background: linear-gradient(135deg, #e0531a, #f07030); color: white; border: none; border-radius: 10px; padding: 9px 18px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: inherit; transition: all 0.15s; }
    .btn-primary:hover { background: linear-gradient(135deg, #c94815, #e0531a); box-shadow: 0 4px 14px #e0531a44; transform: translateY(-1px); }
    .btn-ghost { background: white; border: 1px solid #ebebeb; border-radius: 10px; padding: 9px 16px; font-weight: 600; font-size: 13px; cursor: pointer; color: #666; font-family: inherit; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
    .btn-ghost:hover { border-color: #e0531a; color: #e0531a; background: #fff4f0; }
    .input-field { background: #f8f9fb; border: 1.5px solid #ebebf0; border-radius: 10px; padding: 9px 14px; font-size: 14px; font-family: inherit; color: #1a1a2e; outline: none; transition: border-color 0.15s, box-shadow 0.15s; width: 100%; }
    .input-field:focus { border-color: #e0531a; box-shadow: 0 0 0 3px #e0531a18; background: white; }
    .input-field::placeholder { color: #b0b5c9; }
    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; border: 1px solid transparent; }
    .tab-btn { border-radius: 10px; padding: 7px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; cursor: pointer; font-family: inherit; border: 1px solid #ebebf0; background: white; color: #8a8fa8; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
    .tab-btn:hover { border-color: #e0531a44; color: #e0531a; }
    .tab-btn.active { background: linear-gradient(135deg, #e0531a, #f07030); color: white; border-color: transparent; box-shadow: 0 4px 12px #e0531a2a; }
    .table-row:hover { background: #fff8f5; }
    .toast-success { background: #f0fdf4; border-color: #86efac; color: #15803d; }
    .toast-error { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }
    .topbar { background: rgba(255,255,255,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid #f0f0f5; }
    .orange-tag { background: #fff4f0; color: #e0531a; border: 1px solid #ffd4c0; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 8px; }
  `}</style>
);

/* ─────────────────────────────────────────────────────────────
   SHARED ATOMS
───────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span className={`badge ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
};

const Avatar = ({ user, size = "sm" }) => {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-xl flex items-center justify-center text-white font-black overflow-hidden shrink-0`}
      style={{ background: "linear-gradient(135deg, #e0531a, #f07030)" }}
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
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-gray-100" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin" />
    </div>
  </div>
);

const Field = ({ label, required, children }) => (
  <div>
    <label
      className="block text-[11px] font-700 uppercase tracking-widest mb-1.5 text-gray-400"
      style={{ fontWeight: 700 }}
    >
      {label}
      {required && <span className="text-orange-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = (props) => <input {...props} className="input-field" />;
const Select = ({ children, ...props }) => (
  <select {...props} className="input-field cursor-pointer">
    {children}
  </select>
);
const Textarea = (props) => (
  <textarea {...props} className="input-field resize-none" />
);

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
const Toast = ({ toast }) => (
  <AnimatePresence>
    {toast && (
      <motion.div
        initial={{ opacity: 0, y: -32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -32, scale: 0.95 }}
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-sm font-semibold pointer-events-none ${toast.type === "error" ? "toast-error" : "toast-success"}`}
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
   MODAL
───────────────────────────────────────────────────────────── */
const Modal = ({ title, onClose, children, wide }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(26,26,46,0.45)", backdropFilter: "blur(8px)" }}
  >
    <motion.div
      initial={{ scale: 0.93, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.93, y: 20, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${wide ? "w-full max-w-2xl" : "w-full max-w-md"}`}
      style={{ border: "1px solid #f0f0f5" }}
    >
      <div
        className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #fff8f5, white)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-orange-500 to-orange-300" />
          <h3 className="font-700 text-gray-800" style={{ fontWeight: 700 }}>
            {title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
        >
          <Icon icon="mdi:close" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   CONFIRM DELETE
───────────────────────────────────────────────────────────── */
const ConfirmDelete = ({ label, onConfirm, onCancel, loading }) => (
  <Modal title="Confirmer la suppression" onClose={onCancel}>
    <div className="text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto bg-red-50 border border-red-100">
        <Icon icon="mdi:trash-can-outline" className="text-3xl text-red-500" />
      </div>
      <p className="text-sm text-gray-500 leading-relaxed">
        Supprimer <span className="font-bold text-gray-800">«{label}»</span>{" "}
        définitivement ?
      </p>
      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="btn-ghost flex-1 justify-center">
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Icon icon="mdi:loading" className="animate-spin" />
          ) : (
            <Icon icon="mdi:trash-can-outline" />
          )}
          Supprimer
        </button>
      </div>
    </div>
  </Modal>
);

/* ─────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────── */
const STAT_THEMES = {
  orange: { bg: "#fff4f0", icon: "#e0531a", light: "#ffd4c0" },
  blue: { bg: "#eff6ff", icon: "#2563eb", light: "#bfdbfe" },
  green: { bg: "#f0fdf4", icon: "#16a34a", light: "#bbf7d0" },
  amber: { bg: "#fffbeb", icon: "#d97706", light: "#fde68a" },
  red: { bg: "#fef2f2", icon: "#dc2626", light: "#fecaca" },
  violet: { bg: "#f5f3ff", icon: "#7c3aed", light: "#ddd6fe" },
};

const StatCard = ({ icon, label, value, color, delay = 0 }) => {
  const t = STAT_THEMES[color] || STAT_THEMES.orange;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="stat-card relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-6 translate-x-6"
        style={{ background: t.light, opacity: 0.35 }}
      />
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ background: t.bg, border: `1px solid ${t.light}` }}
      >
        <Icon icon={icon} className="text-xl" style={{ color: t.icon }} />
      </div>
      <p
        className="text-2xl font-800 text-gray-900 mb-0.5"
        style={{ fontWeight: 800 }}
      >
        {fmt(value)}
      </p>
      <p
        className="text-xs font-600 uppercase tracking-widest"
        style={{ color: t.icon, fontWeight: 600 }}
      >
        {label}
      </p>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MINI BAR CHART
───────────────────────────────────────────────────────────── */
const MiniBar = ({ data }) => {
  const max = Math.max(...data.map((d) => d.v), 1);
  return (
    <div className="flex items-end gap-2 h-16">
      {data.map((d, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          style={{
            originY: 1,
            height: `${Math.max((d.v / max) * 100, 6)}%`,
            background:
              i === data.length - 1
                ? "linear-gradient(180deg, #f07030, #e0531a)"
                : "linear-gradient(180deg, #ffd4c0, #ffc0a0)",
            borderRadius: "4px 4px 0 0",
            opacity: 0.4 + (i / data.length) * 0.6,
          }}
          className="flex-1 min-h-[3px]"
          title={`${d.l}: ${d.v}`}
        />
      ))}
    </div>
  );
};

/* ═════════════════════════════════════════════════════════════
   DASHBOARD
═════════════════════════════════════════════════════════════ */
function Dashboard({ stats, loading }) {
  if (loading) return <Spinner />;
  const weekly = stats.weeklyAnnonces || [0, 0, 0, 0, 0, 0, 0];
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const barData = days.map((l, i) => ({ l, v: weekly[i] || 0 }));
  const catData = Object.entries(stats.byCategory || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-2xl font-800 text-gray-900"
          style={{ fontWeight: 800 }}
        >
          Vue d'ensemble
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Statistiques en temps réel de la plateforme
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            icon: "mdi:account-group",
            label: "Utilisateurs",
            value: stats.totalUsers,
            color: "blue",
            delay: 0,
          },
          {
            icon: "mdi:account-wrench",
            label: "Techniciens",
            value: stats.totalTechniciens,
            color: "violet",
            delay: 0.05,
          },
          {
            icon: "mdi:account-circle",
            label: "Clients",
            value: stats.totalClients,
            color: "orange",
            delay: 0.1,
          },
          {
            icon: "mdi:bullhorn",
            label: "Annonces",
            value: stats.totalAnnonces,
            color: "green",
            delay: 0.15,
          },
          {
            icon: "mdi:clock-outline",
            label: "En attente",
            value: stats.pendingAnnonces,
            color: "amber",
            delay: 0.2,
          },
          {
            icon: "mdi:flag",
            label: "Signalements",
            value: stats.openReports,
            color: "red",
            delay: 0.25,
          },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card lg:col-span-2 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                className="font-700 text-gray-800"
                style={{ fontWeight: 700 }}
              >
                Annonces cette semaine
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {fmt(weekly.reduce((a, b) => a + b, 0))} au total
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100">
              <Icon icon="mdi:chart-bar" className="text-orange-500" />
            </div>
          </div>
          <MiniBar data={barData} />
          <div className="flex gap-2 mt-2">
            {days.map((d) => (
              <p
                key={d}
                className="flex-1 text-center text-[10px] font-600 uppercase tracking-widest text-gray-300"
                style={{ fontWeight: 600 }}
              >
                {d}
              </p>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card p-6"
        >
          <h3
            className="font-700 text-gray-800 mb-5"
            style={{ fontWeight: 700 }}
          >
            Par statut
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Approuvées",
                value: stats.approvedAnnonces || 0,
                color: "#16a34a",
              },
              {
                label: "En attente",
                value: stats.pendingAnnonces || 0,
                color: "#d97706",
              },
              {
                label: "Rejetées",
                value: stats.rejectedAnnonces || 0,
                color: "#dc2626",
              },
              {
                label: "Fermées",
                value: stats.closedAnnonces || 0,
                color: "#9ca3af",
              },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span
                    className="text-gray-500 font-500"
                    style={{ fontWeight: 500 }}
                  >
                    {label}
                  </span>
                  <span
                    className="font-700 text-gray-700"
                    style={{ fontWeight: 700 }}
                  >
                    {value}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${stats.totalAnnonces > 0 ? (value / stats.totalAnnonces) * 100 : 0}%`,
                    }}
                    transition={{
                      delay: 0.5,
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <h3 className="font-700 text-gray-800" style={{ fontWeight: 700 }}>
            Annonces par catégorie
          </h3>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {catData.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full">
              Aucune donnée disponible.
            </p>
          ) : (
            catData.map(([cat, count]) => (
              <div
                key={cat}
                className="rounded-2xl p-4 flex flex-col items-center gap-2 bg-gray-50 border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100">
                  <Icon
                    icon={CAT_ICONS[cat] || "mdi:briefcase"}
                    className="text-lg text-orange-500"
                  />
                </div>
                <p
                  className="text-xl font-800 text-gray-800"
                  style={{ fontWeight: 800 }}
                >
                  {count}
                </p>
                <p
                  className="text-[9px] font-700 text-center uppercase tracking-wider text-gray-400 leading-tight"
                  style={{ fontWeight: 700 }}
                >
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

/* ═════════════════════════════════════════════════════════════
   REQUESTS  —  real pending annonces from the DB
═════════════════════════════════════════════════════════════ */
function Requests({ onToast, onRefreshStats }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Try dedicated pending endpoint first; fall back to admin/all + client filter
      const res = await apiFetch("/api/annonces?status=pending");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setList(data.filter((a) => a.status === "pending"));
      } else {
        // fallback: load all as admin and filter
        const res2 = await apiFetch("/api/annonces/admin/all");
        const data2 = await res2.json();
        setList(
          Array.isArray(data2)
            ? data2.filter((a) => a.status === "pending")
            : [],
        );
      }
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

      // Log the response for debugging
      const data = await res.json();
      console.log("Approval response:", data);

      if (!res.ok) throw new Error(data.message || "Erreur lors de l'action");

      // Remove from list immediately
      setList((p) => p.filter((a) => a._id !== id));
      onToast(
        status === "approved" ? "Annonce approuvée ✓" : "Annonce rejetée",
        status === "approved" ? "success" : "error",
      );
      onRefreshStats();
    } catch (err) {
      console.error("Error:", err);
      onToast(err.message || "Erreur lors de l'action.", "error");
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
          <h2
            className="text-2xl font-800 text-gray-900"
            style={{ fontWeight: 800 }}
          >
            Demandes en attente
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {list.length} annonce{list.length !== 1 ? "s" : ""} à traiter
          </p>
        </div>
        <button onClick={load} className="btn-ghost">
          <Icon icon="mdi:refresh" /> Actualiser
        </button>
      </div>

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
                  placeholder="Ex: contenu inapproprié…"
                  rows={3}
                />
              </Field>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  className="btn-ghost flex-1 justify-center"
                >
                  Annuler
                </button>
                <button
                  onClick={() => decide(rejectModal, "rejected", rejectReason)}
                  disabled={actionId === rejectModal}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionId === rejectModal ? (
                    <Icon icon="mdi:loading" className="animate-spin" />
                  ) : (
                    <Icon icon="mdi:close-circle-outline" />
                  )}
                  Rejeter
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {list.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-green-50 border border-green-100">
            <Icon icon="mdi:check-all" className="text-3xl text-green-500" />
          </div>
          <p
            className="text-sm font-600 text-gray-400 uppercase tracking-widest"
            style={{ fontWeight: 600 }}
          >
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
                className="card overflow-hidden hover:shadow-md transition"
              >
                <div className="h-36 relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
                  {a.image ? (
                    <img
                      src={resolveImage(a.image)}
                      alt={a.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon
                        icon={CAT_ICONS[a.category] || "mdi:image"}
                        className="text-5xl text-orange-200"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                  <span className="orange-tag absolute top-3 left-3">
                    {a.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-700 text-gray-900 text-sm line-clamp-1"
                        style={{ fontWeight: 700 }}
                      >
                        {a.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                        {a.description}
                      </p>
                    </div>
                    <p
                      className="font-800 text-sm text-gray-800 shrink-0"
                      style={{ fontWeight: 800 }}
                    >
                      {a.budget > 0 ? `${fmt(a.budget)} DA` : "À discuter"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar user={a.creator} />
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-700 text-gray-800 truncate"
                        style={{ fontWeight: 700 }}
                      >
                        {a.creator?.username || "Inconnu"}
                      </p>
                      {/* Show role badge */}
                      {a.creator?.role && (
                        <span
                          className={`text-[10px] font-700 uppercase tracking-widest px-1.5 py-0.5 rounded-md ${a.creator.role === "technicien" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-500"}`}
                          style={{ fontWeight: 700 }}
                        >
                          {a.creator.role}
                        </span>
                      )}
                      {a.location && (
                        <p className="text-[11px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <Icon
                            icon="mdi:map-marker-outline"
                            className="text-xs"
                          />
                          {a.location}
                        </p>
                      )}
                    </div>
                    <span
                      className="text-[11px] text-gray-300 font-500"
                      style={{ fontWeight: 500 }}
                    >
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
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-700 bg-green-50 text-green-600 border border-green-200 hover:bg-green-500 hover:text-white hover:border-green-500 transition cursor-pointer disabled:opacity-40"
                      style={{ fontWeight: 700 }}
                    >
                      {actionId === a._id ? (
                        <Icon icon="mdi:loading" className="animate-spin" />
                      ) : (
                        <Icon icon="mdi:check-circle-outline" />
                      )}
                      Approuver
                    </button>
                    <button
                      onClick={() => setRejectModal(a._id)}
                      disabled={actionId === a._id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-700 bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 transition cursor-pointer disabled:opacity-40"
                      style={{ fontWeight: 700 }}
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

/* ═════════════════════════════════════════════════════════════
   ANNOUNCES
═════════════════════════════════════════════════════════════ */
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
              <option key={c} value={c}>
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
              <option key={w} value={w}>
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
              <option key={s} value={s}>
                {STATUS_CFG[s]?.label || s}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className="btn-ghost flex-1 justify-center">
          Annuler
        </button>
        <button
          onClick={save}
          disabled={loading}
          className="btn-primary flex-1 justify-center"
        >
          {loading ? (
            <Icon icon="mdi:loading" className="animate-spin" />
          ) : (
            <Icon icon="mdi:check" />
          )}
          {annonce ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </Modal>
  );
}

function Announces({ onToast, onRefreshStats }) {
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
      onRefreshStats();
    } catch {
      onToast("Erreur suppression.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await apiFetch(`/api/annonces/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setList((p) => p.map((a) => (a._id === id ? { ...a, status } : a)));
      onToast("Statut mis à jour.");
      onRefreshStats();
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
      count: list.filter(
        (a) => a.status === "approved" || a.status === "pending",
      ).length,
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
              onRefreshStats();
            }}
            onToast={onToast}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            className="text-2xl font-800 text-gray-900"
            style={{ fontWeight: 800 }}
          >
            Toutes les annonces
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="input-field pl-9 w-44"
            />
          </div>
          <button onClick={() => setAddModal(true)} className="btn-primary">
            <Icon icon="mdi:plus" /> Créer
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`tab-btn ${filter === t.key ? "active" : ""}`}
          >
            {t.label}
            <span
              className={`min-w-5 h-5 rounded-full text-[9px] px-1 flex items-center justify-center font-800 ${filter === t.key ? "bg-white/25" : "bg-gray-100 text-gray-500"}`}
              style={{ fontWeight: 800 }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-5 py-3 border-b border-gray-50 bg-gray-50/70">
            {["Annonce", "Catégorie", "Auteur", "Statut", "Actions"].map(
              (h) => (
                <p
                  key={h}
                  className="text-[10px] font-700 uppercase tracking-widest text-gray-400"
                  style={{ fontWeight: 700 }}
                >
                  {h}
                </p>
              ),
            )}
          </div>
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-sm text-gray-400">
              Aucune annonce trouvée.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((a) => (
                <div
                  key={a._id}
                  className="table-row grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-5 py-4 items-center transition group"
                >
                  <div className="min-w-0 pr-4">
                    <p
                      className="text-sm font-700 text-gray-900 truncate"
                      style={{ fontWeight: 700 }}
                    >
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {a.description?.slice(0, 55)}…
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon={CAT_ICONS[a.category] || "mdi:tag"}
                      className="text-sm text-orange-400 shrink-0"
                    />
                    <span className="text-xs text-gray-500 truncate">
                      {a.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar user={a.creator} />
                    <span className="text-xs text-gray-500 truncate">
                      {a.creator?.username || "—"}
                    </span>
                  </div>
                  <div>
                    <select
                      value={a.status}
                      onChange={(e) =>
                        handleStatusChange(a._id, e.target.value)
                      }
                      className="bg-transparent border-0 text-xs font-600 cursor-pointer outline-none text-gray-500"
                      style={{ fontFamily: "inherit", fontWeight: 600 }}
                    >
                      {["pending", "approved", "rejected", "closed"].map(
                        (s) => (
                          <option key={s} value={s}>
                            {STATUS_CFG[s]?.label || s}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditTarget(a)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition cursor-pointer"
                    >
                      <Icon icon="mdi:pencil-outline" className="text-sm" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(a)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
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

/* ═════════════════════════════════════════════════════════════
   USERS
═════════════════════════════════════════════════════════════ */
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
              <option key={r} value={r}>
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
              <option key={w} value={w}>
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
        <button onClick={onClose} className="btn-ghost flex-1 justify-center">
          Annuler
        </button>
        <button
          onClick={save}
          disabled={loading}
          className="btn-primary flex-1 justify-center"
        >
          {loading ? (
            <Icon icon="mdi:loading" className="animate-spin" />
          ) : (
            <Icon icon="mdi:check" />
          )}
          {user ? "Enregistrer" : "Créer"}
        </button>
      </div>
    </Modal>
  );
}

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

  const rc = {
    all: list.length,
    client: list.filter((u) => u.role === "client").length,
    technicien: list.filter((u) => u.role === "technicien").length,
  };

  const ROLE_STYLE = {
    admin: "bg-violet-50 text-violet-700 border-violet-200",
    technicien: "bg-blue-50 text-blue-700 border-blue-200",
    client: "bg-gray-50 text-gray-500 border-gray-200",
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
          <h2
            className="text-2xl font-800 text-gray-900"
            style={{ fontWeight: 800 }}
          >
            Utilisateurs
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Icon
              icon="mdi:magnify"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="input-field pl-9 w-44"
            />
          </div>
          <div className="flex rounded-xl overflow-hidden border border-gray-100">
            {[
              { key: "all", label: `Tous (${rc.all})` },
              { key: "client", label: `Clients (${rc.client})` },
              { key: "technicien", label: `Tech. (${rc.technicien})` },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => setRoleFilter(r.key)}
                className={`px-3 py-2 text-[11px] font-700 uppercase tracking-widest transition cursor-pointer ${roleFilter === r.key ? "bg-orange-500 text-white" : "bg-white text-gray-400 hover:bg-orange-50 hover:text-orange-500"}`}
                style={{ fontWeight: 700 }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => setAddModal(true)} className="btn-primary">
            <Icon icon="mdi:plus" /> Ajouter
          </button>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-3 border-b border-gray-50 bg-gray-50/70">
            {["Utilisateur", "Rôle", "Contact", "Inscrit le", "Actions"].map(
              (h) => (
                <p
                  key={h}
                  className="text-[10px] font-700 uppercase tracking-widest text-gray-400"
                  style={{ fontWeight: 700 }}
                >
                  {h}
                </p>
              ),
            )}
          </div>
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-sm text-gray-400">
              Aucun utilisateur trouvé.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <div
                  key={u._id}
                  className="table-row grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-5 py-3.5 items-center transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar user={u} />
                    <div className="min-w-0">
                      <p
                        className="text-sm font-700 text-gray-900 truncate"
                        style={{ fontWeight: 700 }}
                      >
                        {u.username}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {u.email || u.phone}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`badge ${ROLE_STYLE[u.role] || ROLE_STYLE.client}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${u.role === "admin" ? "bg-violet-400" : u.role === "technicien" ? "bg-blue-400" : "bg-gray-400"}`}
                      />
                      {u.role || "client"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">
                    {u.email || u.phone || "—"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("fr-DZ", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditTarget(u)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white transition cursor-pointer"
                    >
                      <Icon icon="mdi:pencil-outline" className="text-sm" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
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

/* ═════════════════════════════════════════════════════════════
   REPORTS
═════════════════════════════════════════════════════════════ */
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
  const tabs = [
    {
      key: "pending",
      label: "Ouverts",
      count: list.filter((r) => r.status === "en attente").length,
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
          <h2
            className="text-2xl font-800 text-gray-900"
            style={{ fontWeight: 800 }}
          >
            Signalements
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {list.filter((r) => r.status === "pending").length} signalement
            {list.filter((r) => r.status === "pending").length !== 1
              ? "s"
              : ""}{" "}
            en attente
            {list.filter((r) => r.status === "open").length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={load} className="btn-ghost">
          <Icon icon="mdi:refresh" /> Actualiser
        </button>
      </div>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`tab-btn ${filter === t.key ? "active" : ""}`}
          >
            {t.label}
            <span
              className={`min-w-5 h-5 rounded-full text-[9px] px-1 flex items-center justify-center font-800 ${filter === t.key ? "bg-white/25" : "bg-gray-100 text-gray-500"}`}
              style={{ fontWeight: 800 }}
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-green-50 border border-green-100">
            <Icon
              icon="mdi:shield-check-outline"
              className="text-3xl text-green-500"
            />
          </div>
          <p
            className="text-sm font-600 text-gray-400 uppercase tracking-widest"
            style={{ fontWeight: 600 }}
          >
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
                className={`card p-5 transition ${r.status !== "open" ? "opacity-60" : ""}`}
                style={{
                  borderColor: r.status === "open" ? "#fecaca" : "#f0f0f5",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`badge ${r.status === "pending" ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${r.status === "open" ? "bg-red-400" : "bg-green-400"}`}
                        />
                        {r.status === "pending" ? "Ouvert" : "Résolu"}
                      </span>
                      <span className="text-[11px] text-gray-300">
                        {new Date(r.createdAt).toLocaleDateString("fr-DZ")}
                      </span>
                    </div>
                    <p
                      className="font-700 text-gray-800 text-sm mb-1"
                      style={{ fontWeight: 700 }}
                    >
                      {r.reason || "Signalement"}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                      {r.description || r.content}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      {r.reporter && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Icon
                            icon="mdi:account-outline"
                            className="text-sm"
                          />
                          Signalé par :{" "}
                          <span
                            className="font-700 text-gray-700"
                            style={{ fontWeight: 700 }}
                          >
                            {r.reporter?.username || "—"}
                          </span>
                        </div>
                      )}
                      {r.annonce && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Icon
                            icon="mdi:bullhorn-outline"
                            className="text-sm"
                          />
                          Annonce :{" "}
                          <span
                            className="font-700 text-gray-700"
                            style={{ fontWeight: 700 }}
                          >
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
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-700 bg-green-50 text-green-600 border border-green-200 hover:bg-green-500 hover:text-white hover:border-green-500 transition cursor-pointer disabled:opacity-40"
                        style={{ fontWeight: 700 }}
                      >
                        {actionId === r._id ? (
                          <Icon icon="mdi:loading" className="animate-spin" />
                        ) : (
                          <Icon icon="mdi:check" />
                        )}
                        Résoudre
                      </button>
                      <button
                        onClick={() => resolve(r._id, "dismissed")}
                        disabled={actionId === r._id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-700 bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-200 transition cursor-pointer disabled:opacity-40"
                        style={{ fontWeight: 700 }}
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

  /**
   * loadStats: tries /api/admin/stats first (dedicated endpoint).
   * If that fails or returns incomplete data, reconstructs stats
   * from /api/admin/users + /api/annonces/admin/all + /api/reports
   * so openReports is always real, never zeroed.
   */
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await apiFetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        // Verify it has the fields we need; if openReports is missing, fetch it
        if (data && typeof data.totalUsers === "number") {
          // If openReports is missing from the stats endpoint, fetch separately
          if (typeof data.openReports !== "number") {
            try {
              const rRes = await apiFetch("/api/reports");
              const rData = await rRes.json();
              data.openReports = Array.isArray(rData)
                ? rData.filter((r) => r.status === "open").length
                : 0;
            } catch {
              data.openReports = 0;
            }
          }
          setStats(data);
          return;
        }
      }
    } catch {
      // fall through to manual reconstruction
    }

    // Manual reconstruction from raw endpoints
    try {
      const [uRes, aRes, rRes] = await Promise.all([
        apiFetch("/api/admin/users"),
        apiFetch("/api/annonces/admin/all"),
        apiFetch("/api/reports"),
      ]);
      const users = await uRes.json();
      const annonces = await aRes.json();
      const reports = await rRes.json();

      const uArr = Array.isArray(users) ? users : [];
      const aArr = Array.isArray(annonces) ? annonces : [];
      const rArr = Array.isArray(reports) ? reports : [];

      // Build weekly annonces (last 7 days Mon–Sun)
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
      startOfWeek.setHours(0, 0, 0, 0);
      const weekly = Array(7).fill(0);
      aArr.forEach((a) => {
        const d = new Date(a.createdAt);
        const diff = Math.floor((d - startOfWeek) / 86400000);
        if (diff >= 0 && diff < 7) weekly[diff]++;
      });

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
        openReports: rArr.filter((r) => r.status === "open").length,
        byCategory: aArr.reduce(
          (acc, a) => ({ ...acc, [a.category]: (acc[a.category] || 0) + 1 }),
          {},
        ),
        weeklyAnnonces: weekly,
      });
    } catch {
      /* silent — dashboard will show zeros */
    } finally {
      setStatsLoading(false);
    }
    setStatsLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

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
    <div className="fixit-root min-h-screen flex">
      <GlobalStyles />
      <Toast toast={toast} />

      {/* ══════ SIDEBAR ══════ */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="sidebar fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden shadow-sm"
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed ? "justify-center" : ""}`}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: "linear-gradient(135deg, #e0531a, #f07030)" }}
          >
            <Icon icon="mdi:wrench" className="text-white text-base" />
          </div>
          {!collapsed && (
            <div>
              <p
                className="font-800 text-gray-900 text-sm leading-none"
                style={{ fontWeight: 800 }}
              >
                Fix<span className="text-orange-500">It</span>
              </p>
              <p
                className="text-[10px] text-gray-400 font-600 uppercase tracking-widest mt-0.5"
                style={{ fontWeight: 600 }}
              >
                Admin
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
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
                className={`nav-btn ${isActive ? "active" : ""} ${collapsed ? "justify-center" : ""} relative group`}
              >
                <Icon
                  icon={isActive ? item.activeIcon : item.icon}
                  className="text-xl shrink-0"
                />
                {!collapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {badge > 0 && (
                  <span
                    className={`${collapsed ? "absolute -top-1 -right-1 min-w-4 h-4" : "min-w-5 h-5"} px-1 rounded-full text-[9px] font-800 flex items-center justify-center shrink-0 ${isActive ? "bg-white/30 text-white" : "bg-orange-500 text-white"}`}
                    style={{ fontWeight: 800 }}
                  >
                    {badge}
                  </span>
                )}
                {collapsed && (
                  <span
                    className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-600 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg"
                    style={{ fontWeight: 600 }}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-gray-100 space-y-1">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl mb-1 bg-orange-50">
              <Avatar user={adminUser} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-700 text-gray-800 truncate"
                  style={{ fontWeight: 700 }}
                >
                  {adminUser?.username}
                </p>
                <p
                  className="text-[10px] font-600 text-orange-500 uppercase tracking-widest"
                  style={{ fontWeight: 600 }}
                >
                  Admin
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`nav-btn ${collapsed ? "justify-center" : ""}`}
          >
            <Icon
              icon={collapsed ? "mdi:chevron-right" : "mdi:chevron-left"}
              className="text-lg"
            />
            {!collapsed && (
              <span
                className="text-xs font-600 uppercase tracking-widest"
                style={{ fontWeight: 600 }}
              >
                Réduire
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            title={collapsed ? "Déconnexion" : undefined}
            className={`nav-btn hover:!bg-red-50 hover:!text-red-500 ${collapsed ? "justify-center" : ""} group relative`}
          >
            <Icon icon="mdi:logout" className="text-lg" />
            {!collapsed && (
              <span
                className="text-xs font-600 uppercase tracking-widest"
                style={{ fontWeight: 600 }}
              >
                Déconnexion
              </span>
            )}
            {collapsed && (
              <span
                className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-600 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg"
                style={{ fontWeight: 600 }}
              >
                Déconnexion
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* ══════ MAIN ══════ */}
      <motion.main
        animate={{ marginLeft: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 min-w-0 min-h-screen"
      >
        {/* Topbar */}
        <div className="topbar sticky top-0 z-30 flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-orange-500 to-orange-300" />
            <div>
              <h1
                className="font-800 text-gray-900 text-base capitalize"
                style={{ fontWeight: 800 }}
              >
                {NAV.find((n) => n.id === active)?.label || "Dashboard"}
              </h1>
              <p
                className="text-[11px] text-gray-400 font-500"
                style={{ fontWeight: 500 }}
              >
                {new Date().toLocaleDateString("fr-DZ", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadStats}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 bg-white border border-gray-100 hover:border-orange-300 hover:text-orange-500 transition cursor-pointer shadow-sm"
            >
              <Icon icon="mdi:refresh" />
            </button>
            {pendingCount > 0 && (
              <button
                onClick={() => setActive("requests")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span
                  className="text-[11px] font-700 text-orange-600 uppercase tracking-widest"
                  style={{ fontWeight: 700 }}
                >
                  {pendingCount} en attente
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {active === "dashboard" && (
                <Dashboard stats={stats} loading={statsLoading} />
              )}
              {active === "requests" && (
                <Requests onToast={showToast} onRefreshStats={loadStats} />
              )}
              {active === "announces" && (
                <Announces onToast={showToast} onRefreshStats={loadStats} />
              )}
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
