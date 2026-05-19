import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/login.jsx";
import Signup from "./pages/signUp.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import AnnoncesPage from "./pages/AnnoncesPage.jsx";
import PublicProfile from "./pages/PublicProfile.jsx";
import Forum from "./pages/Forum.jsx";
import CreateAnnonce from "./components/CreateAnnonce.jsx";
import AnnonceDetail from "./pages/annonceDetail.jsx";

// ─────────────────────────────────────────────
// Helper: read current user from localStorage
// ─────────────────────────────────────────────
const getCurrentUser = () => {
  try {
    const str = localStorage.getItem("currentUser");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
};

const isAuthenticated = () =>
  localStorage.getItem("isAuthenticated") === "true";

// ─────────────────────────────────────────────
// ProtectedRoute — must be logged in (+ optional role check)
// ─────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const user = getCurrentUser();

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Admin trying to access client pages → send to dashboard
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // Everyone else → home
    return <Navigate to="/" replace />;
  }

  return children;
};

// ─────────────────────────────────────────────
// GuestRoute — redirect away if already logged in
// (prevents logged-in users from seeing /login, /signUp, /admin-login)
// ─────────────────────────────────────────────
const GuestRoute = ({ children, adminOnly = false }) => {
  const user = getCurrentUser();

  if (isAuthenticated() && user) {
    if (adminOnly && user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (!adminOnly) {
      if (user.role === "admin")
        return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/annonces" replace />;
    }
  }

  return children;
};

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<Home />} />
          <Route path="/annonces" element={<AnnoncesPage />} />
          <Route path="/annonces/:id" element={<AnnonceDetail />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ── Guest-only Routes (redirect if already logged in) ── */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signUp"
            element={
              <GuestRoute>
                <Signup />
              </GuestRoute>
            }
          />
          <Route
            path="/admin-login"
            element={
              <GuestRoute adminOnly>
                <AdminLogin />
              </GuestRoute>
            }
          />

          {/* ── Protected: any authenticated user ── */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-annonce"
            element={
              <ProtectedRoute>
                <CreateAnnonce />
              </ProtectedRoute>
            }
          />

          {/* ── Protected: admin only ── */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
