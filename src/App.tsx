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
import mainImage from "figma:asset/f4ed0b934aabb9cdf06af64854509a5ac97f8256.png";
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import BackendStatus from './components/BackendStatus';
import AppErrorBoundary from './components/AppErrorBoundary';

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

export default function App() {
  // Product configuration state
  const [quantity, setQuantity] = useState(1);
  const [capacity, setCapacity] = useState('5-teglie');
  const [probe, setProbe] = useState('standard');
  const [selectedAccessories, setSelectedAccessories] = useState<number[]>([]);
  
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

  const handleAddToCart = () => {
    const basePrice = 4106.52;
    
    // Calculate probe price
    const probePrice = probe === 'doppia' ? 120 : probe === 'wireless' ? 180 : 0;
    
    // Get ALL selected accessories details
    const selectedAccessoriesData = accessories
      .filter(acc => selectedAccessories.includes(acc.id))
      .map(acc => ({ name: acc.name, price: acc.price }));

    // Create options array
    const options = [
      `Capacità: ${capacity.replace('-teglie', ' teglie')}`,
      `Sonda: ${probe.charAt(0).toUpperCase() + probe.slice(1)}`
    ];

    const itemId = `product-${Date.now()}`;
    
    const newItem: CartItem = {
      id: itemId,
      name: 'Abbattitore di Temperatura AB5514 Forcar',
      price: basePrice + probePrice,
      quantity: quantity,
      image: mainImage,
      options: options,
      accessories: selectedAccessoriesData.length > 0 ? selectedAccessoriesData : undefined
    };

    setCartItems(prev => [...prev, newItem]);
    setCurrentCartItemId(itemId);

    // Apri subito il carrello quando viene aggiunto un prodotto
    setCartExpanded(true);
    
    // NON resettiamo più le selezioni - così rimangono attive per aggiornamenti in tempo reale
  };

  const handleAddAccessoryToCart = (accessory: { id: number; name: string; price: number; img: string | null }) => {
    const itemId = `accessory-${accessory.id}-${Date.now()}`;
    
    const newItem: CartItem = {
      id: itemId,
      name: accessory.name,
      price: accessory.price,
      quantity: 1,
      image: accessory.img || mainImage,
    };

    setCartItems(prev => [...prev, newItem]);
    
    // Feedback toast per confermare l'aggiunta
    toast.success(`✓ ${accessory.name}`, {
      description: 'Aggiunto al carrello',
      duration: 2000,
    });

    // Apri subito il carrello quando viene aggiunto un accessorio
    setCartExpanded(true);
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    // Se rimuoviamo l'item corrente, resettiamo il riferimento
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
      // Remove from favorites
      setFavoriteItems(prev => prev.filter(item => item.id !== currentProductId));
    } else {
      // Add to favorites
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

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Header 
        cartItemCount={totalCartItems} 
        onCartClick={handleCartClick}
        favoritesCount={favoriteItems.length}
        onFavoritesClick={handleFavoritesClick}
      />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-8 mb-20">
        {/* Breadcrumb migliorato */}
        <nav className="flex items-center space-x-2 text-sm mb-8">
          <a href="#" className="text-gray-600 hover:text-green-600 transition-colors">Home</a>
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

        {/* Separatore visivo */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-12"></div>

        {/* Product Tabs - informazioni organizzate meglio */}
        <div className="mb-12">
          <ProductTabs />
        </div>

        {/* Separatore visivo */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-12"></div>

        {/* Feedaty Reviews - Widget espanso */}
        <div className="mb-12">
          <FeedatyReviews />
        </div>

      </main>

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

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />

      {/* Backend Status Indicator */}
      <AppErrorBoundary>
        <BackendStatus />
      </AppErrorBoundary>
    </div>
  );
}
