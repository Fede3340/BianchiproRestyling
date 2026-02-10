import { useState } from 'react';
import { FileText, Wrench, Package, AlertCircle, Shield, Zap, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

export default function ProductTabs() {
  const [activeTab, setActiveTab] = useState('description');
  
  // Form assistenza state
  const [supportName, setSupportName] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportLoading, setSupportLoading] = useState(false);
  
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supportName || !supportPhone || !supportMessage) {
      toast.error('Compila tutti i campi');
      return;
    }
    
    setSupportLoading(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-d9742687/support`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: supportName,
            phone: supportPhone,
            message: supportMessage,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'invio');
      }
      
      toast.success('✅ Richiesta inviata!', {
        description: 'Ti contatteremo al più presto',
        duration: 3000,
      });
      
      // Reset form
      setSupportName('');
      setSupportPhone('');
      setSupportMessage('');
      
    } catch (error: any) {
      console.error('❌ Errore invio assistenza:', error);
      toast.error('Errore durante l\'invio', {
        description: error.message,
      });
    } finally {
      setSupportLoading(false);
    }
  };

  const tabs = [
    { id: 'description', label: 'Descrizione', icon: FileText },
    { id: 'specs', label: 'Caratteristiche', icon: Wrench },
    { id: 'shipping', label: 'Spedizione', icon: Package },
    { id: 'warranty', label: 'Assistenza', icon: AlertCircle }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Tabs Header */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="p-8 lg:p-10">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">Descrizione Prodotto</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              L'<strong>abbattitore di temperatura</strong> AB5514 <strong>Forcar</strong> è una soluzione progettata per le esigenze delle grandi cucine professionali, capace di combinare prestazioni elevate, ampie capacità e affidabilità. Con una struttura solida in acciaio inox <strong>AISI 304</strong>, garantisce resistenza e igiene in ogni ambiente di lavoro, risultando ideale per ristoranti, mense e laboratori con elevati volumi di produzione.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Questo abbattitore è stato <strong>pensato per gestire operazioni su larga scala</strong>, ospitando fino a 14 teglie GN 1/1 o 60 x 40 cm. La capacità interna di 319 litri permette di <strong>abbattere</strong> la temperatura di alimenti da +90°C a +3°C in appena 90 minuti per carichi fino a 40 kg, mentre il ciclo di surgelazione porta i cibi a -18°C in circa 240 minuti per un massimo di 28 kg. Queste prestazioni non solo consentono di ottimizzare i tempi di lavoro, ma garantiscono anche la conservazione delle proprietà organolettiche e la sicurezza degli alimenti.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Il <strong>controllo elettronico della temperatura</strong> rende il dispositivo semplice da utilizzare, permettendo di monitorare con precisione ogni ciclo di abbattimento e surgelazione. La <strong>refrigerazione ventilata</strong> assicura una distribuzione uniforme del freddo all'interno della camera, evitando sbalzi di temperatura e garantendo risultati ottimali. L'evaporazione automatica dell'acqua di condensa riduce le operazioni di manutenzione. Lo strato isolante di 70 mm con schiuma ad alta densità garantisce un'efficienza energetica ottimale, riducendo i consumi e mantenendo le prestazioni elevate anche durante cicli intensivi.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Grazie al <strong>gas refrigerante ecologico R290</strong>, l'AB5514 <strong>Forcar</strong> è una scelta sostenibile per chi cerca un'attrezzatura professionale che riduca l'impatto ambientale. La potenza di 2500 Watt e l'alimentazione <strong>trifase</strong> a 400 V assicurano prestazioni potenti e affidabili, ideali per ambienti di lavoro esigenti.
            </p>
            <div className="bg-[#E3F0FC] rounded-lg p-6 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-[#6B9BD1]" /> Caratteristiche Principali:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Ventilazione studiata per non aggredire il prodotto</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Sonda al cuore per monitoraggio costante della temperatura</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Sistema di refrigerazione con gas ecologico R290</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Capacità 319 litri con 14 teglie GN 1/1 o 60x40 cm</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Controllo elettronico della temperatura di precisione</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Evaporazione automatica dell'acqua di condensa</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Isolamento termico 70 mm ad alta efficienza energetica</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Cicli precisi e ripetibili certificati HACCP</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Ideale per ristoranti, hotel, catering, mense e tutte le attività che necessitano 
              di rispettare rigorosi standard HACCP con volumi di produzione elevati.
            </p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div>
            <h3 className="text-xl font-semibold mb-6">Caratteristiche Tecniche</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Larghezza (cm)</div>
                <div className="text-lg font-semibold text-gray-900">80</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Profondità (cm)</div>
                <div className="text-lg font-semibold text-gray-900">82,5</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Altezza (cm)</div>
                <div className="text-lg font-semibold text-gray-900">217</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Peso netto (kg)</div>
                <div className="text-lg font-semibold text-gray-900">210</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Potenza (kW)</div>
                <div className="text-lg font-semibold text-gray-900">2,5</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Alimentazione</div>
                <div className="text-lg font-semibold text-gray-900">Trifase 380 Volt</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Colore</div>
                <div className="text-lg font-semibold text-gray-900">Inox</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Temperatura di lavoro (°C)</div>
                <div className="text-lg font-semibold text-gray-900">+90°C / +3°C +90°C / -18°C</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Materiale</div>
                <div className="text-lg font-semibold text-gray-900">Acciaio AISI 304</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Accessori inclusi</div>
                <div className="text-lg font-semibold text-gray-900">14 supporti teglie</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Capacità (Lt)</div>
                <div className="text-lg font-semibold text-gray-900">319</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Refrigerazione</div>
                <div className="text-lg font-semibold text-gray-900">Ventilata</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">T massima °C</div>
                <div className="text-lg font-semibold text-gray-900">+90</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">T minima °C</div>
                <div className="text-lg font-semibold text-gray-900">-18</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Controllo temperatura</div>
                <div className="text-lg font-semibold text-gray-900">Elettronico</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Porte</div>
                <div className="text-lg font-semibold text-gray-900">Singola porta</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Luce interna</div>
                <div className="text-lg font-semibold text-gray-900">Senza luce interna</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Max Temperatura e Umidità ambiente</div>
                <div className="text-lg font-semibold text-gray-900">+43°C / 60%HR</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div>
            <h3 className="text-xl font-semibold mb-6">Informazioni sulla Spedizione</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">📦 Tempi di Consegna</h5>
                  <p className="text-sm text-gray-700">7-10 giorni lavorativi dalla conferma dell'ordine</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">🚚 Corrieri</h5>
                  <p className="text-sm text-gray-700">SDA, GLS, Bartolini - tracciamento incluso</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">📍 Ritiro in Sede</h5>
                  <p className="text-sm text-gray-700">Ritira gratuitamente presso il nostro punto vendita</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">↩️ Resi</h5>
                  <p className="text-sm text-gray-700">30 giorni per il reso se non installato</p>
                </div>
              </div>

              <div className="bg-[#E3F0FC] rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-3">📋 Il pacco include:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Abbattitore di Temperatura Serie Arctic</li>
                  <li>• 5 Teglie GN 1/1 in acciaio inox</li>
                  <li>• Sonda al cuore standard</li>
                  <li>• Manuale d'uso e manutenzione in italiano</li>
                  <li>• Certificato di conformità HACCP</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'warranty' && (
          <div>
            <h3 className="text-xl font-semibold mb-6">Garanzia e Assistenza</h3>
            <div className="space-y-6">
              <div className="bg-green-50/60 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start">
                  <Shield className="w-8 h-8 text-green-600 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Garanzia 3 Anni Inclusa</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Tutti i nostri prodotti sono coperti da garanzia del produttore di 3 anni 
                      contro difetti di fabbricazione. La garanzia copre parti e manodopera.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Wrench className="w-9 h-9 mx-auto mb-2 text-gray-600 stroke-[1.5]" />
                  <h5 className="font-semibold text-gray-900 mb-2">Assistenza Tecnica</h5>
                  <p className="text-sm text-gray-700">Rete capillare su tutto il territorio nazionale</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Phone className="w-9 h-9 mx-auto mb-2 text-gray-600 stroke-[1.5]" />
                  <h5 className="font-semibold text-gray-900 mb-2">Supporto H24</h5>
                  <p className="text-sm text-gray-700">Linea dedicata sempre disponibile</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <Package className="w-9 h-9 mx-auto mb-2 text-gray-600 stroke-[1.5]" />
                  <h5 className="font-semibold text-gray-900 mb-2">Ricambi Originali</h5>
                  <p className="text-sm text-gray-700">Disponibilità immediata garantita</p>
                </div>
              </div>

              <form onSubmit={handleSupportSubmit} className="border-l-4 border-[#6B9BD1] bg-[#E3F0FC] p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-[#6B9BD1] stroke-[1.5]" />
                  <h4 className="font-semibold text-gray-900 text-sm">Hai domande? Contattaci subito</h4>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nome"
                      value={supportName}
                      onChange={(e) => setSupportName(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300/60 rounded-lg text-sm focus:border-[#6B9BD1] focus:outline-none focus:ring-2 focus:ring-[#6B9BD1]/20"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Telefono"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300/60 rounded-lg text-sm focus:border-[#6B9BD1] focus:outline-none focus:ring-2 focus:ring-[#6B9BD1]/20"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      placeholder="Scrivi qui la tua richiesta..."
                      rows={2}
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      className="flex-1 px-3 py-2 border-2 border-gray-300/60 rounded-lg text-sm focus:border-[#6B9BD1] focus:outline-none focus:ring-2 focus:ring-[#6B9BD1]/20 resize-none"
                      required
                    />
                    <button 
                      type="submit"
                      disabled={supportLoading}
                      className="bg-[#6B9BD1] hover:bg-[#5A8AC0] text-white px-5 py-2 rounded-lg transition-colors font-bold text-sm whitespace-nowrap self-end disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {supportLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Invio...
                        </>
                      ) : (
                        'Invia'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
