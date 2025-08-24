'use client'
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'text-blue-600',
  className = ''
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Loader2 className={`${sizes[size]} ${color} animate-spin ${className}`} />
  );
}

// Full page loading component
interface LoadingPageProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingPage({ message = 'Loading...', size = 'lg' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size={size} className="mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Inline loading component
interface LoadingInlineProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingInline({ 
  message = 'Loading...', 
  size = 'md',
  className = '' 
}: LoadingInlineProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      {message && <span className="text-gray-600">{message}</span>}
    </div>
  );
}

// Loading overlay component
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...', 
  children,
  className = ''
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-2" />
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Loading skeleton components
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export function Skeleton({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4',
  rounded = false 
}: SkeletonProps) {
  return (
    <div 
      className={`
        ${width} ${height} 
        ${rounded ? 'rounded-full' : 'rounded'} 
        bg-gray-200 animate-pulse 
        ${className}
      `} 
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonCard({ 
  lines = 3, 
  showAvatar = false,
  className = '' 
}: SkeletonCardProps) {
  return (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <Skeleton width="w-12" height="h-12" rounded className="flex-shrink-0" />
        )}
        <div className="flex-1 space-y-3">
          <Skeleton width="w-3/4" height="h-5" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i}
              width={i === lines - 1 ? 'w-1/2' : 'w-full'} 
              height="h-4" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonList({ 
  items = 3, 
  showAvatar = true,
  className = '' 
}: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} lines={2} showAvatar={showAvatar} />
      ))}
    </div>
  );
}