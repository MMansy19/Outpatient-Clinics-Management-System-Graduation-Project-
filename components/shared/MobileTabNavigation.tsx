'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tab {
  value: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
}

interface MobileTabNavigationProps {
  tabs: Tab[];
  currentTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function MobileTabNavigation({
  tabs,
  currentTab,
  onTabChange,
  className = '',
}: MobileTabNavigationProps) {
  return (
    <div className={`md:hidden border-b bg-card sticky top-0 z-10 ${className}`}>
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.value;

          return (
            <Button
              key={tab.value}
              variant="ghost"
              onClick={() => onTabChange(tab.value)}
              className={`flex-1 flex-shrink-0 flex flex-col items-center gap-1 py-3 px-2 rounded-none border-b-2 ${
                isActive
                  ? 'border-medical-primary text-medical-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="text-xs font-medium">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
