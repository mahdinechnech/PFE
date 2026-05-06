import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, MapPin, FileText, Loader2, Megaphone, ArrowLeft, Trash2 } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/contact';
import { motion } from 'framer-motion';

const PublicProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    try {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) setCurrentUser(JSON.parse(userStr));
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }, [id]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch user profile
      const userRes = await fetch(`/api/users/${id}`);
      const userData = await userRes.json();
      
      if (!userRes.ok) throw new Error(userData.message || 'Utilisateur non trouvé');
      setUser(userData);

      // Fetch user's annonces (optional: filter by creator if backend supports it, 
      // or filter locally for now since we fetch all annonces)
      const annoncesRes = await fetch('/api/annonces');
      const allAnnonces = await annoncesRes.json();
      if (annoncesRes.ok && Array.isArray(allAnnonces)) {
        setAnnonces(allAnnonces.filter(a => a.creator?._id === id || a.creator === id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnonce = async (annonceId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette annonce ?")) return;

    try {
      const res = await fetch(`/api/annonces/${annonceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        setAnnonces(annonces.filter(a => a._id !== annonceId));
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Erreur de connexion au serveur");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-orange-500" size={48} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md border border-gray-100">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Oups !</h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/annonces" className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200">
          Retour aux annonces
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSidebar={false} />
      
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-40"></div>
            <div className="px-8 pb-8">
              <div className="relative flex flex-col md:flex-row md:items-end gap-6 -mt-16 mb-8">
                <div className="w-32 h-32 rounded-3xl border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                      <User size={64} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-red-100 text-red-600' :
                      user.role === 'technicien' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {user.role}
                    </span>
                    {user.location && (
                      <span className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                        <MapPin size={14} className="text-red-500" /> {user.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {user.bio && (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                    <FileText size={16} className="text-blue-500" /> À propos
                  </h2>
                  <p className="text-gray-600 leading-loose whitespace-pre-wrap">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* User's Annonces */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Megaphone className="text-orange-500" />
              Annonces de {user.username}
            </h2>

            {annonces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {annonces.map((annonce) => (
                  <motion.div
                    key={annonce._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 rounded-3xl p-6 hover:border-orange-300 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-orange-50 text-orange-600 text-[10px] font-bold uppercase px-3 py-1 rounded-lg">
                        {annonce.category}
                      </div>
                      {currentUser && (annonce.creator?._id === currentUser._id || annonce.creator === currentUser._id) && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteAnnonce(annonce._id);
                          }}
                          className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                          title="Supprimer l'annonce"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {annonce.image && (
                      <div className="mb-4 h-48 w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                        <img src={annonce.image} alt={annonce.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <h3 className="font-bold text-gray-800 text-lg mb-2">{annonce.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 whitespace-pre-wrap leading-loose">{annonce.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="font-bold text-gray-900">{annonce.budget || 'À discuter'} DA</span>
                      <span className="text-gray-400 text-xs">{new Date(annonce.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center">
                <p className="text-gray-400 font-medium">Cet utilisateur n'a pas encore publié d'annonces.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfile;
