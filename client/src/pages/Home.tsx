import React from 'react';
import { Header } from '@/components/layout/Header';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { GymTab } from '@/components/tabs/GymTab';
import { MacrosTab } from '@/components/tabs/MacrosTab';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { ScanTab } from '@/components/tabs/ScanTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { useTab } from '@/hooks/use-tab';
import { Tab } from '@/lib/types';

export default function Home() {
  const { activeTab, changeTab } = useTab('gym');
  
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'gym':
        return <GymTab />;
      case 'macros':
        return <MacrosTab />;
      case 'dashboard':
        return <DashboardTab />;
      case 'scan':
        return <ScanTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <GymTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-6">
        {renderActiveTab()}
      </main>
      
      <TabNavigation 
        activeTab={activeTab}
        onChange={(tab: Tab) => changeTab(tab)}
      />
    </div>
  );
}
