import React from 'react';
import { LayoutDashboard, Crown, CalendarCheck, Calendar, FileText } from 'lucide-react';
import { NavTab } from './Sidebar';

interface MobileNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  cutiHariIniCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  cutiHariIniCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'pimpinan', label: 'Pimpinan', icon: <Crown className="w-5 h-5 text-amber-500" /> },
    {
      id: 'cuti-hari-ini',
      label: 'Hari Ini',
      icon: <CalendarCheck className="w-5 h-5" />,
      badge: cutiHariIniCount,
    },
    { id: 'kalender', label: 'Kalender', icon: <Calendar className="w-5 h-5" /> },
    { id: 'laporan', label: 'Laporan', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg no-print">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition relative ${
              isActive ? 'text-teal-700 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="mt-0.5 truncate">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
