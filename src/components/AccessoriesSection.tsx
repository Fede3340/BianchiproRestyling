import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart } from 'lucide-react';

const accessories = [
  {
    id: 1,
    badge: 'BEST SELLER',
    name: 'Teglie GN 1/1 Inox',
    description: 'Set da 5 teglie professionali',
    price: '€ 38,00',
    oldPrice: '€ 45,00',
    image: 'https://images.unsplash.com/photo-1615486261138-c3e95ac12d3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVlbCUyMGtpdGNoZW4lMjBhY2Nlc3Nvcmllc3xlbnwxfHx8fDE3NzAyMjE3OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    discount: '-15%'
  },
  {
    id: 2,
    badge: 'CONSIGLIATO',
    name: 'Kit Ruote Professionali',
    description: 'Ruote pivottanti industriali',
    price: '€ 120,00',
    image: 'https://images.unsplash.com/photo-1762329924239-e204f101fca4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwa2l0Y2hlbiUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzAyMjE3OTd8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 3,
    badge: 'NUOVO',
    name: 'Sonda Wireless Pro',
    description: 'Monitoraggio remoto temperatura',
    price: '€ 180,00',
    image: 'https://images.unsplash.com/photo-1598382143905-72568e88b2f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwZXF1aXBtZW50JTIwZGV0YWlsfGVufDF8fHx8MTc3MDIyMTc5OHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: 4,
    badge: 'PRO',
    name: 'Kit Resistenza Extra',
    description: 'Maggiore potenza frigorifera',
    price: '€ 185,00',
    oldPrice: '€ 210,00',
    image: 'https://images.unsplash.com/photo-1740707590752-8fb21c6074e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwY29tbWVyY2lhbCUyMGZyZWV6ZXJ8ZW58MXx8fHwxNzcwMjIxNzk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    discount: '-12%'
  }
];

export default function AccessoriesSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">Accessori Consigliati</h2>
        <p className="text-gray-600">
          Ottimizza le prestazioni con gli accessori originali Bianchi
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {accessories.map((accessory) => (
          <div
            key={accessory.id}
            className="group bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:border-green-500 hover:shadow-xl transition-all"
          >
            <div className="relative aspect-square overflow-hidden bg-gray-50">
              <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
                {accessory.badge}
              </span>
              {accessory.discount && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                  {accessory.discount}
                </span>
              )}
              <ImageWithFallback
                src={accessory.image}
                alt={accessory.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">
                {accessory.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{accessory.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  {accessory.oldPrice && (
                    <div className="text-xs text-gray-400 line-through">{accessory.oldPrice}</div>
                  )}
                  <div className="text-lg font-bold text-gray-900">{accessory.price}</div>
                </div>
                <button className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-md hover:shadow-lg">
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button className="text-green-600 hover:text-green-700 font-semibold border-2 border-green-500 hover:bg-green-50 px-8 py-3 rounded-lg transition-all">
          Vedi Tutti gli Accessori →
        </button>
      </div>
    </div>
  );
}
