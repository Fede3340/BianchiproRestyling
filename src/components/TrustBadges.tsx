import { Star, ShieldCheck, Headphones, FileText } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Star,
      title: 'ACQUISTI 5 STELLE',
      description: 'Recensioni verificate',
      color: 'text-yellow-500',
      bg: 'bg-yellow-50'
    },
    {
      icon: ShieldCheck,
      title: 'ACQUISTI SICURI',
      description: 'Pagamenti protetti',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      icon: Headphones,
      title: "SUPPORTO ALL'ACQUISTO",
      description: 'Assistenza dedicata',
      color: 'text-[#6B9BD1]',
      bg: 'bg-[#E3F0FC]'
    },
    {
      icon: FileText,
      title: 'PREVENTIVI PERSONALIZZATI',
      description: 'Per grandi ordini',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {badges.map((badge, index) => (
        <div
          key={index}
          className={`${badge.bg} rounded-xl p-7 text-center transition-transform hover:scale-105 border border-transparent hover:border-gray-200 shadow-sm`}
        >
          <badge.icon className={`w-9 h-9 ${badge.color} mx-auto mb-4`} />
          <div className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-2">{badge.title}</div>
          <div className="text-xs text-gray-600">{badge.description}</div>
        </div>
      ))}
    </div>
  );
}
