import { useState } from 'react';
import { Truck, MapPin } from 'lucide-react';

export default function ShippingCalculator() {
  const [region, setRegion] = useState('');
  const [courier, setCourier] = useState('');

  const regions = ["Lombardia", "Lazio", "Campania", "Sicilia", "Piemonte", "Veneto", "Emilia-Romagna", "Altro"];
  const couriers = [
    { id: 'std', name: 'Standard (Bartolini)', price: 45.00, time: '3-5 giorni' },
    { id: 'exp', name: 'Espresso (DHL)', price: 85.00, time: '24/48 ore' },
    { id: 'pickup', name: 'Ritiro in Sede', price: 0.00, time: 'Disponibile da subito' }
  ];

  const calculatePrice = () => {
    if (!courier) return null;
    const base = couriers.find(c => c.id === courier)?.price || 0;
    const isIsland = ["Sicilia", "Sardegna"].includes(region);
    return isIsland ? base + 20 : base;
  };

  const price = calculatePrice();

  return (
    <div className="bg-gray-50/60 rounded-xl p-3 border-2 border-gray-200/70">
      <div className="flex items-center space-x-2 mb-3 text-gray-800">
        <Truck className="w-5 h-5 text-gray-600" />
        <span className="font-bold text-base">Calcola Spedizione</span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none"
            >
              <option value="">Seleziona regione...</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {region && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
             <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Metodo di consegna</label>
             <div className="space-y-2">
               {couriers.map((c) => (
                 <label 
                  key={c.id} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border-2 cursor-pointer transition-all ${
                    courier === c.id 
                      ? 'bg-green-50 border-green-500 shadow-md' 
                      : 'bg-white border-gray-300 hover:border-green-400 hover:bg-green-50/30'
                  }`}
                 >
                   <div className="flex items-center space-x-2.5">
                     <input 
                        type="radio" 
                        name="courier" 
                        value={c.id} 
                        checked={courier === c.id}
                        onChange={(e) => setCourier(e.target.value)}
                        className="text-green-600 focus:ring-green-500 h-5 w-5 border-gray-400"
                     />
                     <div>
                       <div className="text-sm font-bold text-gray-900">{c.name}</div>
                       <div className="text-xs font-semibold text-gray-600">{c.time}</div>
                     </div>
                   </div>
                   <div className="font-extrabold text-gray-900 text-base">
                     € {c.id === courier && price ? price.toFixed(2) : c.price.toFixed(2)}
                   </div>
                 </label>
               ))}
             </div>
          </div>
        )}

        {price !== null && region && (
          <div className="pt-3 border-t-2 border-gray-300 flex justify-between items-center animate-in fade-in duration-300">
            <span className="text-sm font-bold text-gray-700">Totale Spedizione:</span>
            <span className="text-xl font-extrabold text-gray-900">€ {price.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
