import { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Shield, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'client' | 'pro'>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        const result = login(email, password);
        if (!result.success) {
          setError(result.error || 'Errore di accesso');
        } else {
          onClose();
          resetForm();
        }
      } else {
        if (!name.trim()) { setError('Inserisci nome e cognome'); setLoading(false); return; }
        if (!phone.trim()) { setError('Inserisci il telefono'); setLoading(false); return; }
        if (password.length < 6) { setError('La password deve avere almeno 6 caratteri'); setLoading(false); return; }

        const result = register({ email, password, name, phone, role });
        if (!result.success) {
          setError(result.error || 'Errore di registrazione');
        } else {
          onClose();
          resetForm();
        }
      }
      setLoading(false);
    }, 400);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'login' ? 'Accedi al tuo account' : 'Crea il tuo account'}
              </h2>
              <p className="text-emerald-100 text-sm mt-0.5">
                {mode === 'login' ? 'Inserisci le tue credenziali' : 'Registrati per iniziare'}
              </p>
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'login' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Accedi
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'register' ? 'text-emerald-700 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Registrati
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Role Selection (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tipo di account</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${role === 'client' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <User className={`w-5 h-5 mb-1 ${role === 'client' ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <div className={`text-sm font-bold ${role === 'client' ? 'text-emerald-700' : 'text-gray-700'}`}>Cliente</div>
                  <div className="text-xs text-gray-500 mt-0.5">Acquista prodotti</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('pro')}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${role === 'pro' ? 'border-amber-500 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <Crown className={`w-5 h-5 mb-1 ${role === 'pro' ? 'text-amber-600' : 'text-gray-400'}`} />
                  <div className={`text-sm font-bold ${role === 'pro' ? 'text-amber-700' : 'text-gray-700'}`}>Pro</div>
                  <div className="text-xs text-gray-500 mt-0.5">Guadagna commissioni</div>
                </button>
              </div>
            </div>
          )}

          {/* Name (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome e Cognome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Mario Rossi"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="mario@esempio.it"
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Inserisci password"
                className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
                minLength={mode === 'register' ? 6 : undefined}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Phone (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Telefono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+39 333 123 4567"
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Caricamento...' : mode === 'login' ? 'Accedi' : 'Registrati'}
          </button>

          {/* Demo credentials */}
          {mode === 'login' && (
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-xs font-bold text-gray-600 mb-2">Account demo:</p>
              <div className="space-y-1.5 text-xs text-gray-500">
                <button type="button" onClick={() => { setEmail('admin@bianchipro.it'); setPassword('admin123'); }} className="block w-full text-left hover:bg-gray-100 rounded px-2 py-1 transition-colors">
                  <span className="font-bold text-red-600">Admin:</span> admin@bianchipro.it / admin123
                </button>
                <button type="button" onClick={() => { setEmail('pro@test.it'); setPassword('test123'); }} className="block w-full text-left hover:bg-gray-100 rounded px-2 py-1 transition-colors">
                  <span className="font-bold text-amber-600">Pro:</span> pro@test.it / test123
                </button>
                <button type="button" onClick={() => { setEmail('cliente@test.it'); setPassword('test123'); }} className="block w-full text-left hover:bg-gray-100 rounded px-2 py-1 transition-colors">
                  <span className="font-bold text-emerald-600">Cliente:</span> cliente@test.it / test123
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
