import { useState } from 'react';
import Header from './components/Header';
import ProductGallery from './components/ProductGallery';
import ProductDetails from './components/ProductDetails';
import ProductTabs from './components/ProductTabs';
import TrustBadges from './components/TrustBadges';
import FeedatyReviews from './components/FeedatyReviews';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FavoritesDrawer from './components/FavoritesDrawer';
import { ChevronRight } from 'lucide-react';
import { accessories } from './components/CompactAccessories';
import mainImage from "./assets/f4ed0b934aabb9cdf06af64854509a5ac97f8256.png";
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import BackendStatus from './components/BackendStatus';
import AppErrorBoundary from './components/AppErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/auth/AuthModal';
import WalletPage from './components/wallet/WalletPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AccountPage from './components/auth/AccountPage';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  options?: string[];
  accessories?: { name: string; price: number }[];
}

interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
}

type AppPage = 'home' | 'wallet' | 'admin' | 'account';

function AppContent() {
  const { user } = useAuth();

  // Navigation state
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Product configuration state
  const [quantity, setQuantity] = useState(1);
  const [capacity, setCapacity] = useState('5-teglie');
  const [probe, setProbe] = useState('standard');
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [currentCartItemId, setCurrentCartItemId] = useState<string | null>(null);

  // Favorites state
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [favoritesExpanded, setFavoritesExpanded] = useState(false);

  // Current product favorite status
  const currentProductId = 'AB5514';
  const isCurrentProductFavorite = favoriteItems.some(item => item.id === currentProductId);

  // Wrapper per setSelectedAccessories che aggiorna anche il carrello
  const updateSelectedAccessories = (newSelection: number[]) => {
    setSelectedAccessories(newSelection);

    // Se c'è un item corrente nel carrello, aggiornalo in tempo reale
    if (currentCartItemId) {
      const basePrice = 4106.52;
      const probePrice = probe === 'doppia' ? 120 : probe === 'wireless' ? 180 : 0;

      const selectedAccessoriesData = accessories
        .filter(acc => newSelection.includes(acc.id))
        .map(acc => ({ name: acc.name, price: acc.price }));

      setCartItems(prev =>
        prev.map(item =>
          item.id === currentCartItemId
            ? {
                ...item,
                price: basePrice + probePrice,
                accessories: selectedAccessoriesData.length > 0 ? selectedAccessoriesData : undefined
              }
            : item
        )
      );
    }
  };

  const handleAddToCart = () => {
    const basePrice = 4106.52;
    const probePrice = probe === 'doppia' ? 120 : probe === 'wireless' ? 180 : 0;

    const selectedAccessoriesData = accessories
      .filter(acc => selectedAccessories.includes(acc.id))
      .map(acc => ({ name: acc.name, price: acc.price }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const options = [
      `Capacita: ${capacity.replace('-teglie', ' teglie')}`,
      `Sonda: ${probe.charAt(0).toUpperCase() + probe.slice(1)}`
    ];

    const normalizedAccessories = selectedAccessoriesData.length > 0 ? selectedAccessoriesData : undefined;

    const existingItemIndex = cartItems.findIndex((item) => {
      const sameName = item.name === 'Abbattitore di Temperatura AB5514 Forcar';
      const samePrice = item.price === basePrice + probePrice;
      const sameOptions = JSON.stringify(item.options || []) === JSON.stringify(options);
      const itemAccessories = [...(item.accessories || [])].sort((a, b) => a.name.localeCompare(b.name));
      const sameAccessories = JSON.stringify(itemAccessories) === JSON.stringify(normalizedAccessories || []);
      return sameName && samePrice && sameOptions && sameAccessories;
    });

    if (existingItemIndex >= 0) {
      const existingItemId = cartItems[existingItemIndex].id;
      setCartItems(prev =>
        prev.map(item =>
          item.id === existingItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
      setCurrentCartItemId(existingItemId);
      return;
    }

    const itemId = `product-${Date.now()}`;
    const newItem: CartItem = {
      id: itemId,
      name: 'Abbattitore di Temperatura AB5514 Forcar',
      price: basePrice + probePrice,
      quantity: quantity,
      image: mainImage,
      options,
      accessories: normalizedAccessories
    };

    setCartItems(prev => [...prev, newItem]);
    setCurrentCartItemId(itemId);
  };

  const handleAddAccessoryToCart = (accessory: { id: number; name: string; price: number; img: string | null }) => {
    const existingAccessory = cartItems.find(
      (item) => item.name === accessory.name && item.price === accessory.price && !item.options && !item.accessories,
    );

    if (existingAccessory) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === existingAccessory.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      const itemId = `accessory-${accessory.id}-${Date.now()}`;
      const newItem: CartItem = {
        id: itemId,
        name: accessory.name,
        price: accessory.price,
        quantity: 1,
        image: accessory.img || mainImage,
      };
      setCartItems(prev => [...prev, newItem]);
    }

    toast.success(`${accessory.name}`, {
      description: 'Aggiunto al carrello',
      duration: 2000,
    });
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    if (id === currentCartItemId) {
      setCurrentCartItemId(null);
      setSelectedAccessories([]);
      setQuantity(1);
    }
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCurrentCartItemId(null);
    setSelectedAccessories([]);
    setQuantity(1);
  };

  const handleCartClick = () => {
    setCartExpanded(true);
  };

  const handleToggleFavorite = () => {
    if (isCurrentProductFavorite) {
      setFavoriteItems(prev => prev.filter(item => item.id !== currentProductId));
    } else {
      const newFavorite: FavoriteItem = {
        id: currentProductId,
        name: 'Abbattitore di Temperatura AB5514 Forcar',
        price: 4106.52,
        image: mainImage,
        brand: 'FORCAR'
      };
      setFavoriteItems(prev => [...prev, newFavorite]);
    }
  };

  const handleRemoveFavorite = (id: string) => {
    setFavoriteItems(prev => prev.filter(item => item.id !== id));
  };

  const handleFavoritesClick = () => {
    setFavoritesExpanded(true);
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAccountClick = () => {
    if (user) {
      setCurrentPage('account');
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage);
  };

  const handleLogoClick = () => {
    setCurrentPage('home');
  };

  return (
    <AppErrorBoundary>
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header
        cartItemCount={totalCartItems}
        onCartClick={handleCartClick}
        favoritesCount={favoriteItems.length}
        onFavoritesClick={handleFavoritesClick}
        onAccountClick={handleAccountClick}
        onLogoClick={handleLogoClick}
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {currentPage === 'home' && (
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-8 mb-20">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8">
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} className="text-gray-600 hover:text-green-600 transition-colors">Home</a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Linea Freddo</a>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">Abbattitore di Temperatura</span>
          </nav>

          {/* Product Section */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-8 lg:items-start">
              <ProductGallery
                isFavorite={isCurrentProductFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
              <ProductDetails
                quantity={quantity}
                setQuantity={setQuantity}
                capacity={capacity}
                setCapacity={setCapacity}
                probe={probe}
                setProbe={setProbe}
                selectedAccessories={selectedAccessories}
                setSelectedAccessories={updateSelectedAccessories}
                onAddToCart={handleAddToCart}
                onAddAccessoryToCart={handleAddAccessoryToCart}
                isFavorite={isCurrentProductFavorite}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mb-12">
            <TrustBadges />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-12"></div>

          <div className="mb-12">
            <ProductTabs />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-12"></div>

          <div className="mb-12">
            <FeedatyReviews />
          </div>
        </main>
      )}

      {currentPage === 'wallet' && (
        <main className="mb-20">
          {user ? (
            <WalletPage />
          ) : (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Accedi per vedere il tuo Wallet</h2>
              <p className="text-gray-600 mb-6">Effettua il login per gestire il tuo wallet, ricaricare e prelevare fondi.</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
              >
                Accedi o Registrati
              </button>
            </div>
          )}
        </main>
      )}

      {currentPage === 'admin' && (
        <main className="mb-20">
          {user?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Accesso non autorizzato</h2>
              <p className="text-gray-600 mb-6">Solo gli amministratori possono accedere a questa sezione.</p>
              <button
                onClick={() => setCurrentPage('home')}
                className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors"
              >
                Torna alla Home
              </button>
            </div>
          )}
        </main>
      )}

      {currentPage === 'account' && (
        <main className="mb-20">
          {user ? (
            <AccountPage onNavigate={handleNavigate} />
          ) : (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Accedi al tuo account</h2>
              <p className="text-gray-600 mb-6">Effettua il login per gestire il tuo profilo.</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
              >
                Accedi o Registrati
              </button>
            </div>
          )}
        </main>
      )}

      <Footer />

      {/* Cart Drawer */}
      <AppErrorBoundary>
      <CartDrawer
        items={cartItems}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        isExpanded={cartExpanded}
        setIsExpanded={setCartExpanded}
      />
      </AppErrorBoundary>

      {/* Favorites Drawer */}
      <FavoritesDrawer
        items={favoriteItems}
        onRemoveItem={handleRemoveFavorite}
        isExpanded={favoritesExpanded}
        setIsExpanded={setFavoritesExpanded}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />

      {/* Backend Status Indicator */}
      <AppErrorBoundary>
        <BackendStatus />
      </AppErrorBoundary>
    </div>
    </AppErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
