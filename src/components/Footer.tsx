export default function Footer() {
  return (
    <footer className="bg-[#1a2332] text-white mt-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {/* Logo and Description */}
          <div className="md:col-span-4">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold tracking-tight">BIANCHI</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Soluzioni professionali per il mondo della ristorazione<br />e del retail dal 1978.
            </p>
            <button className="bg-[#2a3542] hover:bg-[#364252] text-white px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors">
              Contattaci
            </button>
          </div>

          {/* Azienda */}
          <div className="md:col-span-2">
            <h3 className="font-bold mb-4 text-base">Azienda</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Chi Siamo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contatti</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dove Siamo</a></li>
            </ul>
          </div>

          {/* Supporto */}
          <div className="md:col-span-2">
            <h3 className="font-bold mb-4 text-base">Supporto</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Spedizioni</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Resi</a></li>
            </ul>
          </div>

          {/* Legale */}
          <div className="md:col-span-2">
            <h3 className="font-bold mb-4 text-base">Legale</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termini e Condizioni</a></li>
            </ul>
          </div>

          {/* Area Rivenditori */}
          <div className="md:col-span-2 flex justify-start md:justify-end items-start">
            <button className="bg-[#2a3542] hover:bg-[#364252] text-white px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors">
              Area Rivenditori
            </button>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6">
          <p className="text-xs text-gray-500 text-center">
            © 2024 Bianchi Srl - Tutti i diritti riservati. P.IVA 01234567890
          </p>
        </div>
      </div>
    </footer>
  );
}
