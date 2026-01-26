'use client';

import React from 'react';
import { format } from 'date-fns';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EntityListItemProps<T> {
  entity: T;
  icon?: LucideIcon;
  title: string | ((entity: T) => string);
  subtitle?: string | ((entity: T) => string);
  description?: string | ((entity: T) => string);
  date?: string | ((entity: T) => string);
  badge?: {
    label: string | ((entity: T) => string);
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  onClick?: (entity: T) => void;
  onEdit?: (entity: T) => void;
  onDelete?: (entity: T) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function EntityListItem<T>({
  entity,
  icon: Icon,
  title,
  subtitle,
  description,
  date,
  badge,
  onClick,
  onEdit,
  onDelete,
  actions,
  className = '',
}: EntityListItemProps<T>) {
  const getTitle = () => (typeof title === 'function' ? title(entity) : title);
  const getSubtitle = () => (typeof subtitle === 'function' ? subtitle(entity) : subtitle);
  const getDescription = () =>
    typeof description === 'function' ? description(entity) : description;
  const getDate = () => (typeof date === 'function' ? date(entity) : date);
  const getBadge = () =>
    badge && {
      label: typeof badge.label === 'function' ? badge.label(entity) : badge.label,
      variant: badge.variant || 'default',
    };

  const badgeData = getBadge();

  return (
    <div
      className={`flex items-start justify-between gap-4 p-4 rounded-lg border hover:bg-accent transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick ? () => onClick(entity) : undefined}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="mt-1 shrink-0">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium line-clamp-1">{getTitle()}</p>
              {badgeData && (
                <Badge variant={badgeData.variant} className="text-xs">
                  {badgeData.label}
                </Badge>
              )}
            </div>
            {getSubtitle() && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                {getSubtitle()}
              </p>
            )}
            {getDescription() && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {getDescription()}
              </p>
            )}
            {getDate() && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(getDate()!), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(entity);
            }}
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entity);
            }}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
