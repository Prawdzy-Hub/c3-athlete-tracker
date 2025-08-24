'use client'
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setAuthUser(session.user);
      await loadUserData(session.user.id);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        await loadUserData(session.user.id);
      } else {
        setAuthUser(null);
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  };

  const loadUserData = async (userId: string) => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData) {
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string, role: 'athlete' | 'coach') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role }
        }
      });

      if (error) {
        throw error;
      }

      return data;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return {
    currentUser,
    authUser,
    loading,
    handleLogin,
    handleSignup,
    handleLogout,
  };
}