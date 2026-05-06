import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Wrench, ShieldCheck, Briefcase, Check } from 'lucide-react';

const ROLES = [
  {
    id: 'client',
    label: 'Client',
    icon: <User size={24} />,
    desc: 'Demander des services et réparations',
    color: 'blue',
  },
  {
    id: 'technicien',
    label: 'Technicien',
    icon: <Wrench size={24} />,
    desc: 'Proposer vos services et gérer les missions',
    color: 'yellow',
  },
];

const colorMap = {
  blue: {
    ring: 'ring-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/60',
    text: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  yellow: {
    ring: 'ring-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/60',
    text: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-300',
  },
  red: {
    ring: 'ring-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/60',
    text: 'text-red-400',
    badge: 'bg-red-500/20 text-red-300',
  },
};

const Signup = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const selectRole = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
    if (errors.role) setErrors(prev => ({ ...prev, role: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role) {
      newErrors.role = 'Veuillez choisir un rôle pour continuer';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }

    if (formData.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.phone)) {
      newErrors.phone = 'Veuillez entrer un numéro de téléphone valide';
    }

    if (!formData.email && !formData.phone) {
      newErrors.contact = 'Veuillez fournir une adresse email ou un numéro de téléphone';
    }

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est obligatoire";
    } else if (formData.username.length < 3) {
      newErrors.username = "Le nom d'utilisateur doit contenir au moins 3 caractères";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores";
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est obligatoire';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        navigate('/');
      } else {
        setErrors({ general: data.message || 'Erreur lors de l\'inscription' });
      }
    } catch (err) {
      setErrors({ general: 'Erreur de connexion au serveur' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === formData.role);
  const selectedColors = selectedRole ? colorMap[selectedRole.color] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] p-4 relative overflow-hidden">

      {/* Background FX */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute w-125 h-125 bg-yellow-500 blur-3xl rounded-full top-10 left-10" />
        <div className="absolute w-125 h-125 bg-blue-500 blur-3xl rounded-full bottom-10 right-10" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-2xl bg-[#111827] border border-gray-700 rounded-2xl shadow-2xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <Briefcase size={40} className="text-yellow-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Rejoindre <span className="text-yellow-400">FixIt</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Créez votre compte de services et réparations
          </p>
        </div>

        {/* ── ROLE SELECTOR ── */}
        <div className="mb-6">
          <label className="text-gray-300 text-sm block mb-3">
            Choisissez votre rôle <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {ROLES.map(role => {
              const colors = colorMap[role.color];
              const isSelected = formData.role === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => selectRole(role.id)}
                  className={`
                    relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer
                    transition-all duration-200 text-center
                    ${isSelected
                      ? `${colors.bg} ${colors.border} ring-2 ${colors.ring} scale-[1.03]`
                      : 'bg-[#0b1220] border-gray-700 hover:border-gray-500 hover:bg-white/5'
                    }
                  `}
                >
                  {isSelected && (
                    <span className={`absolute top-2 right-2 p-1 rounded-full font-semibold ${colors.badge}`}>
                      <Check size={12} />
                    </span>
                  )}
                  <span className="text-2xl">{role.icon}</span>
                  <span className={`font-bold text-sm ${isSelected ? colors.text : 'text-gray-300'}`}>
                    {role.label}
                  </span>
                  <span className="text-gray-500 text-xs leading-tight hidden sm:block">
                    {role.desc}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="text-red-400 text-xs mt-2">{errors.role}</p>
          )}
        </div>

        {/* Selected role badge */}
        {selectedRole && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border mb-5 ${selectedColors.bg} ${selectedColors.border}`}>
            <span className="text-lg">{selectedRole.icon}</span>
            <span className={`text-sm font-medium ${selectedColors.text}`}>
              Vous vous inscrivez en tant que <strong>{selectedRole.label}</strong>
            </span>
          </div>
        )}

        {/* Error messages */}
        {(errors.contact || errors.general) && (
          <div className="bg-red-900/40 text-red-300 p-3 rounded-lg border border-red-500/40 mb-5">
            {errors.contact || errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-300 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@email.com"
                className="w-full mt-2 px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-gray-300 text-sm">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+213..."
                className="w-full mt-2 px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-gray-300 text-sm">Nom d'utilisateur</label>
            <input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="utilisateur_fixit"
              className="w-full mt-2 px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-300 text-sm">Mot de passe</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Créer un mot de passe"
                className="w-full px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none pr-20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-3 py-1 bg-gray-800 text-yellow-400 rounded-2xl cursor-pointer"
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-gray-300 text-sm">Confirmer le mot de passe</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Répéter le mot de passe"
              className="w-full mt-2 px-4 py-3 bg-[#0b1220] border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-bold text-black bg-gradient-to-r from-yellow-400 to-orange-500 transition-all shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-yellow-300 hover:to-orange-600 hover:scale-[1.02] cursor-pointer'}`}
          >
            <div className="flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Inscription en cours...</span>
                </>
              ) : (
                <>
                  <Briefcase size={20} />
                  <span>Créer un compte FixIt</span>
                </>
              )}
            </div>
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 border-t border-gray-700 pt-4">
          <p className="text-gray-400 text-sm">
            Déjà membre FixIt ?{' '}
            <Link to="/login" className="text-yellow-400 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
