import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const reviews = [
  {
    id: 1,
    rating: 5,
    date: "5 Giorni Fa",
    text: "Abbiamo negli anni fatto diversi acquisti, abbiamo sempre trovato disponibilità...",
    verified: true
  },
  {
    id: 2,
    rating: 5,
    date: "06 Settembre 2025",
    text: "Tutto perfetto su più ordini fatti, niente da aggiungere.",
    verified: true
  },
  {
    id: 3,
    rating: 5,
    date: "16 Agosto 2025",
    text: "Grandissima disponibilità, gentilezza ed efficienza. Nonostante fosse giorno d...",
    verified: true
  },
  {
    id: 4,
    rating: 5,
    date: "28 Luglio 2025",
    text: "siamo rimasti soddisfatti della cortesia e ass...",
    verified: true
  },
  {
    id: 5,
    rating: 5,
    date: "15 Luglio 2025",
    text: "Ottimo rapporto qualità prezzo, spedizione velocissima e imballaggio perfetto.",
    verified: true
  },
  {
    id: 6,
    rating: 5,
    date: "02 Luglio 2025",
    text: "Servizio clienti eccellente, prodotto arrivato nei tempi previsti.",
    verified: true
  },
  {
    id: 7,
    rating: 5,
    date: "20 Giugno 2025",
    text: "Professionalità e competenza al top, consiglio vivamente!",
    verified: true
  },
  {
    id: 8,
    rating: 5,
    date: "10 Giugno 2025",
    text: "Qualità eccezionale dell'abbattitore, supera le aspettative.",
    verified: true
  }
];

export default function FeedatyReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const itemsPerPage = 4;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const visibleReviews = reviews.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 lg:p-10">
      {/* Header con logo e rating */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {/* Logo Feedaty */}
          <div className="flex items-center gap-2">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 25L20 37L42 15" stroke="#F0B858" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <svg width="140" height="40" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="0" y="45" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="600" fill="#1e3a5f">feedaty</text>
            </svg>
          </div>

          {/* Rating */}
          <div className="border-l-2 border-gray-200 pl-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-bold text-[#1e3a5f]">5,0</span>
              <span className="text-gray-600">/5</span>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#F0B858] text-[#F0B858]" />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-bold text-[#1e3a5f]">740</span> recensioni
            </p>
          </div>
        </div>

        {/* Navigation arrows */}
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#F0B858] hover:bg-[#F0B858]/10 transition-all"
            aria-label="Recensione precedente"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-[#F0B858] hover:bg-[#F0B858]/10 transition-all"
            aria-label="Recensione successiva"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Sottotitolo */}
      <p className="text-sm text-gray-600 mb-6">
        Le nostre recensioni a 4 e 5 stelle.{' '}
        <a href="#" className="text-[#1e3a5f] underline font-medium hover:text-[#F0B858]">
          Clicca qui per leggerle tutte &gt;
        </a>
      </p>

      {/* Recensioni cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {visibleReviews.map((review) => (
          <div 
            key={review.id}
            className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            {/* Stelle */}
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < review.rating 
                      ? 'fill-[#F0B858] text-[#F0B858]' 
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Data */}
            <p className="text-xs text-gray-500 mb-3">{review.date}</p>

            {/* Testo recensione */}
            <p className="text-sm text-gray-700 leading-relaxed mb-4 min-h-[60px]">
              {review.text}
            </p>

            {/* Badge verificato */}
            {review.verified && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <CheckCircle className="w-4 h-4 text-[#1e3a5f]" />
                <span>Acquirente verificato</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex 
                ? 'bg-[#F0B858] w-6' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Vai alla pagina ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
