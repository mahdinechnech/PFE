import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import CreateService from "./components/CreateService.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  let user = null;
  try {
    const userStr = localStorage.getItem("currentUser");
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage", e);
  }
  
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no allowedRoles specified, just need authentication
  if (!allowedRoles) return children;

  // Check role
  const userRole = user.role || 'client';
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/annonces" element={<AnnoncesPage />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/profile/:id" element={<PublicProfile />} />
          
          {/* Admin Secret Route */}
          <Route path="/secret/admin/admin-login" element={<AdminLogin />} />

          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
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

          <Route 
            path="/create-service" 
            element={
              <ProtectedRoute allowedRoles={['technicien', 'admin']}>
                <CreateService />
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
