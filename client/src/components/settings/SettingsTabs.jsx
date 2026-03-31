import React from 'react';
import { Building2, Layers, BedDouble, Receipt, Bell } from 'lucide-react';

export default function SettingsTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'profile', label: 'Hospital Profile', icon: Building2 },
    { id: 'departments', label: 'Departments', icon: Layers },
    { id: 'beds', label: 'Beds', icon: BedDouble },
    { id: 'fees', label: 'Fee Structures', icon: Receipt },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="w-56 flex-shrink-0 sticky top-6 space-y-1" role="tablist" aria-orientation="vertical">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`
              w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-left transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset
              ${isActive 
                ? 'bg-primary-50 text-primary-700 font-medium border-l-2 border-primary-600 rounded-none rounded-r-lg' 
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-l-2 border-transparent'}
            `}
          >
            <Icon size={18} className={isActive ? 'text-primary-600' : 'text-neutral-400'} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
