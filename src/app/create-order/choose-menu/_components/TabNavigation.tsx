"use client";

import { FC } from "react";

type TabType = 'promo' | 'bestseller' | 'suggestions';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TabNavigation: FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'promo' as TabType, label: 'Promo' },
    { id: 'bestseller' as TabType, label: 'Best Seller' },
    { id: 'suggestions' as TabType, label: 'Suggestions' },
  ];

  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;