import { useState } from "react";
import {
  ArrowRightLeft,
  FileText,
  Printer,
  Share2,
  X,
  Heart
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import mainImage from "../assets/f4ed0b934aabb9cdf06af64854509a5ac97f8256.png";

interface ProductGalleryProps {
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export default function ProductGallery({ isFavorite, onToggleFavorite }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [heartAnimation, setHeartAnimation] = useState(false);

  const handleFavoriteClick = () => {
    onToggleFavorite();
    setHeartAnimation(true);
    setTimeout(() => setHeartAnimation(false), 600);
  };

  // Solo 3 immagini - stessa immagine in varie angolazioni simulate
  const images = [
    mainImage,
    mainImage,
    mainImage
  ];

  return (
    <>
      <div className="flex flex-col lg:pt-[52px]">
        {/* Main Image Area - PIÙ GRANDE E CENTRATA */}
        <div className="flex flex-col">
          <div className="relative bg-transparent rounded-lg overflow-visible flex items-center justify-center -m-4">
            <ImageWithFallback
              src={images[selectedImage]}
              alt="Abbattitore Professionale AB5514 Forcar"
              className="w-full h-auto max-h-[600px] object-contain transition-transform duration-300"
            />
            
            {/* Floating Favorite Button - TOP LEFT */}
            <button 
              onClick={handleFavoriteClick}
              className={`absolute top-3 left-3 backdrop-blur-sm rounded-full p-3 shadow-lg cursor-pointer transition-all border-2 ${
                isFavorite
                  ? 'bg-rose-500 border-rose-500 hover:bg-rose-600 hover:border-rose-600'
                  : 'bg-white/90 border-gray-200 hover:bg-rose-50 hover:border-rose-300'
              }`}
            >
              <Heart 
                className={`w-6 h-6 transition-all duration-300 ${
                  isFavorite ? 'fill-white text-white' : 'text-gray-700'
                } ${heartAnimation ? 'animate-bounce scale-125' : ''}`} 
              />
            </button>

            {/* Zoom Button - TOP RIGHT */}
            <button 
              onClick={() => setZoomOpen(true)}
              className="absolute top-3 right-3 bg-white hover:bg-gray-50 backdrop-blur rounded-lg p-2.5 shadow-lg cursor-pointer transition-all border border-gray-200 hover:border-gray-400 group"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-700 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Zoom</span>
              </div>
            </button>
          </div>

          {/* Thumbnails SOTTO - PICCOLE E CENTRATE */}
          <div className="flex gap-2 mt-3 justify-center">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative rounded overflow-hidden w-16 h-16 border-2 transition-all ${
                  selectedImage === index
                    ? "border-gray-900 ring-2 ring-gray-300"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <ImageWithFallback
                  src={img}
                  alt={`Vista ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Action Buttons - CLICCABILI */}
          <div className="grid grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-gray-200">
            <button 
              onClick={() => console.log('Confronta cliccato')}
              className="flex flex-col items-center justify-center gap-1.5 group cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="p-2.5 rounded-full bg-gray-100 text-gray-700 group-hover:bg-green-100 group-hover:text-green-700 border-2 border-transparent group-hover:border-green-300 transition-all shadow-sm group-hover:shadow-md">
                <ArrowRightLeft className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-green-700 uppercase tracking-wide transition-colors">Confronta</span>
            </button>
            
            <button 
              onClick={() => console.log('Scheda cliccata')}
              className="flex flex-col items-center justify-center gap-1.5 group cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="p-2.5 rounded-full bg-gray-100 text-gray-700 group-hover:bg-green-100 group-hover:text-green-700 border-2 border-transparent group-hover:border-green-300 transition-all shadow-sm group-hover:shadow-md">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-green-700 uppercase tracking-wide transition-colors">Scheda</span>
            </button>

            <button 
              onClick={() => window.print()}
              className="flex flex-col items-center justify-center gap-1.5 group cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="p-2.5 rounded-full bg-gray-100 text-gray-700 group-hover:bg-green-100 group-hover:text-green-700 border-2 border-transparent group-hover:border-green-300 transition-all shadow-sm group-hover:shadow-md">
                <Printer className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-green-700 uppercase tracking-wide transition-colors">Stampa</span>
            </button>

            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Abbattitore AB5514', url: window.location.href });
                } else {
                  console.log('Condividi cliccato');
                }
              }}
              className="flex flex-col items-center justify-center gap-1.5 group cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="p-2.5 rounded-full bg-gray-100 text-gray-700 group-hover:bg-green-100 group-hover:text-green-700 border-2 border-transparent group-hover:border-green-300 transition-all shadow-sm group-hover:shadow-md">
                <Share2 className="w-5 h-5 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-green-700 uppercase tracking-wide transition-colors">Condividi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomOpen(false)}
        >
          <button 
            onClick={() => setZoomOpen(false)}
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-colors z-10"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          
          <div className="relative max-w-6xl max-h-[90vh] flex items-center justify-center">
            <ImageWithFallback
              src={images[selectedImage]}
              alt="Abbattitore Professionale AB5514 Forcar - Zoom"
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Thumbnail navigation in zoom */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur-md rounded-lg p-3">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? "border-white ring-2 ring-white/50"
                    : "border-white/50 hover:border-white"
                }`}
              >
                <ImageWithFallback
                  src={img}
                  alt={`Vista ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
