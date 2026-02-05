import { useState } from 'react';
import { Check, Plus, ChevronDown, Target } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const accessories = [
  { 
    id: 1, 
    name: "Bacinella Gastronorm GN1/1 in acciaio inox 530x325 mm", 
    price: 12.42, 
    img: "https://images.unsplash.com/flagged/photo-1553591866-b6b58649d6ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMGNvbnRhaW5lciUyMHJlY3Rhbmd1bGFyJTIwa2l0Y2hlbiUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzAyMzA3NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080", 
    popular: true 
  },
  { 
    id: 2, 
    name: "AV4040 Teglia Alluminata 60x40", 
    price: 11.43, 
    img: "https://images.unsplash.com/photo-1691371388813-c6ed1223042f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtpbmclMjB0cmF5JTIwYWx1bWludW0lMjBwcm9mZXNzaW9uYWwlMjBvdmVufGVufDF8fHx8MTc3MDIzMDc3Mnww&ixlib=rb-4.1.0&q=80&w=1080", 
    popular: true 
  },
  { 
    id: 3, 
    name: "AV4037 Teglia Blurex 60x40", 
    price: 9.94, 
    img: "https://images.unsplash.com/photo-1691371388813-c6ed1223042f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtpbmclMjB0cmF5JTIwYWx1bWludW0lMjBwcm9mZXNzaW9uYWwlMjBvdmVufGVufDF8fHx8MTc3MDIzMDc3Mnww&ixlib=rb-4.1.0&q=80&w=1080", 
    popular: true 
  },
  { 
    id: 4, 
    name: "GR111 Griglia GN 1/1", 
    price: 18.38, 
    img: "https://images.unsplash.com/photo-1751250302854-72034cfbfca5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBraXRjaGVuJTIwZ3JpbGwlMjByYWNrJTIwbWV0YWx8ZW58MXx8fHwxNzcwMjMwNzcyfDA&ixlib=rb-4.1.0&q=80&w=1080", 
    popular: true 
  },
  { id: 5, name: "Sonda al cuore riscaldata wireless", price: 180.00, img: null, popular: false },
  { id: 6, name: "Kit Ruote con Freno (4 pz)", price: 120.00, img: null, popular: false },
  { id: 7, name: "Detergente specifico Inox 1L", price: 15.00, img: null, popular: false },
  { id: 8, name: "Copertura protettiva impermeabile", price: 45.00, img: null, popular: false },
];

interface CompactAccessoriesProps {
  selected: number[];
  setSelected: (selected: number[]) => void;
  onAddAccessoryToCart?: (accessory: { id: number; name: string; price: number; img: string | null }) => void;
}

export default function CompactAccessories({ selected, setSelected, onAddAccessoryToCart }: CompactAccessoriesProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleAccessory = (id: number) => {
    setSelected(
      selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]
    );
  };

  const displayedAccessories = expanded ? accessories : accessories.slice(0, 2);

  return (
    <div className="border-2 border-green-200/70 bg-green-50/40 rounded-xl overflow-hidden">
      <div className="bg-green-100/50 px-3.5 py-2.5 border-b border-green-200/60">
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-green-900 text-sm flex items-center gap-1.5">
            <Target className="w-4 h-4 text-green-700 stroke-[2]" />
            Accessori essenziali
          </span>
          <span className="text-xs font-bold text-green-700 bg-white px-2 py-1 rounded-full border border-green-300 uppercase tracking-wide">Essenziali</span>
        </div>
        <p className="text-xs text-green-700">
          ✓ Spunta per includere nel prodotto • Pulsante <Plus className="inline w-3 h-3" /> per carrello separato
        </p>
      </div>
      
      <div className="p-3 space-y-2.5">
        {displayedAccessories.map((acc) => (
          <div 
            key={acc.id}
            onClick={() => toggleAccessory(acc.id)}
            className={`flex items-center p-2 rounded-xl border-2 cursor-pointer transition-all ${
              selected.includes(acc.id) 
                ? "bg-green-50 border-green-500 shadow-sm" 
                : "bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/30"
            }`}
          >
            <div className={`w-5 h-5 rounded border-2 mr-2.5 flex items-center justify-center transition-colors flex-shrink-0 ${
              selected.includes(acc.id) ? "bg-green-500 border-green-500" : "border-gray-400"
            }`}>
              {selected.includes(acc.id) && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </div>
            
            {acc.img && (
              <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden mr-2.5 flex-shrink-0 border border-gray-200">
                <ImageWithFallback src={acc.img} alt={acc.name} className="w-full h-full object-cover" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 leading-tight truncate">{acc.name}</div>
              <div className="text-xs text-green-700 font-bold">+€ {acc.price.toFixed(2)}</div>
            </div>

            {onAddAccessoryToCart && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddAccessoryToCart(acc);
                }}
                className="p-1.5 rounded-lg transition-all ml-2 flex-shrink-0 bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md"
                title="Aggiungi singolarmente al carrello"
              >
                <Plus className="w-5 h-5 stroke-[3]" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="px-2.5 py-2 bg-white border-t-2 border-green-100 flex justify-between items-center">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-bold text-green-700 hover:text-green-800 flex items-center gap-1.5 transition-colors"
        >
          {expanded ? 'Mostra meno' : `Mostra tutti (${accessories.length})`}
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        
        {selected.length > 0 && (
          <div className="text-sm font-bold text-green-800">
            {selected.length} · +€ {accessories.filter(a => selected.includes(a.id)).reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}

// Export accessories for use in App
export { accessories };
