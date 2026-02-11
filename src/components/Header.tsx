import {
  Search,
  User,
  Heart,
  ShoppingCart,
  Flame,
  Snowflake,
  ChefHat,
  Package,
  Hotel,
  ShieldPlus,
  Wrench,
  ChevronDown,
  Wallet,
  Shield,
  Crown,
  LogOut,
} from 'lucide-react';
import { type User as UserType, useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  favoritesCount: number;
  onFavoritesClick: () => void;
  onAccountClick: () => void;
  onLogoClick: () => void;
  user: UserType | null;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { label: 'Linea Caldo', icon: Flame },
  { label: 'Linea Freddo', icon: Snowflake },
  { label: 'Preparazione', icon: ChefHat },
  { label: 'Carrelli ed Arredo', icon: Package },
  { label: 'Hotellerie', icon: Hotel },
  { label: 'Cura ed Igiene', icon: ShieldPlus },
  { label: 'Ricambi', icon: Wrench },
];

export default function Header({ cartItemCount, onCartClick, favoritesCount, onFavoritesClick, onAccountClick, onLogoClick, user, currentPage, onNavigate }: HeaderProps) {
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPro = user?.role === 'pro';
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.10)]">
      <div className="border-b border-emerald-200 bg-emerald-50 py-1 text-center text-[11px] font-semibold tracking-wide text-emerald-900">
        Vendita riservata solo a possessori di Partita IVA
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          <button onClick={onLogoClick} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">BIANCHI</span>
          </button>

          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca nel catalogo"
                className="w-full pl-10 pr-20 py-2.5 bg-white border border-slate-300 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400"
              />
              <button className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors">
                Cerca
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Wallet Button */}
            <button
              onClick={() => onNavigate('wallet')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                currentPage === 'wallet'
                  ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Wallet</span>
              {user && (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {user.walletBalance.toFixed(0)}
                </span>
              )}
            </button>

            {/* User Account */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  if (user) {
                    setUserMenuOpen(!userMenuOpen);
                  } else {
                    onAccountClick();
                  }
                }}
                className={`flex items-center gap-1.5 transition-colors p-1.5 rounded-full ${
                  user ? (isPro ? 'text-amber-600 hover:bg-amber-50' : isAdmin ? 'text-slate-700 hover:bg-slate-100' : 'text-emerald-600 hover:bg-emerald-50') : 'text-slate-700 hover:text-slate-900'
                }`}
                aria-label="Account"
              >
                {user ? (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    isPro ? 'bg-amber-500' : isAdmin ? 'bg-slate-700' : 'bg-emerald-500'
                  }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                  <div className={`p-3 ${isPro ? 'bg-amber-50' : isAdmin ? 'bg-slate-50' : 'bg-emerald-50'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                        isPro ? 'bg-amber-500' : isAdmin ? 'bg-slate-700' : 'bg-emerald-500'
                      }`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {isPro && <Crown className="w-3 h-3 text-amber-500" />}
                          {isAdmin && <Shield className="w-3 h-3 text-slate-500" />}
                          {isPro ? 'Account Pro' : isAdmin ? 'Admin' : 'Cliente'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { onNavigate('account'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Il mio account
                    </button>
                    <button
                      onClick={() => { onNavigate('wallet'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-gray-400" />
                      Wallet
                      <span className="ml-auto text-xs font-bold text-emerald-600">{user.walletBalance.toFixed(2)}</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { onNavigate('admin'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Shield className="w-4 h-4 text-gray-400" />
                        Pannello Admin
                      </button>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); onNavigate('home'); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Esci
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onFavoritesClick}
              className="text-slate-700 hover:text-slate-900 transition-colors relative"
              aria-label="Preferiti"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-rose-400 text-rose-500' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              onClick={onCartClick}
              className="text-slate-700 hover:text-slate-900 relative transition-colors"
              aria-label="Carrello"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <nav className="border-t border-slate-700 bg-slate-900 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="hidden md:flex items-center gap-1 py-2 overflow-x-auto">
            {navItems.map(({ label, icon: Icon }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
            ))}
            {/* Mobile Wallet Link */}
            <li className="sm:hidden">
              <button
                type="button"
                onClick={() => onNavigate('wallet')}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Wallet</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
