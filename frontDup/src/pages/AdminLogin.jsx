import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        navigate('/admin/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl border border-red-500/20">
        <div className="text-center mb-8">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white uppercase tracking-widest">Portail Admin Secret</h1>
          <p className="text-gray-400 mt-2">Accès restreint au personnel autorisé</p>
        </div>

        {error && <div className="bg-red-900/40 text-red-300 p-3 rounded-lg mb-6 border border-red-500/40">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Identifiant Admin"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none"
            value={formData.identifier}
            onChange={(e) => setFormData({...formData, identifier: e.target.value})}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 outline-none"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
          >
            {loading ? 'Authentification...' : <><LogIn size={20} /> Se connecter</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
