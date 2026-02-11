import { useState } from 'react';
import { Shield, Users, Wallet, ArrowUpRight, Clock, CheckCircle, XCircle, Crown, User, TrendingUp, Eye, ChevronDown, ChevronUp, Building2, CreditCard, Search, Filter } from 'lucide-react';
import { useAuth, type User as UserType } from '../../contexts/AuthContext';
import { toast } from 'sonner';

type AdminTab = 'overview' | 'users' | 'withdrawals' | 'commissions';

export default function AdminDashboard() {
  const { user, allUsers, getAllWithdrawalRequests, approveWithdrawal, rejectWithdrawal } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'client' | 'pro'>('all');

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Accesso negato</h2>
        <p className="text-gray-600">Solo gli amministratori possono accedere a questa sezione.</p>
      </div>
    );
  }

  const withdrawalRequests = getAllWithdrawalRequests();
  const pendingWithdrawals = withdrawalRequests.filter(r => r.status === 'pending');
  const proUsers = allUsers.filter(u => u.role === 'pro');
  const clientUsers = allUsers.filter(u => u.role === 'client');

  const totalWalletBalance = allUsers.reduce((s, u) => s + u.walletBalance, 0);
  const totalCommissions = proUsers.reduce((s, u) => s + (u.referralUsages || []).reduce((ss, r) => ss + r.commissionAmount, 0), 0);
  const totalPendingAmount = pendingWithdrawals.reduce((s, r) => s + r.amount, 0);

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleApprove = (requestId: string, userId: string) => {
    approveWithdrawal(requestId, userId);
    toast.success('Prelievo approvato');
  };

  const handleReject = (requestId: string, userId: string) => {
    rejectWithdrawal(requestId, userId);
    toast.success('Prelievo rifiutato - fondi rimborsati');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 mb-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Pannello Amministratore</h1>
            <p className="text-slate-300 text-sm">Gestione utenti, wallet e commissioni</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-0.5">Utenti totali</p>
            <p className="text-2xl font-bold">{allUsers.length}</p>
            <p className="text-xs text-slate-400">{proUsers.length} pro / {clientUsers.length} clienti</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-0.5">Saldo wallet totale</p>
            <p className="text-2xl font-bold">{totalWalletBalance.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-0.5">Commissioni generate</p>
            <p className="text-2xl font-bold">{totalCommissions.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <p className="text-slate-400 text-xs mb-0.5">Prelievi in attesa</p>
            <p className="text-2xl font-bold text-amber-400">{pendingWithdrawals.length}</p>
            <p className="text-xs text-slate-400">{totalPendingAmount.toFixed(2)} totale</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {([
          { id: 'overview' as const, label: 'Panoramica', icon: Eye },
          { id: 'users' as const, label: 'Utenti', icon: Users },
          { id: 'withdrawals' as const, label: `Prelievi ${pendingWithdrawals.length > 0 ? `(${pendingWithdrawals.length})` : ''}`, icon: ArrowUpRight },
          { id: 'commissions' as const, label: 'Commissioni', icon: TrendingUp },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Pending Withdrawals Alert */}
          {pendingWithdrawals.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-900">{pendingWithdrawals.length} richieste di prelievo in attesa</h3>
              </div>
              <div className="space-y-2">
                {pendingWithdrawals.slice(0, 3).map(req => (
                  <div key={req.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-200">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{req.userName}</p>
                      <p className="text-xs text-gray-500">{req.userEmail} - {req.method === 'bank_transfer' ? 'Bonifico' : 'Carta'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{req.amount.toFixed(2)}</span>
                      <button
                        onClick={() => handleApprove(req.id, req.userId)}
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                        title="Approva"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-700" />
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.userId)}
                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        title="Rifiuta"
                      >
                        <XCircle className="w-4 h-4 text-red-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {pendingWithdrawals.length > 3 && (
                <button onClick={() => setActiveTab('withdrawals')} className="mt-2 text-sm font-bold text-amber-700 hover:text-amber-800">
                  Vedi tutte ({pendingWithdrawals.length}) →
                </button>
              )}
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Attivita recente - Tutti i movimenti</h3>
            {allUsers.flatMap(u => u.walletTransactions.map(tx => ({ ...tx, userName: u.name, userRole: u.role }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10).map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.type === 'deposit' ? 'bg-emerald-100' :
                  tx.type === 'commission' ? 'bg-amber-100' :
                  'bg-red-100'
                }`}>
                  {tx.type === 'deposit' ? <Wallet className="w-3.5 h-3.5 text-emerald-600" /> :
                   tx.type === 'commission' ? <TrendingUp className="w-3.5 h-3.5 text-amber-600" /> :
                   <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-500">
                    {tx.userName} ({tx.userRole === 'pro' ? 'PRO' : 'Cliente'}) - {new Date(tx.date).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cerca per nome o email..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'client', 'pro'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                    filterRole === role ? 'bg-slate-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {role === 'all' ? 'Tutti' : role === 'pro' ? 'Pro' : 'Clienti'}
                </button>
              ))}
            </div>
          </div>

          {/* User List */}
          <div className="space-y-3">
            {filteredUsers.map(u => (
              <UserCard
                key={u.id}
                userData={u}
                isExpanded={expandedUser === u.id}
                onToggle={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Tutte le richieste di prelievo</h3>
          {withdrawalRequests.length === 0 ? (
            <div className="text-center py-12">
              <ArrowUpRight className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Nessuna richiesta di prelievo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawalRequests.map(req => (
                <div key={req.id} className={`flex items-center gap-3 p-4 rounded-xl border ${
                  req.status === 'pending' ? 'border-amber-200 bg-amber-50' :
                  req.status === 'approved' ? 'border-emerald-200 bg-emerald-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    req.method === 'bank_transfer' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {req.method === 'bank_transfer' ? <Building2 className="w-5 h-5 text-blue-600" /> : <CreditCard className="w-5 h-5 text-purple-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{req.userName}</p>
                    <p className="text-xs text-gray-500">{req.userEmail}</p>
                    <p className="text-xs text-gray-500">
                      {req.method === 'bank_transfer' ? 'Bonifico' : 'Carta'}
                      {req.iban && ` - ${req.iban}`} - {new Date(req.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{req.amount.toFixed(2)}</p>
                    {req.status === 'pending' ? (
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => handleApprove(req.id, req.userId)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Approva
                        </button>
                        <button
                          onClick={() => handleReject(req.id, req.userId)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          Rifiuta
                        </button>
                      </div>
                    ) : (
                      <span className={`text-xs font-bold ${req.status === 'approved' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {req.status === 'approved' ? 'Approvato' : 'Rifiutato'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Commissioni Pro - Dettaglio per utente</h3>
            {proUsers.length === 0 ? (
              <div className="text-center py-12">
                <Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">Nessun utente Pro</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proUsers.map(proU => {
                  const usages = proU.referralUsages || [];
                  const totalComm = usages.reduce((s, r) => s + r.commissionAmount, 0);
                  return (
                    <div key={proU.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
                          <Crown className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">{proU.name}</p>
                          <p className="text-xs text-gray-500">{proU.email} - Codice: {proU.referralCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-700">{totalComm.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{usages.length} utilizzi</p>
                        </div>
                      </div>
                      {usages.length > 0 && (
                        <div className="p-3 space-y-1">
                          {usages.map((usage, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-semibold text-gray-900">{usage.userName}</span>
                                <span className="text-gray-500 text-xs ml-2">Ordine {usage.orderId}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-amber-700">+{usage.commissionAmount.toFixed(2)}</span>
                                <span className="text-gray-500 text-xs ml-2">{new Date(usage.date).toLocaleDateString('it-IT')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function UserCard({ userData, isExpanded, onToggle }: { userData: UserType; isExpanded: boolean; onToggle: () => void }) {
  const isPro = userData.role === 'pro';
  const totalCommissions = (userData.referralUsages || []).reduce((s, r) => s + r.commissionAmount, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPro ? 'bg-amber-100' : 'bg-emerald-100'}`}>
          {isPro ? <Crown className="w-5 h-5 text-amber-700" /> : <User className="w-5 h-5 text-emerald-700" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 flex items-center gap-2">
            {userData.name}
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isPro ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {isPro ? 'PRO' : 'CLIENTE'}
            </span>
          </p>
          <p className="text-sm text-gray-500 truncate">{userData.email}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-gray-900">Saldo: {userData.walletBalance.toFixed(2)}</p>
          {isPro && <p className="text-xs text-amber-600">Comm: {totalCommissions.toFixed(2)}</p>}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Telefono:</span>
              <span className="font-semibold text-gray-900 ml-1">{userData.phone}</span>
            </div>
            <div>
              <span className="text-gray-500">Registrato:</span>
              <span className="font-semibold text-gray-900 ml-1">{new Date(userData.createdAt).toLocaleDateString('it-IT')}</span>
            </div>
            {isPro && userData.referralCode && (
              <div className="col-span-2">
                <span className="text-gray-500">Codice referral:</span>
                <span className="font-mono font-bold text-amber-700 ml-1">{userData.referralCode}</span>
              </div>
            )}
          </div>

          {/* Transactions */}
          {userData.walletTransactions.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Transazioni ({userData.walletTransactions.length})</p>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {userData.walletTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-2 text-xs">
                    <div>
                      <span className="font-semibold text-gray-900">{tx.description}</span>
                      <span className="text-gray-500 ml-2">{new Date(tx.date).toLocaleDateString('it-IT')}</span>
                    </div>
                    <span className={`font-bold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal Requests */}
          {userData.withdrawalRequests.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Richieste prelievo ({userData.withdrawalRequests.length})</p>
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                {userData.withdrawalRequests.map(req => (
                  <div key={req.id} className="flex items-center justify-between p-2 text-xs">
                    <div>
                      <span className="font-semibold text-gray-900">{req.amount.toFixed(2)}</span>
                      <span className="text-gray-500 ml-2">{req.method === 'bank_transfer' ? 'Bonifico' : 'Carta'}</span>
                    </div>
                    <span className={`font-bold ${
                      req.status === 'pending' ? 'text-amber-600' :
                      req.status === 'approved' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {req.status === 'pending' ? 'In attesa' : req.status === 'approved' ? 'Approvato' : 'Rifiutato'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
