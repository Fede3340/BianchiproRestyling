import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'client' | 'pro' | 'admin';

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'commission' | 'withdrawal_request';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'approved' | 'rejected';
  relatedUser?: string;
  orderId?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  iban?: string;
  method: 'bank_transfer' | 'card';
}

export interface ReferralUsage {
  userId: string;
  userName: string;
  orderId: string;
  orderTotal: number;
  shippingCost: number;
  commissionAmount: number;
  date: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  // Pro-specific fields
  referralCode?: string;
  referralUsages?: ReferralUsage[];
  // Wallet
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  withdrawalRequests: WithdrawalRequest[];
  // Stripe
  stripeCustomerId?: string;
}

interface AuthContextType {
  user: User | null;
  allUsers: User[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: RegisterData) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  addWalletTransaction: (transaction: Omit<WalletTransaction, 'id' | 'date'>) => void;
  requestWithdrawal: (amount: number, method: 'bank_transfer' | 'card', iban?: string) => { success: boolean; error?: string };
  approveWithdrawal: (requestId: string, userId: string) => void;
  rejectWithdrawal: (requestId: string, userId: string) => void;
  applyReferralCode: (code: string, orderId: string, orderTotal: number, shippingCost: number, buyerName: string, buyerId: string) => { success: boolean; discount: number; error?: string };
  getAllWithdrawalRequests: () => (WithdrawalRequest & { userEmail: string })[];
  getUserById: (id: string) => User | undefined;
  depositToWallet: (amount: number) => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: 'client' | 'pro';
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'bianchipro_users';
const SESSION_KEY = 'bianchipro_session';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateReferralCode(name: string): string {
  const prefix = name.replace(/\s+/g, '').slice(0, 4).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PRO-${prefix}-${suffix}`;
}

function loadUsers(): (User & { password: string })[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* empty */ }

  // Seed admin account
  const admin: User & { password: string } = {
    id: 'admin-001',
    email: 'admin@bianchipro.it',
    password: 'admin123',
    name: 'Admin Bianchi',
    phone: '+39 000 000 0000',
    role: 'admin',
    createdAt: new Date().toISOString(),
    walletBalance: 0,
    walletTransactions: [],
    withdrawalRequests: [],
  };

  const demoClient: User & { password: string } = {
    id: 'client-001',
    email: 'cliente@test.it',
    password: 'test123',
    name: 'Mario Rossi',
    phone: '+39 333 123 4567',
    role: 'client',
    createdAt: new Date().toISOString(),
    walletBalance: 150.00,
    walletTransactions: [
      { id: 'tx-1', type: 'deposit', amount: 200, description: 'Ricarica wallet con carta', date: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'completed' },
      { id: 'tx-2', type: 'withdrawal', amount: -50, description: 'Pagamento ordine #ORD-001', date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'completed' },
    ],
    withdrawalRequests: [],
  };

  const demoPro: User & { password: string } = {
    id: 'pro-001',
    email: 'pro@test.it',
    password: 'test123',
    name: 'Luca Bianchi',
    phone: '+39 333 987 6543',
    role: 'pro',
    createdAt: new Date().toISOString(),
    referralCode: 'PRO-LUCA-A1B2',
    referralUsages: [
      { userId: 'client-001', userName: 'Mario Rossi', orderId: 'ORD-DEMO-1', orderTotal: 4106.52, shippingCost: 120, commissionAmount: 6.00, date: new Date(Date.now() - 86400000 * 3).toISOString() },
    ],
    walletBalance: 56.00,
    walletTransactions: [
      { id: 'tx-p1', type: 'commission', amount: 6.00, description: 'Commissione 5% su spedizione - Mario Rossi', date: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'completed', relatedUser: 'Mario Rossi', orderId: 'ORD-DEMO-1' },
      { id: 'tx-p2', type: 'deposit', amount: 50, description: 'Ricarica wallet con carta', date: new Date(Date.now() - 86400000 * 7).toISOString(), status: 'completed' },
    ],
    withdrawalRequests: [],
  };

  const users = [admin, demoClient, demoPro];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users;
}

function saveUsers(users: (User & { password: string })[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<(User & { password: string })[]>(() => loadUsers());
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(SESSION_KEY);
    } catch { return null; }
  });

  const user = users.find(u => u.id === currentUserId) || null;

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(SESSION_KEY, currentUserId);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUserId]);

  const login = (email: string, password: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { success: false, error: 'Email o password non corretti' };
    setCurrentUserId(found.id);
    return { success: true };
  };

  const register = (data: RegisterData) => {
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'Email già registrata' };
    }
    const newUser: User & { password: string } = {
      id: `${data.role}-${generateId()}`,
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      role: data.role,
      createdAt: new Date().toISOString(),
      walletBalance: 0,
      walletTransactions: [],
      withdrawalRequests: [],
      ...(data.role === 'pro' ? {
        referralCode: generateReferralCode(data.name),
        referralUsages: [],
      } : {}),
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!currentUserId) return;
    setUsers(prev => prev.map(u => u.id === currentUserId ? { ...u, ...updates } : u));
  };

  const addWalletTransaction = (transaction: Omit<WalletTransaction, 'id' | 'date'>) => {
    if (!currentUserId) return;
    const tx: WalletTransaction = {
      ...transaction,
      id: `tx-${generateId()}`,
      date: new Date().toISOString(),
    };
    setUsers(prev => prev.map(u => {
      if (u.id !== currentUserId) return u;
      return {
        ...u,
        walletBalance: u.walletBalance + transaction.amount,
        walletTransactions: [tx, ...u.walletTransactions],
      };
    }));
  };

  const depositToWallet = (amount: number) => {
    addWalletTransaction({
      type: 'deposit',
      amount,
      description: `Ricarica wallet con carta`,
      status: 'completed',
    });
  };

  const requestWithdrawal = (amount: number, method: 'bank_transfer' | 'card', iban?: string) => {
    if (!user) return { success: false, error: 'Non autenticato' };
    if (amount <= 0) return { success: false, error: 'Importo non valido' };
    if (amount > user.walletBalance) return { success: false, error: 'Saldo insufficiente' };

    const request: WithdrawalRequest = {
      id: `wr-${generateId()}`,
      userId: user.id,
      userName: user.name,
      amount,
      date: new Date().toISOString(),
      status: 'pending',
      iban,
      method,
    };

    setUsers(prev => prev.map(u => {
      if (u.id !== user.id) return u;
      return {
        ...u,
        walletBalance: u.walletBalance - amount,
        withdrawalRequests: [request, ...u.withdrawalRequests],
        walletTransactions: [{
          id: `tx-${generateId()}`,
          type: 'withdrawal_request',
          amount: -amount,
          description: `Richiesta prelievo - ${method === 'bank_transfer' ? 'Bonifico' : 'Carta'}`,
          date: new Date().toISOString(),
          status: 'pending',
        }, ...u.walletTransactions],
      };
    }));

    return { success: true };
  };

  const approveWithdrawal = (requestId: string, userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return {
        ...u,
        withdrawalRequests: u.withdrawalRequests.map(r =>
          r.id === requestId ? { ...r, status: 'approved' as const } : r
        ),
        walletTransactions: u.walletTransactions.map(t =>
          t.description.includes('Richiesta prelievo') && t.status === 'pending'
            ? { ...t, status: 'completed' as const, description: t.description.replace('Richiesta prelievo', 'Prelievo approvato') }
            : t
        ),
      };
    }));
  };

  const rejectWithdrawal = (requestId: string, userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const request = u.withdrawalRequests.find(r => r.id === requestId);
      const refundAmount = request ? request.amount : 0;
      return {
        ...u,
        walletBalance: u.walletBalance + refundAmount,
        withdrawalRequests: u.withdrawalRequests.map(r =>
          r.id === requestId ? { ...r, status: 'rejected' as const } : r
        ),
        walletTransactions: [{
          id: `tx-${generateId()}`,
          type: 'deposit',
          amount: refundAmount,
          description: 'Rimborso - Richiesta prelievo rifiutata',
          date: new Date().toISOString(),
          status: 'completed',
        }, ...u.walletTransactions.map(t =>
          t.description.includes('Richiesta prelievo') && t.status === 'pending'
            ? { ...t, status: 'rejected' as const }
            : t
        )],
      };
    }));
  };

  const applyReferralCode = (code: string, orderId: string, orderTotal: number, shippingCost: number, buyerName: string, buyerId: string) => {
    const proUser = users.find(u => u.role === 'pro' && u.referralCode === code.toUpperCase());
    if (!proUser) return { success: false, discount: 0, error: 'Codice referral non valido' };
    if (proUser.id === currentUserId) return { success: false, discount: 0, error: 'Non puoi usare il tuo stesso codice' };

    const discount = shippingCost * 0.05;
    const commission = shippingCost * 0.05;

    const usage: ReferralUsage = {
      userId: buyerId,
      userName: buyerName,
      orderId,
      orderTotal,
      shippingCost,
      commissionAmount: commission,
      date: new Date().toISOString(),
    };

    setUsers(prev => prev.map(u => {
      if (u.id === proUser.id) {
        return {
          ...u,
          walletBalance: u.walletBalance + commission,
          referralUsages: [...(u.referralUsages || []), usage],
          walletTransactions: [{
            id: `tx-${generateId()}`,
            type: 'commission',
            amount: commission,
            description: `Commissione 5% su spedizione - ${buyerName}`,
            date: new Date().toISOString(),
            status: 'completed',
            relatedUser: buyerName,
            orderId,
          }, ...u.walletTransactions],
        };
      }
      return u;
    }));

    return { success: true, discount };
  };

  const getAllWithdrawalRequests = () => {
    const requests: (WithdrawalRequest & { userEmail: string })[] = [];
    users.forEach(u => {
      u.withdrawalRequests.forEach(r => {
        requests.push({ ...r, userEmail: u.email });
      });
    });
    return requests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getUserById = (id: string) => users.find(u => u.id === id);

  const allUsers = users.filter(u => u.role !== 'admin');

  return (
    <AuthContext.Provider value={{
      user: user ? { ...user, password: undefined } as unknown as User : null,
      allUsers: allUsers.map(u => ({ ...u, password: undefined } as unknown as User)),
      login,
      register,
      logout,
      updateUser,
      addWalletTransaction,
      requestWithdrawal,
      approveWithdrawal,
      rejectWithdrawal,
      applyReferralCode,
      getAllWithdrawalRequests,
      getUserById,
      depositToWallet,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
