import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

export default function Navbar({
  showLinks = true,
  showAuth = true,
  showSidebar = true,
  showCreate = true,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("currentUser");
      const currentUser = userStr ? JSON.parse(userStr) : null;
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (e) {
      console.error("Error parsing user in Navbar", e);
    }

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (!event.target.closest(".user-account-menu")) {
        setIsAccountDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
    setIsAccountDropdownOpen(false);
    navigate("/login");
  };

  const isHomePage = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-20">
        {/* MENU (Home only) */}
        {showSidebar && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mr-3 p-2 rounded-lg bg-gray-100 cursor-pointer"
          >
            <Icon icon="mdi:menu" className="text-xl text-gray-900" />
          </button>
        )}

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <span className="bg-orange-500 text-white rounded-lg w-8 h-8 flex items-center justify-center font-bold">
            F
          </span>
          <span className="text-2xl font-bold text-gray-900">
            Fix<span className="text-orange-500">It</span>
          </span>
        </Link>

        {/* LINKS */}
        {showLinks && (
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <Link to="/" className="text-gray-600 hover:text-orange-500 font-medium">
                Accueil
              </Link>
            </li>
            <li>
              <a
                href={isHomePage ? "#services" : "/#services"}
                className="text-gray-600 hover:text-orange-500 font-medium"
              >
                Services
              </a>
            </li>
            <li>
              <Link
                to="/annonces"
                className="text-gray-600 hover:text-orange-500 font-medium"
              >
                Annonces
              </Link>
            </li>
            <li>
              <Link
                to="/forum"
                className="text-gray-600 hover:text-orange-500 font-medium"
              >
                Forum
              </Link>
            </li>
            <li>
              <a 
                href={isHomePage ? "#contact" : "/#contact"} 
                className="text-gray-600 hover:text-orange-500 font-medium"
              >
                Contact
              </a>
            </li>
          </ul>
        )}

        {/* SEARCH BAR (always visible) */}
        <div className="hidden md:flex items-center border border-gray-200 rounded-full px-4 py-2 bg-gray-50 focus-within:border-orange-400 transition-all">
          <Icon icon="mdi:magnify" className="text-xl text-gray-400 mr-2" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="outline-none w-40 bg-transparent text-sm"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-3">
          {/* CREATE BUTTONS (Role-based) */}
          <div className="flex gap-2">
            {user && (user.role === 'technicien' || user.role === 'admin') && (
              <Link
                to="/create-service"
                className="border border-orange-500 text-orange-500 font-semibold px-4 py-2 rounded-lg hover:bg-orange-50 transition text-sm"
              >
                Proposer un service
              </Link>
            )}
            <Link
              to="/create-annonce"
              className="border border-blue-500 text-blue-500 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition text-sm"
            >
              Créer une annonce
            </Link>
          </div>

          {/* AUTH SECTION */}
          {user ? (
            <div className="flex items-center gap-3 user-account-menu relative">
              <button 
                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition cursor-pointer"
              >
                <div className="flex flex-col items-end mr-1">
                  <span className="text-sm font-bold text-gray-900">{user.username}</span>
                  <span className="text-[10px] text-orange-500 uppercase font-bold">{user.role}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-md overflow-hidden border-2 border-white">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <Icon 
                  icon="mdi:chevron-down" 
                  className={`text-gray-400 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {isAccountDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in duration-200">
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Connecté en tant que</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user.username}</p>
                  </div>
                  <div className="p-2">
                    <Link 
                      to="/profile" 
                      onClick={() => setIsAccountDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition"
                    >
                      <Icon icon="mdi:account-circle" className="text-lg" /> Mon Profil
                    </Link>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin/dashboard" 
                        onClick={() => setIsAccountDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition font-medium"
                      >
                        <Icon icon="mdi:shield-account" className="text-lg" /> Dashboard Admin
                      </Link>
                    )}
                  </div>
                  <div className="p-2 border-t bg-gray-50/50">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-xl transition cursor-pointer"
                    >
                      <Icon icon="mdi:logout" className="text-lg" /> Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-gray-600 font-semibold px-4 py-2 hover:text-orange-500 transition"
              >
                Connexion
              </Link>
              <Link
                to="/signUp"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* SIDEBAR (HOME ONLY STYLE) */}
      {showSidebar && (
        <div
          className={`fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-xl transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="p-5 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold text-orange-500">
              Filtrer les résultats
            </h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <Icon icon="mdi:close" className="text-xl" />
            </button>
          </div>

          <div className="p-5 space-y-4 text-sm">
            <p className="font-semibold text-gray-700">Filtres </p>

            <input
              className="w-full border p-2 rounded"
              placeholder="Prix min"
            />
            <input
              className="w-full border p-2 rounded"
              placeholder="Prix max"
            />
          </div>

          <div className="absolute bottom-0 w-full p-5 border-t">
            <button className="w-full bg-orange-500 text-white py-3 rounded-lg">
              Appliquer
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
