import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Un lien de réinitialisation a été généré. (Dev mode: check response)');
        console.log('Reset Token:', data.resetToken);
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
          <Mail size={40} className="text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Mot de passe oublié ?</h1>
          <p className="text-gray-400 mt-2">Entrez votre email pour recevoir un lien</p>
        </div>

        {message && <div className="bg-blue-900/40 text-blue-200 p-3 rounded-lg mb-6 border border-blue-500/40 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="votre@email.com"
            className="w-full px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        <Link to="/login" className="flex items-center justify-center gap-2 text-gray-400 mt-6 hover:text-white transition">
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
