import React, { useEffect, useRef } from 'react';
import { Tab } from '@/lib/types';
import { 
  DumbbellIcon, 
  UtensilsIcon, 
  LayoutDashboardIcon, 
  ScanIcon, 
  UserIcon 
} from 'lucide-react';

interface TabNavigationProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}

export function TabNavigation({ activeTab, onChange }: TabNavigationProps) {
  const tabPositions = {
    gym: 0,
    macros: 1,
    dashboard: 2,
    scan: 3,
    profile: 4
  };
  
  const indicatorRef = useRef<HTMLDivElement>(null);
  
  // Update indicator position when tab changes
  useEffect(() => {
    if (indicatorRef.current) {
      const position = tabPositions[activeTab];
      indicatorRef.current.style.transform = `translateX(${position * 100}%)`;
    }
  }, [activeTab]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between relative py-2">
          {/* Tab Indicator */}
          <div 
            ref={indicatorRef}
            className="tab-indicator absolute h-1 bg-primary rounded-full top-0 w-1/5" 
            style={{ left: '10%' }}
          ></div>
          
          {/* Tab Buttons */}
          <button 
            onClick={() => onChange('gym')}
            className={`flex-1 flex flex-col items-center py-2 transition ${
              activeTab === 'gym' ? 'active' : ''
            }`}
          >
            <DumbbellIcon className={`h-5 w-5 ${
              activeTab === 'gym' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-xs mt-1 ${
              activeTab === 'gym' ? 'text-foreground' : 'text-muted-foreground'
            }`}>Gym</span>
          </button>
          
          <button 
            onClick={() => onChange('macros')}
            className={`flex-1 flex flex-col items-center py-2 transition ${
              activeTab === 'macros' ? 'active' : ''
            }`}
          >
            <UtensilsIcon className={`h-5 w-5 ${
              activeTab === 'macros' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-xs mt-1 ${
              activeTab === 'macros' ? 'text-foreground' : 'text-muted-foreground'
            }`}>Macros</span>
          </button>
          
          <button 
            onClick={() => onChange('dashboard')}
            className={`flex-1 flex flex-col items-center py-2 transition ${
              activeTab === 'dashboard' ? 'active' : ''
            }`}
          >
            <LayoutDashboardIcon className={`h-5 w-5 ${
              activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-xs mt-1 ${
              activeTab === 'dashboard' ? 'text-foreground' : 'text-muted-foreground'
            }`}>Dashboard</span>
          </button>
          
          <button 
            onClick={() => onChange('scan')}
            className={`flex-1 flex flex-col items-center py-2 transition ${
              activeTab === 'scan' ? 'active' : ''
            }`}
          >
            <ScanIcon className={`h-5 w-5 ${
              activeTab === 'scan' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-xs mt-1 ${
              activeTab === 'scan' ? 'text-foreground' : 'text-muted-foreground'
            }`}>Scan</span>
          </button>
          
          <button 
            onClick={() => onChange('profile')}
            className={`flex-1 flex flex-col items-center py-2 transition ${
              activeTab === 'profile' ? 'active' : ''
            }`}
          >
            <UserIcon className={`h-5 w-5 ${
              activeTab === 'profile' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-xs mt-1 ${
              activeTab === 'profile' ? 'text-foreground' : 'text-muted-foreground'
            }`}>Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
