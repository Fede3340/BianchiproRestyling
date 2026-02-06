import { Star, ShoppingCart, Heart, Info, ChevronDown, Zap } from 'lucide-react';
import { useState } from 'react';
import CompactAccessories from './CompactAccessories';
import ShippingCalculator from './ShippingCalculator';

interface ProductDetailsProps {
  quantity: number;
  setQuantity: (q: number) => void;
  capacity: string;
  setCapacity: (c: string) => void;
  probe: string;
  setProbe: (p: string) => void;
  selectedAccessories: number[];
  setSelectedAccessories: (a: number[]) => void;
  onAddToCart: () => void;
  onAddAccessoryToCart?: (accessory: { id: number; name: string; price: number; img: string | null }) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function ProductDetails({
  quantity,
  setQuantity,
  capacity,
  setCapacity,
  probe,
  setProbe,
  selectedAccessories,
  setSelectedAccessories,
  onAddToCart,
  onAddAccessoryToCart,
  isFavorite,
  onToggleFavorite
}: ProductDetailsProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [heartAnimation, setHeartAnimation] = useState(false);

  const handleFavoriteClick = () => {
    onToggleFavorite();
    setHeartAnimation(true);
    setTimeout(() => setHeartAnimation(false), 600);
  };

  return (
    <div className="space-y-4">
      {/* Brand badge e disponibilità - COMPATTO */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-bold bg-green-50 text-green-800 border border-green-200">
          FORCAR
        </span>
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-700 font-bold">Disponibile</span>
        </div>
      </div>

      {/* Title - COMPATTO */}
      <div>
        <h1 className="text-2xl lg:text-3xl mb-1.5 leading-tight font-bold text-gray-900">
          Abbattitore di Temperatura AB5514 Forcar
        </h1>
        <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
          <span>COD: AB5514</span>
          <span className="text-gray-300">•</span>
          <span>SKU: FORCAR-AB5514</span>
        </div>
      </div>

      {/* Rating e recensioni - COMPATTO */}
      <div className="flex items-center space-x-2.5 pb-2 border-b border-gray-200">
        <div className="flex items-center space-x-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <a href="#reviews" className="text-sm font-semibold text-gray-700 hover:text-green-600 underline transition-colors">
          52 recensioni
        </a>
      </div>

      {/* Descrizione prodotto - COMPATTA */}
      <div className="p-3.5">
        <div className={`text-sm font-medium text-gray-800 leading-snug ${!descriptionExpanded ? 'line-clamp-1' : ''}`}>
          L'abbattitore di temperatura AB5514 Forcar è una soluzione progettata per le esigenze delle grandi cucine professionali, capace di combinare prestazioni elevate, ampie capacità e affidabilità. Con una struttura solida in acciaio inox AISI 304, garantisce resistenza e igiene in ogni ambiente di lavoro, risultando ideale per ristoranti, mense e laboratori con elevati volumi di produzione.
        </div>
        <button 
          onClick={() => setDescriptionExpanded(!descriptionExpanded)}
          className="text-sm font-bold text-[#6B9BD1] hover:text-[#5A8AC0] mt-1 flex items-center gap-1 transition-colors"
        >
          {descriptionExpanded ? 'Meno' : 'Altro'}
          <ChevronDown className={`w-4 h-4 transition-transform ${descriptionExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Price Section */}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-gray-500 line-through text-lg font-semibold">€ 5.133,15</span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-orange-400 text-white">
            -25%
          </span>
        </div>
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-5xl font-extrabold text-gray-900">€ 4.106</span>
          <span className="text-2xl font-bold text-gray-600">,52</span>
        </div>
        <div className="text-lg font-semibold text-gray-600">
          € 5.009,95 IVA inclusa
        </div>
      </div>

      {/* Options - DROPDOWN per massima usabilità */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Capacità Teglie */}
        <div className="rounded-lg p-3">
          <label className="text-sm font-bold text-gray-900 mb-1.5 block">Capacità Teglie</label>
          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border-2 border-gray-300/70 bg-white font-bold text-gray-900 focus:border-green-400/70 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all cursor-pointer"
          >
            <option value="5-teglie">5 Teglie GN 1/1</option>
            <option value="10-teglie">10 Teglie GN 1/1</option>
            <option value="15-teglie">15 Teglie GN 1/1</option>
          </select>
        </div>

        {/* Tipo Sonda */}
        <div className="rounded-lg p-3">
          <label className="text-sm font-bold text-gray-900 mb-1.5 block">Tipo Sonda</label>
          <select
            value={probe}
            onChange={(e) => setProbe(e.target.value)}
            className="w-full h-11 px-3 rounded-lg border-2 border-gray-300/70 bg-white font-bold text-gray-900 focus:border-green-400/70 focus:outline-none focus:ring-2 focus:ring-green-200/50 transition-all cursor-pointer"
          >
            <option value="standard">Standard (inclusa)</option>
            <option value="doppia">Doppia Sonda (+€120)</option>
            <option value="wireless">Wireless (+€180)</option>
          </select>
        </div>
      </div>

      {/* Accessories */}
      <CompactAccessories 
        selected={selectedAccessories}
        setSelected={setSelectedAccessories}
        onAddAccessoryToCart={onAddAccessoryToCart}
      />

      {/* Quantity and CTA - COMPATTO */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex-shrink-0">
            <label className="block text-sm font-bold text-gray-900 mb-1.5">Quantità</label>
            <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden h-12">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 font-bold text-xl"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-14 h-full text-center border-0 focus:outline-none font-bold text-base bg-white"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800 font-bold text-xl"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-bold text-transparent mb-1.5 select-none">.</label>
            <button 
              onClick={onAddToCart}
              className="w-full bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center space-x-2.5 transition-colors h-12 shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 stroke-[2.5]" />
              <span className="font-extrabold text-lg tracking-tight">ACQUISTA ORA</span>
            </button>
          </div>
        </div>

      </div>

      {/* Trust message - COMPATTA */}
      <div className="bg-amber-50/60 border border-amber-300/50 p-2.5 rounded-xl">
        <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" /> <span className="font-extrabold">Offerta limitata:</span> Solo 3 unità a questo prezzo
        </p>
      </div>

      {/* Richiedi Info - CTA Secondaria */}
      <button className="w-full py-3 px-5 rounded-xl border-2 border-[#6B9BD1] hover:border-[#5A8AC0] text-[#6B9BD1] hover:text-[#5A8AC0] bg-white hover:bg-[#E3F0FC]/20 transition-all flex items-center justify-center gap-2.5 font-bold text-base">
        <Info className="w-5 h-5" />
        <span>Richiedi Informazioni sul Prodotto</span>
      </button>

      {/* Shipping Calculator - SPOSTATO DOPO CTA */}
      <div>
        <ShippingCalculator />
      </div>

    </div>
  );
}
