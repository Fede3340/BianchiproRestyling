import { Heart, X, ChevronDown, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
}

interface FavoritesDrawerProps {
  items: FavoriteItem[];
  onRemoveItem: (id: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function FavoritesDrawer({ items, onRemoveItem, isExpanded, setIsExpanded }: FavoritesDrawerProps) {
  if (!isExpanded) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isExpanded ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* Backdrop più leggero */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isExpanded ? 'opacity-30' : 'opacity-0'
        }`}
        onClick={() => setIsExpanded(false)}
      />

      {/* Drawer content - PIÙ PICCOLO E MENO INVASIVO */}
      <div 
        className={`absolute top-0 right-0 bottom-0 w-full sm:w-80 bg-white shadow-xl transition-transform duration-300 flex flex-col ${
          isExpanded ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header - colori rosa soft */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-rose-50">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 fill-rose-400 text-rose-400" />
            <h2 className="text-base font-extrabold text-gray-900">Preferiti</h2>
            {items.length > 0 && (
              <span className="bg-rose-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 hover:bg-rose-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Heart className="w-12 h-12 text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-900 mb-1">Nessun preferito</h3>
            <p className="text-sm text-gray-600 font-medium">
              Salva i prodotti che ti interessano
            </p>
          </div>
        )}

        {/* Favorites items - Scrollable */}
        {items.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 hover:border-rose-300 hover:bg-rose-50/20 transition-all">
                  <div className="flex gap-2.5">
                    {/* Image */}
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div>
                          <div className="text-xs font-bold text-green-700 mb-0.5">{item.brand}</div>
                          <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{item.name}</h3>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1 hover:bg-rose-100 rounded-full transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-extrabold text-gray-900">€ {item.price.toFixed(2)}</div>
                        <button className="text-xs font-bold text-green-600 hover:text-green-700 underline">
                          Dettagli
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-white p-3 space-y-2">
              <button className="w-full py-2.5 px-4 rounded-xl bg-rose-400 text-white font-extrabold text-sm hover:bg-rose-500 transition-colors flex items-center justify-center space-x-2">
                <ExternalLink className="w-4 h-4" />
                <span>Vedi Tutti</span>
              </button>

              <button
                onClick={() => setIsExpanded(false)}
                className="w-full py-1.5 text-sm font-bold text-gray-600 hover:text-gray-800"
              >
                Chiudi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
