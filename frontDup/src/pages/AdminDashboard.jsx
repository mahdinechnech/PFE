import { useState, useEffect } from 'react';
import { Users, Ban, Shield, UserCheck, LogOut, Megaphone, Briefcase, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [annonces, setAnnonces] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (activeTab === 'users') {
        const res = await fetch('/api/admin/users', { headers });
        const data = await res.json();
        if (res.ok) setUsers(data);
      } else if (activeTab === 'annonces') {
        const res = await fetch('/api/annonces', { headers });
        const data = await res.json();
        if (res.ok) setAnnonces(data);
      } else if (activeTab === 'services') {
        const res = await fetch('/api/services', { headers });
        const data = await res.json();
        if (res.ok) setServices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBan = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users/ban/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`/api/admin/users/role/${userId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnonce = async (id) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    try {
      const res = await fetch(`/api/annonces/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Supprimer ce service ?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Shield className="text-red-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-800">Console Administration</h1>
          </div>
          <button onClick={logout} className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            <LogOut size={20} /> Déconnexion
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Users size={20} /> Utilisateurs
          </button>
          <button 
            onClick={() => setActiveTab('annonces')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'annonces' ? 'bg-orange-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Megaphone size={20} /> Annonces
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'services' ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            <Briefcase size={20} /> Services
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Chargement...</div>
          ) : activeTab === 'users' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Utilisateur</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rôle</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Statut</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email || user.phone}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm bg-white"
                        disabled={user.role === 'admin' && user.username === 'admin'}
                      >
                        <option value="client">Client</option>
                        <option value="technicien">Technicien</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isBanned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {user.isBanned ? 'Banni' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      {user.role !== 'admin' && (
                        <button 
                          onClick={() => handleBan(user._id)}
                          className={`p-2 rounded hover:bg-gray-100 ${user.isBanned ? 'text-green-600' : 'text-red-600'}`}
                          title={user.isBanned ? "Débannir" : "Bannir"}
                        >
                          <Ban size={20} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : activeTab === 'annonces' ? (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Titre</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Catégorie</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Auteur</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {annonces.map(annonce => (
                  <tr key={annonce._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {annonce.image && (
                        <img src={annonce.image} alt="" className="w-10 h-10 rounded object-cover border bg-white" />
                      )}
                      <span className="font-medium text-gray-900">{annonce.title}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{annonce.category}</td>
                    <td className="px-6 py-4 text-gray-600">{annonce.creator?.username}</td>
                    <td className="px-6 py-4 text-gray-600 uppercase text-xs font-bold">{annonce.creator?.role}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDeleteAnnonce(annonce._id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Service</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Catégorie</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Prix</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Expert</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {services.map(service => (
                  <tr key={service._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{service.title}</td>
                    <td className="px-6 py-4 text-gray-600">{service.category}</td>
                    <td className="px-6 py-4 text-gray-600">{service.price} DA</td>
                    <td className="px-6 py-4 text-gray-600">{service.creator?.username}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDeleteService(service._id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
