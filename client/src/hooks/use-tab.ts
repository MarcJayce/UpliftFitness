import { useState, useCallback } from 'react';
import { Tab } from '@/lib/types';

export function useTab(defaultTab: Tab = 'gym') {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const changeTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    changeTab,
  };
}
