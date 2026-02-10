import { useEffect, useMemo, useState } from 'react';
import { ShoppingCart, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import CheckoutModal from './CheckoutModal';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string[];
  accessories?: { name: string; price: number }[];
}

interface CartDrawerProps {
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearCart: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const toNumber = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatPrice = (value: unknown) => toNumber(value).toFixed(2);

const getAccessoriesTotal = (item: CartItem) =>
  (item.accessories || []).reduce((acc, accessory) => acc + toNumber(accessory.price), 0);

export default function CartDrawer({ items, onRemoveItem, onUpdateQuantity, onClearCart, isExpanded, setIsExpanded }: CartDrawerProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quote, setQuote] = useState({ subtotal: 0, vat: 0, total: 0 });

  const normalizedItems = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        quantity: Math.max(1, toNumber(item.quantity)),
        price: toNumber(item.price),
        accessories: (item.accessories || []).map((a) => ({
          ...a,
          price: toNumber(a.price),
        })),
      })),
    [items],
  );

  const isEmpty = normalizedItems.length === 0;
  const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = normalizedItems.reduce((sum, item) => sum + (item.price + getAccessoriesTotal(item)) * item.quantity, 0);

  useEffect(() => {
    const localSubtotal = totalPrice;
    const localVat = totalPrice * 0.22;
    const localTotal = totalPrice * 1.22;

    setQuote({ subtotal: localSubtotal, vat: localVat, total: localTotal });

    if (isEmpty) {
      return;
    }

    const controller = new AbortController();

    const fetchQuote = async () => {
      try {
        const response = await fetch('/.netlify/functions/preventivo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: normalizedItems }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Preventivo non disponibile: ${response.status}`);
        }

        const data = await response.json();
        setQuote({
          subtotal: toNumber(data?.subtotal),
          vat: toNumber(data?.vat),
          total: toNumber(data?.total),
        });
      } catch (error) {
        console.error('Errore preventivo:', error);
      }
    };

    fetchQuote();
    return () => controller.abort();
  }, [normalizedItems, isEmpty, totalPrice]);

  const handleCheckoutSuccess = (orderId: string) => {
    toast.success('🎉 Pagamento completato!', {
      description: `Ordine ${orderId} confermato. Riceverai una email di conferma.`,
      duration: 5000,
    });
    onClearCart();
    setCheckoutOpen(false);
  };

  return (
    <>
      <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${isExpanded ? 'translate-y-full' : 'translate-y-0'}`}>
        <div className={`bg-gray-100 text-gray-900 shadow-xl p-2 ${isEmpty ? 'border-t-2 border-gray-300' : 'border-t-2 border-gray-400 space-y-2'}`}>
          <button type="button" onClick={() => setIsExpanded(true)} className="w-full px-2 py-2 flex items-center justify-between hover:bg-gray-200/70 rounded-lg transition-colors">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                {!isEmpty && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-gray-900">Carrello</div>
                <div className="text-xs font-semibold text-gray-700">
                  {isEmpty ? 'Vuoto' : `${totalItems} ${totalItems === 1 ? 'articolo' : 'articoli'}`}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isEmpty && (
                <div className="text-right">
                  <div className="text-lg font-extrabold text-gray-900">€ {formatPrice(quote.subtotal)}</div>
                  <div className="text-xs font-semibold text-gray-700">Totale</div>
                </div>
              )}
              <ChevronUp className="w-5 h-5 text-gray-700" />
            </div>
          </button>

          {!isEmpty && (
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-extrabold rounded-lg transition-colors"
            >
              Procedi al pagamento · € {formatPrice(quote.total)}
            </button>
          )}
        </div>
      </div>

      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isExpanded ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isExpanded ? 'opacity-50' : 'opacity-0'}`}
          onClick={() => setIsExpanded(false)}
        />

        <div
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 max-h-[80vh] flex flex-col ${
            isExpanded ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b-2 border-gray-200 bg-gray-50 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {!isEmpty && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">Il Tuo Carrello</h2>
            </div>

            <button type="button" onClick={() => setIsExpanded(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <ChevronDown className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Il tuo carrello è vuoto</h3>
              <p className="text-gray-600 mb-6">Aggiungi prodotti per iniziare i tuoi acquisti</p>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="py-3 px-6 rounded-lg bg-green-500 text-white font-extrabold text-sm hover:bg-green-600 transition-colors"
              >
                Continua lo shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {normalizedItems.map((item) => {
                  const accessoriesPrice = getAccessoriesTotal(item);
                  const itemTotal = (item.price + accessoriesPrice) * item.quantity;

                  return (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-white rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                          <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h3>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>

                          {item.options && item.options.length > 0 && <div className="mt-1 text-xs text-gray-600 font-medium">{item.options.join(' • ')}</div>}

                          {item.accessories && item.accessories.length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                              <div className="text-xs text-green-700 font-bold">
                                + {item.accessories.length} {item.accessories.length === 1 ? 'accessorio' : 'accessori'}:
                              </div>
                              {item.accessories.map((acc, idx) => (
                                <div key={idx} className="text-xs text-gray-600 font-medium pl-2">
                                  • {acc.name} (+€ {formatPrice(acc.price)})
                                </div>
                              ))}
                              <div className="text-xs text-green-700 font-extrabold pl-2">Totale accessori: € {formatPrice(accessoriesPrice)}</div>
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-lg"
                              >
                                −
                              </button>
                              <span className="w-10 h-8 flex items-center justify-center text-sm font-bold bg-white">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-lg"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-base font-extrabold text-gray-900">€ {formatPrice(itemTotal)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t-2 border-gray-200 bg-white p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-gray-700">
                    <span>Subtotale ({totalItems} {totalItems === 1 ? 'articolo' : 'articoli'})</span>
                    <span>€ {formatPrice(quote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-gray-700">
                    <span>IVA (22%)</span>
                    <span>€ {formatPrice(quote.vat)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Totale</span>
                    <span>€ {formatPrice(quote.total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-extrabold rounded-lg transition-colors"
                  >
                    Procedi al pagamento
                  </button>

                  <button
                    type="button"
                    onClick={onClearCart}
                    className="w-full py-2 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Svuota carrello
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={toNumber(quote.total)}
        items={normalizedItems}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
}
