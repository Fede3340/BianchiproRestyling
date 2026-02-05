import { Search, User, Heart, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  favoritesCount: number;
  onFavoritesClick: () => void;
}

export default function Header({ cartItemCount, onCartClick, favoritesCount, onFavoritesClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold">BIANCHI</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm">
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Linea Caldo</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Linea Freddo</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Preparazione</a>
            <a href="#" className="text-gray-700 hover:text-gray-900 font-medium">Hotelleria</a>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cerca nel catalogo..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-gray-900 transition-colors">
              <User className="w-5 h-5" />
            </button>
            
            {/* Favoriti - BADGE MEGLIO POSIZIONATO */}
            <button 
              onClick={onFavoritesClick}
              className="text-gray-700 hover:text-gray-900 transition-colors relative"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-rose-400 text-rose-400' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm animate-in zoom-in duration-200">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Carrello */}
            <button 
              onClick={onCartClick}
              className="text-gray-700 hover:text-gray-900 relative transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm animate-in zoom-in duration-200">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
