import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Succès ! Redirection...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4">
      <div className="max-w-md w-full bg-[#111827] border border-gray-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Lock size={40} className="text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Réinitialisation</h1>
          <p className="text-gray-400 mt-2">Choisissez votre nouveau mot de passe</p>
        </div>

        {message && <div className="bg-red-900/40 text-red-200 p-3 rounded-lg mb-6 border border-red-500/40 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="w-full px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="w-full px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-400 outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Traitement...' : 'Réinitialiser'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
