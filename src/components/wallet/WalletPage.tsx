import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Building2, TrendingUp, Clock, CheckCircle, XCircle, Copy, Check, Crown, ChevronRight, AlertCircle, Plus, Minus, Lock } from 'lucide-react';
import { useAuth, type WalletTransaction } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export default function WalletPage() {
  const { user, depositToWallet, requestWithdrawal } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank_transfer' | 'card'>('bank_transfer');
  const [iban, setIban] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);

  if (!user) return null;

  const isPro = user.role === 'pro';
  const totalCommissions = (user.referralUsages || []).reduce((sum, r) => sum + r.commissionAmount, 0);
  const pendingWithdrawals = user.withdrawalRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount < 5) {
      toast.error('Importo minimo: 5,00');
      return;
    }
    if (amount > 10000) {
      toast.error('Importo massimo: 10.000,00');
      return;
    }
    setDepositLoading(true);
    // Simulate Stripe payment
    setTimeout(() => {
      depositToWallet(amount);
      toast.success(`${amount.toFixed(2)} caricati nel wallet!`);
      setDepositAmount('');
      setDepositLoading(false);
      setActiveTab('overview');
    }, 1500);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 10) {
      toast.error('Importo minimo prelievo: 10,00');
      return;
    }
    if (withdrawMethod === 'bank_transfer' && !iban.trim()) {
      toast.error('Inserisci il tuo IBAN');
      return;
    }
    const result = requestWithdrawal(amount, withdrawMethod, iban || undefined);
    if (result.success) {
      toast.success('Richiesta di prelievo inviata! In attesa di approvazione admin.');
      setWithdrawAmount('');
      setIban('');
      setActiveTab('overview');
    } else {
      toast.error(result.error || 'Errore');
    }
  };

  const copyReferralCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopiedCode(true);
      toast.success('Codice copiato!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getStatusBadge = (status: WalletTransaction['status']) => {
    switch (status) {
      case 'completed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3" /> Completato</span>;
      case 'pending': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" /> In attesa</span>;
      case 'approved': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700"><CheckCircle className="w-3 h-3" /> Approvato</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700"><XCircle className="w-3 h-3" /> Rifiutato</span>;
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Wallet Header Card */}
      <div className={`rounded-2xl p-6 mb-6 shadow-lg ${isPro ? 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600' : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'} text-white`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Il Tuo Wallet</h1>
              <p className="text-white/80 text-sm">{user.name} - {isPro ? 'Account Pro' : 'Account Cliente'}</p>
            </div>
          </div>
          {isPro && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-200" />
              <span className="text-sm font-bold">PRO</span>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-white/70 text-sm mb-1">Saldo disponibile</p>
          <p className="text-4xl font-black tracking-tight">{user.walletBalance.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/70 text-xs mb-0.5">Depositi totali</p>
            <p className="text-lg font-bold">
              {user.walletTransactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0).toFixed(2)}
            </p>
          </div>
          {isPro && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-white/70 text-xs mb-0.5">Commissioni totali</p>
              <p className="text-lg font-bold">{totalCommissions.toFixed(2)}</p>
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/70 text-xs mb-0.5">In attesa prelievo</p>
            <p className="text-lg font-bold">{pendingWithdrawals.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Pro Referral Code Card */}
      {isPro && user.referralCode && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-amber-900 text-lg mb-1 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                Il Tuo Codice Referral
              </h3>
              <p className="text-amber-700 text-sm mb-3">Condividi questo codice: i clienti ottengono il 5% di sconto sulla spedizione e tu guadagni il 5% di commissione!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-4 py-3 font-mono text-lg font-bold text-amber-800 tracking-wider text-center">
              {user.referralCode}
            </div>
            <button
              onClick={copyReferralCode}
              className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors shadow-sm"
            >
              {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          {(user.referralUsages || []).length > 0 && (
            <p className="mt-3 text-sm text-amber-700 font-semibold">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              {(user.referralUsages || []).length} utilizzi - {totalCommissions.toFixed(2)} guadagnati
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`p-3 rounded-xl border-2 transition-all text-center ${activeTab === 'overview' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
        >
          <Wallet className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'overview' ? 'text-emerald-600' : 'text-gray-400'}`} />
          <span className={`text-xs font-bold ${activeTab === 'overview' ? 'text-emerald-700' : 'text-gray-600'}`}>Panoramica</span>
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`p-3 rounded-xl border-2 transition-all text-center ${activeTab === 'deposit' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
        >
          <Plus className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'deposit' ? 'text-emerald-600' : 'text-gray-400'}`} />
          <span className={`text-xs font-bold ${activeTab === 'deposit' ? 'text-emerald-700' : 'text-gray-600'}`}>Ricarica</span>
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`p-3 rounded-xl border-2 transition-all text-center ${activeTab === 'withdraw' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
        >
          <Minus className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'withdraw' ? 'text-emerald-600' : 'text-gray-400'}`} />
          <span className={`text-xs font-bold ${activeTab === 'withdraw' ? 'text-emerald-700' : 'text-gray-600'}`}>Preleva</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`p-3 rounded-xl border-2 transition-all text-center ${activeTab === 'history' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
        >
          <Clock className={`w-5 h-5 mx-auto mb-1 ${activeTab === 'history' ? 'text-emerald-600' : 'text-gray-400'}`} />
          <span className={`text-xs font-bold ${activeTab === 'history' ? 'text-emerald-700' : 'text-gray-600'}`}>Cronologia</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Azioni rapide</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setActiveTab('deposit')}
                className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-emerald-900">Ricarica Wallet</p>
                  <p className="text-xs text-emerald-700">Aggiungi fondi con carta</p>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-blue-900">Preleva Fondi</p>
                  <p className="text-xs text-blue-700">Trasferisci su conto o carta</p>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Ultime transazioni</h3>
              <button onClick={() => setActiveTab('history')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                Vedi tutte
              </button>
            </div>
            {user.walletTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">Nessuna transazione</p>
                <p className="text-sm text-gray-400 mt-1">Le tue transazioni appariranno qui</p>
              </div>
            ) : (
              <div className="space-y-2">
                {user.walletTransactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-emerald-100' :
                      tx.type === 'commission' ? 'bg-amber-100' :
                      'bg-red-100'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> :
                       tx.type === 'commission' ? <TrendingUp className="w-4 h-4 text-amber-600" /> :
                       <ArrowUpRight className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{tx.description}</p>
                      <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                      </p>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pro: Referral Usages */}
          {isPro && (user.referralUsages || []).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                Utilizzi del tuo codice
              </h3>
              <div className="space-y-2">
                {(user.referralUsages || []).map((usage, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="w-9 h-9 bg-amber-200 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{usage.userName}</p>
                      <p className="text-xs text-gray-500">Ordine {usage.orderId} - Spedizione: {usage.shippingCost.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-700">+{usage.commissionAmount.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{new Date(usage.date).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal Requests Status */}
          {user.withdrawalRequests.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Stato richieste prelievo</h3>
              <div className="space-y-2">
                {user.withdrawalRequests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      req.status === 'pending' ? 'bg-amber-100' : req.status === 'approved' ? 'bg-emerald-100' : 'bg-red-100'
                    }`}>
                      {req.status === 'pending' ? <Clock className="w-4 h-4 text-amber-600" /> :
                       req.status === 'approved' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                       <XCircle className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Prelievo {req.method === 'bank_transfer' ? 'Bonifico' : 'Carta'}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(req.date).toLocaleDateString('it-IT')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{req.amount.toFixed(2)}</p>
                      {req.status === 'pending' && <span className="text-xs font-bold text-amber-600">In attesa</span>}
                      {req.status === 'approved' && <span className="text-xs font-bold text-emerald-600">Approvato</span>}
                      {req.status === 'rejected' && <span className="text-xs font-bold text-red-600">Rifiutato</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'deposit' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Ricarica Wallet
          </h3>
          <p className="text-sm text-gray-500 mb-6">Aggiungi fondi al tuo wallet con carta di credito/debito</p>

          {/* Quick Amounts */}
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-700 mb-2">Importi rapidi</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setDepositAmount(amt.toString())}
                  className={`py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                    depositAmount === amt.toString()
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">Importo personalizzato</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">EUR</span>
              <input
                type="number"
                value={depositAmount}
                onChange={e => setDepositAmount(e.target.value)}
                placeholder="0.00"
                min="5"
                max="10000"
                step="0.01"
                className="w-full pl-16 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Min. 5,00 - Max. 10.000,00</p>
          </div>

          {/* Stripe Payment Simulation */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-bold text-gray-700">Metodo di pagamento</span>
            </div>
            <div className="bg-white border border-gray-300 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">**** **** **** 4242</p>
                  <p className="text-xs text-gray-500">Scade 12/28</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Pagamento sicuro tramite Stripe
            </p>
          </div>

          <button
            onClick={handleDeposit}
            disabled={!depositAmount || parseFloat(depositAmount) < 5 || depositLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-lg"
          >
            {depositLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Elaborazione pagamento...
              </span>
            ) : (
              <>Ricarica {depositAmount ? `${parseFloat(depositAmount).toFixed(2)}` : 'Wallet'}</>
            )}
          </button>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-blue-600" />
            Preleva Fondi
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Trasferisci i tuoi fondi su conto bancario o carta.
            {isPro && ' Le commissioni accumulate sono prelevabili dopo approvazione admin.'}
          </p>

          {/* Balance Info */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Saldo disponibile</p>
                <p className="text-2xl font-black text-emerald-800">{user.walletBalance.toFixed(2)}</p>
              </div>
              {pendingWithdrawals > 0 && (
                <div className="text-right">
                  <p className="text-sm text-amber-700">In attesa</p>
                  <p className="text-lg font-bold text-amber-700">{pendingWithdrawals.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Withdraw Method */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Metodo di prelievo</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setWithdrawMethod('bank_transfer')}
                className={`p-3 rounded-xl border-2 transition-all text-left ${withdrawMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <Building2 className={`w-5 h-5 mb-1 ${withdrawMethod === 'bank_transfer' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className={`text-sm font-bold ${withdrawMethod === 'bank_transfer' ? 'text-blue-700' : 'text-gray-700'}`}>Bonifico</div>
                <div className="text-xs text-gray-500">SEPA - 1-3 giorni</div>
              </button>
              <button
                onClick={() => setWithdrawMethod('card')}
                className={`p-3 rounded-xl border-2 transition-all text-left ${withdrawMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <CreditCard className={`w-5 h-5 mb-1 ${withdrawMethod === 'card' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className={`text-sm font-bold ${withdrawMethod === 'card' ? 'text-blue-700' : 'text-gray-700'}`}>Carta</div>
                <div className="text-xs text-gray-500">Visa/Mastercard</div>
              </button>
            </div>
          </div>

          {withdrawMethod === 'bank_transfer' && (
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-1">IBAN</label>
              <input
                type="text"
                value={iban}
                onChange={e => setIban(e.target.value.toUpperCase())}
                placeholder="IT60 X054 2811 1010 0000 0123 456"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-1">Importo da prelevare</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">EUR</span>
              <input
                type="number"
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                min="10"
                max={user.walletBalance}
                step="0.01"
                className="w-full pl-16 pr-4 py-3 border-2 border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">Min. 10,00</p>
              <button
                onClick={() => setWithdrawAmount(user.walletBalance.toString())}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                Preleva tutto
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              La richiesta di prelievo deve essere approvata dall'amministratore. Riceverai una notifica una volta elaborata.
            </p>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={!withdrawAmount || parseFloat(withdrawAmount) < 10 || parseFloat(withdrawAmount) > user.walletBalance}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-lg"
          >
            Richiedi prelievo {withdrawAmount ? `di ${parseFloat(withdrawAmount).toFixed(2)}` : ''}
          </button>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cronologia completa</h3>
          {user.walletTransactions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">Nessuna transazione</p>
            </div>
          ) : (
            <div className="space-y-2">
              {user.walletTransactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    tx.type === 'deposit' ? 'bg-emerald-100' :
                    tx.type === 'commission' ? 'bg-amber-100' :
                    'bg-red-100'
                  }`}>
                    {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> :
                     tx.type === 'commission' ? <TrendingUp className="w-4 h-4 text-amber-600" /> :
                     <ArrowUpRight className="w-4 h-4 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                    </p>
                    {getStatusBadge(tx.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

