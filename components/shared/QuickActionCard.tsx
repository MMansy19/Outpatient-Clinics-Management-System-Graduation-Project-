'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  size = 'default',
}: QuickActionCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${className}`}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-0">
        <Button
          variant="ghost"
          onClick={disabled ? undefined : onClick}
          disabled={disabled}
          className={`w-full h-auto p-4 flex flex-col items-center justify-center gap-2 ${
            variant === 'primary'
              ? 'bg-medical-primary hover:bg-medical-primary/90 text-white'
              : variant === 'secondary'
              ? 'bg-medical-secondary hover:bg-medical-secondary/90 text-white'
              : 'border-2 border-medical-primary text-medical-primary hover:bg-medical-primary/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Icon className={`${size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'}`} />
          <div className="text-center">
            <p className={`font-medium ${size === 'sm' ? 'text-sm' : ''}`}>{title}</p>
            {description && (
              <p className={`text-xs opacity-80 ${size === 'sm' ? 'text-[10px]' : ''}`}>
                {description}
              </p>
            )}
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
