'use client'
import React from 'react';
import { X } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  pill?: boolean;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  leftIcon,
  rightIcon,
  removable = false,
  onRemove,
  pill = false
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium transition-colors';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const roundedClass = pill ? 'rounded-full' : 'rounded';

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${roundedClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={classes}>
      {leftIcon && (
        <span className={`${iconSizes[size]} mr-1`}>
          {leftIcon}
        </span>
      )}
      
      {children}
      
      {rightIcon && !removable && (
        <span className={`${iconSizes[size]} ml-1`}>
          {rightIcon}
        </span>
      )}
      
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`${iconSizes[size]} ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors`}
          aria-label="Remove"
        >
          <X className="w-full h-full" />
        </button>
      )}
    </span>
  );
}

// Specialized badge variants
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'away' | 'busy';
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusVariants = {
    online: 'success',
    offline: 'secondary',
    away: 'warning',
    busy: 'danger'
  } as const;

  const statusIcons = {
    online: '🟢',
    offline: '⚪',
    away: '🟡',
    busy: '🔴'
  };

  return (
    <Badge
      variant={statusVariants[status]}
      leftIcon={statusIcons[status]}
      {...props}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

interface CountBadgeProps extends Omit<BadgeProps, 'children'> {
  count: number;
  max?: number;
  showZero?: boolean;
}

export function CountBadge({ 
  count, 
  max = 99, 
  showZero = false, 
  ...props 
}: CountBadgeProps) {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge variant="danger" size="sm" pill {...props}>
      {displayCount}
    </Badge>
  );
}

interface RoleBadgeProps extends Omit<BadgeProps, 'variant' | 'children'> {
  role: 'admin' | 'coach' | 'athlete' | 'guest';
}

export function RoleBadge({ role, ...props }: RoleBadgeProps) {
  const roleConfig = {
    admin: { variant: 'danger' as const, icon: '👑', label: 'Admin' },
    coach: { variant: 'warning' as const, icon: '📋', label: 'Coach' },
    athlete: { variant: 'info' as const, icon: '🏃', label: 'Athlete' },
    guest: { variant: 'secondary' as const, icon: '👤', label: 'Guest' }
  };

  const config = roleConfig[role];

  return (
    <Badge
      variant={config.variant}
      leftIcon={config.icon}
      {...props}
    >
      {config.label}
    </Badge>
  );
}

interface PointsBadgeProps extends Omit<BadgeProps, 'children' | 'variant'> {
  points: number;
}

export function PointsBadge({ points, ...props }: PointsBadgeProps) {
  return (
    <Badge
      variant="info"
      leftIcon="⭐"
      pill
      {...props}
    >
      {points.toLocaleString()}
    </Badge>
  );
}