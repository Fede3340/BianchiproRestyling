import { User, Crown, Shield, Mail, Phone, Calendar, LogOut, Wallet, Settings, ChevronRight, Copy, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';

interface AccountPageProps {
  onNavigate: (page: string) => void;
}

export default function AccountPage({ onNavigate }: AccountPageProps) {
  const { user, logout } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);

  if (!user) return null;

  const isPro = user.role === 'pro';
  const isAdmin = user.role === 'admin';

  const copyReferralCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      toast.success('Codice copiato!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const roleConfig = {
    client: { label: 'Cliente', color: 'emerald', icon: User, bg: 'from-emerald-500 to-teal-600' },
    pro: { label: 'Professionista', color: 'amber', icon: Crown, bg: 'from-amber-500 to-orange-600' },
    admin: { label: 'Amministratore', color: 'slate', icon: Shield, bg: 'from-slate-700 to-slate-900' },
  };

  const config = roleConfig[user.role];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className={`bg-gradient-to-br ${config.bg} rounded-2xl p-6 mb-6 text-white shadow-lg`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <config.icon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-0.5 rounded-full text-sm font-bold">
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Informazioni account</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-semibold text-gray-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Telefono</p>
              <p className="text-sm font-semibold text-gray-900">{user.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Registrato il</p>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          {isPro && user.referralCode && (
            <div className="flex items-center gap-3">
              <Crown className="w-4 h-4 text-amber-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Codice Referral</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-amber-700">{user.referralCode}</p>
                  <button onClick={copyReferralCode} className="p-1 hover:bg-gray-100 rounded transition-colors">
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="space-y-2">
        <button
          onClick={() => onNavigate('wallet')}
          className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-left shadow-sm"
        >
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900">Il Mio Wallet</p>
            <p className="text-sm text-gray-500">Saldo: {user.walletBalance.toFixed(2)}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        {isAdmin && (
          <button
            onClick={() => onNavigate('admin')}
            className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors text-left shadow-sm"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Pannello Admin</p>
              <p className="text-sm text-gray-500">Gestisci utenti e prelievi</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}

        <button
          onClick={() => { logout(); onNavigate('home'); }}
          className="w-full flex items-center gap-3 bg-white border border-red-200 rounded-xl p-4 hover:bg-red-50 transition-colors text-left shadow-sm"
        >
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-red-700">Esci</p>
            <p className="text-sm text-red-500">Disconnettiti dal tuo account</p>
          </div>
        </button>
      </div>
    </div>
  );
}
