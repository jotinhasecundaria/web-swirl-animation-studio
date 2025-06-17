
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { authLogger } from '@/utils/authLogger';
import { getAuthErrorMessage, cleanupAuthState } from '@/utils/authHelpers';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  status: 'active' | 'pending' | 'suspended';
  department?: string;
  position?: string;
  phone?: string;
  avatar_url?: string;
  unit_id?: string;
}

export type UserRole = 'admin' | 'supervisor' | 'user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      authLogger.info('Fetching user profile', { userId });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        authLogger.error('Error fetching profile', { userId, error: error.message });
        return { data: null, error };
      }
      
      if (data) {
        const mappedProfile: Profile = {
          ...data,
          status: data.status === 'inactive' ? 'suspended' : data.status
        };
        
        authLogger.info('Profile fetched successfully', { 
          userId, 
          email: mappedProfile.email, 
          status: mappedProfile.status 
        });
        
        setProfile(mappedProfile);
        return { data: mappedProfile, error: null };
      }
      
      authLogger.warning('No profile found for user', { userId });
      return { data: null, error: null };
    } catch (error: any) {
      authLogger.error('Exception while fetching profile', { userId, error: error.message });
      return { data: null, error };
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      authLogger.info('Fetching user role', { userId });
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('granted_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        authLogger.error('Error fetching user role', { userId, error: error.message });
        return { data: null, error };
      }
      
      const userRole = data?.role || 'user';
      authLogger.info('User role fetched', { userId, role: userRole });
      
      setRole(userRole);
      return { data: userRole, error: null };
    } catch (error: any) {
      authLogger.error('Exception while fetching user role', { userId, error: error.message });
      return { data: null, error };
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        authLogger.info('Initializing auth system');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            authLogger.info('Auth state change', { 
              event, 
              userEmail: session?.user?.email,
              hasSession: !!session 
            });
            
            if (!mounted) {
              authLogger.debug('Component unmounted, skipping auth state update');
              return;
            }

            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              authLogger.info('User authenticated, fetching profile and role', { 
                userId: session.user.id,
                email: session.user.email 
              });
              
              setTimeout(async () => {
                if (mounted) {
                  await fetchProfile(session.user.id);
                  await fetchUserRole(session.user.id);
                }
              }, 0);
            } else {
              authLogger.info('No active session, clearing user data');
              setProfile(null);
              setRole(null);
            }
            
            setLoading(false);
            setInitializing(false);
          }
        );

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        authLogger.info('Current session check', { 
          hasCurrentSession: !!currentSession,
          userEmail: currentSession?.user?.email 
        });
        
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          setTimeout(async () => {
            if (mounted) {
              await fetchProfile(currentSession.user.id);
              await fetchUserRole(currentSession.user.id);
            }
          }, 0);
        }
        
        setLoading(false);
        setInitializing(false);

        return () => {
          authLogger.info('Cleaning up auth subscription');
          subscription.unsubscribe();
        };
      } catch (error: any) {
        authLogger.error('Auth initialization error', { error: error.message });
        if (mounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      authLogger.info('Sign in attempt', { email });
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      // Primeiro verificar se o usuário existe e seu status
      const { data: profileData } = await supabase
        .from('profiles')
        .select('status, full_name')
        .eq('email', email)
        .single();

      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        authLogger.error('Sign in failed', { email, error: error.message });
        
        // Mensagens específicas baseadas no erro
        let friendlyMessage = '';
        if (error.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMessage = 'Email não confirmado. Verifique sua caixa de entrada e confirme seu email.';
        } else {
          friendlyMessage = getAuthErrorMessage(error);
        }
        
        toast({
          title: 'Erro no login',
          description: friendlyMessage,
          variant: 'destructive',
        });
        return { data: null, error };
      }

      // Se o login foi bem-sucedido mas o usuário tem status pending
      if (data?.user && profileData && profileData.status === 'pending') {
        authLogger.info('User login successful but account pending approval', { email });
        
        // Fazer logout do usuário
        await supabase.auth.signOut();
        
        toast({
          title: 'Conta pendente de aprovação',
          description: 'Sua conta está aguardando aprovação de um administrador. Você receberá um email quando for aprovada.',
          variant: 'destructive',
        });
        return { data: null, error: { message: 'Account pending approval' } };
      }

      // Se o usuário tem status suspenso
      if (data?.user && profileData && profileData.status === 'suspended') {
        authLogger.info('User login successful but account suspended', { email, status: profileData.status });
        
        // Fazer logout do usuário
        await supabase.auth.signOut();
        
        toast({
          title: 'Conta suspensa',
          description: 'Sua conta foi suspensa. Entre em contato com um administrador.',
          variant: 'destructive',
        });
        return { data: null, error: { message: 'Account suspended' } };
      }

      authLogger.info('Sign in successful', { email, userId: data.user?.id });
      
      toast({
        title: 'Login realizado com sucesso!',
        description: `Bem-vindo, ${profileData?.full_name || email}!`,
      });
      
      return { data, error: null };
    } catch (error: any) {
      const friendlyMessage = getAuthErrorMessage(error);
      authLogger.error('Sign in exception', { email, error: error.message });
      
      toast({
        title: 'Erro no login',
        description: friendlyMessage,
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      authLogger.info('Sign up attempt', { email, fullName });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        authLogger.error('Sign up failed', { email, error: error.message });
        
        toast({
          title: 'Erro no cadastro',
          description: friendlyMessage,
          variant: 'destructive',
        });
        return { data: null, error };
      }

      authLogger.info('Sign up successful', { email, userId: data.user?.id });
      
      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Verifique seu email para confirmar a conta. Após a confirmação, aguarde a aprovação de um administrador.',
      });
      
      return { data, error: null };
    } catch (error: any) {
      const friendlyMessage = getAuthErrorMessage(error);
      authLogger.error('Sign up exception', { email, error: error.message });
      
      toast({
        title: 'Erro no cadastro',
        description: friendlyMessage,
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      authLogger.info('Sign out attempt', { userEmail: user?.email });
      
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        authLogger.error('Sign out failed', { error: error.message });
        toast({
          title: 'Erro ao sair',
          description: getAuthErrorMessage(error),
          variant: 'destructive',
        });
        return { error };
      }

      authLogger.info('Sign out successful');
      
      // Force page reload for clean state
      window.location.href = '/auth';
      
      return { error: null };
    } catch (error: any) {
      authLogger.error('Sign out exception', { error: error.message });
      toast({
        title: 'Erro ao sair',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      authLogger.info('Password reset attempt', { email });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        const friendlyMessage = getAuthErrorMessage(error);
        authLogger.error('Password reset failed', { email, error: error.message });
        
        toast({
          title: 'Erro',
          description: friendlyMessage,
          variant: 'destructive',
        });
        return { error };
      }

      authLogger.info('Password reset email sent', { email });
      
      toast({
        title: 'Email enviado com sucesso!',
        description: 'Verifique seu email para redefinir a senha.',
      });
      
      return { error: null };
    } catch (error: any) {
      const friendlyMessage = getAuthErrorMessage(error);
      authLogger.error('Password reset exception', { email, error: error.message });
      
      toast({
        title: 'Erro',
        description: friendlyMessage,
        variant: 'destructive',
      });
      return { error };
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    return role === requiredRole;
  };

  const isAdmin = (): boolean => {
    return role === 'admin';
  };

  const isSupervisor = (): boolean => {
    return role === 'supervisor' || role === 'admin';
  };

  const isPending = (): boolean => {
    return profile?.status === 'pending';
  };

  const isActive = (): boolean => {
    return profile?.status === 'active';
  };

  const isSuspended = (): boolean => {
    return profile?.status === 'suspended';
  };

  return {
    user,
    session,
    profile,
    role,
    loading,
    initializing,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile: () => user && fetchProfile(user.id),
    refreshRole: () => user && fetchUserRole(user.id),
    isAuthenticated: !!session,
    userRole: role,
    hasRole,
    isAdmin,
    isSupervisor,
    isPending,
    isActive,
    isSuspended,
  };
};
