'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'athlete' | 'coach';
  fallbackPath?: string;
}

export default function AuthGuard({ 
  children, 
  requireRole, 
  fallbackPath = '/' 
}: AuthGuardProps) {
  const { currentUser, authUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // Redirect if not authenticated
    if (!authUser) {
      router.push(fallbackPath);
      return;
    }

    // Redirect if role requirement not met
    if (requireRole && currentUser && currentUser.role !== requireRole) {
      router.push('/dashboard');
      return;
    }
  }, [authUser, currentUser, loading, requireRole, fallbackPath, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!authUser) {
    return null;
  }

  // Don't render children if role requirement not met
  if (requireRole && currentUser && currentUser.role !== requireRole) {
    return null;
  }

  return <>{children}</>;
}