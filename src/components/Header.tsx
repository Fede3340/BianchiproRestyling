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
} from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  favoritesCount: number;
  onFavoritesClick: () => void;
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

export default function Header({ cartItemCount, onCartClick, favoritesCount, onFavoritesClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-300 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.10)]">
      <div className="border-b border-emerald-200 bg-emerald-50 py-1 text-center text-[11px] font-semibold tracking-wide text-emerald-900">
        Vendita riservata solo a possessori di Partita IVA
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">BIANCHI</span>
          </div>

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

          <div className="flex items-center space-x-4">
            <button className="text-slate-700 hover:text-slate-900 transition-colors" aria-label="Account">
              <User className="w-5 h-5" />
            </button>

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
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
