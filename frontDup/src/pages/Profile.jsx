import { useState, useEffect, useRef } from 'react';
import { User, MapPin, FileText, Camera, Save, X, Loader2, Trash2, Edit3, Megaphone, AlertTriangle } from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/contact';
import { motion, AnimatePresence } from 'framer-motion';

const wilayas = [
  "Alger", "Chlef", "Oran", "Blida", "Annaba", "Constantine", "Tlemcen", "Sétif", "Béjaïa", "Batna",
  "Djelfa", "Sidi Bel Abbès", "Tiaret", "Tizi Ouzou", "Skikda", "Biskra", "Béchar", "Bouira", "Tamanrasset",
  "Tébessa", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "El Bayadh", "Illizi", "Bordj Bou Arréridj",
  "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila",
  "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane",
];

const categories = [
  "Plomberie", "Électricité", "Mécanique", "Beauté", "Ménage", "Jardinage", "Livraison", "Baby sitting",
  "maçonnerie", "Peinture", "Charpenterie", "Autre",
];

const Profile = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    bio: '',
    location: '',
    avatar: '',
    role: '',
    _id: ''
  });
  const [myAnnonces, setMyAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [preview, setPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  // Edit Annonce State
  const [editingAnnonce, setEditingAnnonce] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', budget: '', category: '', location: '', image: null });
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updatingAnnonce, setUpdatingAnnonce] = useState(false);
  const editImageInputRef = useRef(null);

  // Deletion Confirmation State
  const [annonceToDelete, setAnnonceToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAnnonce, setDeletingAnnonce] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data);
        if (data.avatar) setPreview(data.avatar);
        fetchMyAnnonces(data._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAnnonces = async (userId) => {
    try {
      const res = await fetch('/api/annonces');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setMyAnnonces(data.filter(a => a.creator?._id === userId || a.creator === userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteAnnonce = (annonce) => {
    setAnnonceToDelete(annonce);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteAnnonce = async () => {
    if (!annonceToDelete) return;
    setDeletingAnnonce(true);
    try {
      const res = await fetch(`/api/annonces/${annonceToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setMyAnnonces(myAnnonces.filter(a => a._id !== annonceToDelete._id));
        setIsDeleteModalOpen(false);
        setAnnonceToDelete(null);
        setMessage({ type: 'success', text: 'Annonce supprimée avec succès' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const data = await res.json();
        alert(data.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setDeletingAnnonce(false);
    }
  };

  const openEditModal = (annonce) => {
    setEditingAnnonce(annonce);
    setEditForm({
      title: annonce.title,
      description: annonce.description,
      budget: annonce.budget || '',
      category: annonce.category,
      location: annonce.location,
      image: null
    });
    setEditImagePreview(annonce.image);
    setIsEditModalOpen(true);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditForm({ ...editForm, image: file });
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateAnnonce = async (e) => {
    e.preventDefault();
    setUpdatingAnnonce(true);
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('category', editForm.category);
      formData.append('location', editForm.location);
      if (editForm.budget) formData.append('budget', editForm.budget);
      if (editForm.image) {
        formData.append('image', editForm.image);
      }

      const res = await fetch(`/api/annonces/${editingAnnonce._id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        fetchMyAnnonces(profile._id);
        setIsEditModalOpen(false);
        setEditingAnnonce(null);
        setEditImagePreview(null);
        setMessage({ type: 'success', text: 'Annonce mise à jour avec succès' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        alert(data.message || "Erreur lors de la mise à jour");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion");
    } finally {
      setUpdatingAnnonce(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('bio', profile.bio);
      formData.append('location', profile.location);
      if (avatarFile) {
        formData.append('avatarFile', avatarFile);
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const updatedUser = await res.json();

      if (res.ok) {
        setProfile(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: updatedUser.message || 'Erreur lors de la mise à jour' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="animate-spin text-orange-500" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showSidebar={false} />
      
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header/Cover */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-40 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl border-4 border-white bg-gray-200 overflow-hidden shadow-lg shadow-orange-200/50">
                    {preview ? (
                      <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <User size={64} />
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-white text-orange-600 rounded-xl shadow-md hover:bg-orange-50 transition-all cursor-pointer border border-orange-100"
                    title="Changer la photo"
                  >
                    <Camera size={18} />
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>
            </div>

            <div className="pt-20 pb-8 px-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs font-black uppercase tracking-wider">
                      {profile.role}
                    </span>
                    <span className="text-gray-400 text-sm font-medium">{profile.email || profile.phone}</span>
                  </div>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-2xl mb-8 flex items-center gap-3 border ${
                  message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {message.type === 'success' ? <Save size={16} /> : <X size={16} />}
                  </div>
                  <span className="font-bold">{message.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <MapPin size={18} className="text-orange-500" /> Votre Wilaya
                    </label>
                    <select 
                      className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-50 font-medium transition-all"
                      value={profile.location}
                      onChange={(e) => setProfile({...profile, location: e.target.value})}
                    >
                      <option value="">Sélectionner une wilaya</option>
                      {wilayas.map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                      <User size={18} className="text-orange-500" /> Nom d'affichage
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-100 font-medium cursor-not-allowed"
                      value={profile.username}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <FileText size={18} className="text-orange-500" /> Bio / Description
                  </label>
                  <textarea 
                    rows="4"
                    className="w-full border border-gray-200 rounded-2xl px-4 py-4 focus:ring-2 focus:ring-orange-500 outline-none resize-none bg-gray-50 font-medium transition-all leading-loose"
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    placeholder="Parlez-nous de vous..."
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-3 cursor-pointer group"
                  >
                    {saving ? <Loader2 className="animate-spin" size={24} /> : (
                      <>
                        <Save size={24} className="group-hover:scale-110 transition-transform" /> 
                        <span className="text-lg">Enregistrer mon profil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Announcements Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-8">
              <Megaphone className="text-orange-500" />
              Mes Annonces
            </h2>

            {myAnnonces.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myAnnonces.map((annonce) => (
                  <motion.div
                    key={annonce._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-gray-50 border border-gray-100 rounded-3xl p-6 relative group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-orange-100 text-orange-600 text-[10px] font-bold uppercase px-3 py-1 rounded-lg">
                        {annonce.category}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(annonce)}
                          className="p-2 bg-white text-blue-500 rounded-xl shadow-sm hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => confirmDeleteAnnonce(annonce)}
                          className="p-2 bg-white text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {annonce.image && (
                      <div className="mb-4 h-48 w-full rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                        <img src={annonce.image} alt={annonce.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <h3 className="font-bold text-gray-800 mb-2">{annonce.title}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2 mb-4 whitespace-pre-wrap leading-loose">{annonce.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
                      <span className="font-bold text-gray-900">{annonce.budget || 'À discuter'} DA</span>
                      <span className="text-[10px] text-gray-400">{new Date(annonce.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">Vous n'avez pas encore publié d'annonces.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            onClick={() => setIsEditModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="text-xl font-bold text-gray-900">Modifier l'annonce</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateAnnonce} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Titre</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Catégorie</label>
                <select 
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Wilaya</label>
                <select 
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Budget (DA)</label>
                <input 
                  type="number" 
                  value={editForm.budget}
                  onChange={(e) => setEditForm({...editForm, budget: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="4"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500 resize-none leading-loose"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Camera size={16} /> Changer l'image
                </label>
                <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 group">
                  {editImagePreview ? (
                    <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Camera size={32} />
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => editImageInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm"
                  >
                    Cliquer pour changer
                  </button>
                  <input 
                    type="file"
                    ref={editImageInputRef}
                    onChange={handleEditImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white py-2">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={updatingAnnonce}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                >
                  {updatingAnnonce ? <Loader2 className="animate-spin" size={20} /> : "Enregistrer"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Custom Red Deletion Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-2">Supprimer l'annonce ?</h3>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer <span className="font-bold text-gray-900">"{annonceToDelete?.title}"</span> ? <br />
                Cette action est irréversible et l'annonce disparaîtra du flux.
              </p>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDeleteAnnonce}
                  disabled={deletingAnnonce}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-lg hover:bg-red-600 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {deletingAnnonce ? <Loader2 className="animate-spin" /> : "Oui, supprimer l'annonce"}
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deletingAnnonce}
                  className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Profile;
