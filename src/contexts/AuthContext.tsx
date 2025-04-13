
import React, { createContext, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Create a mock user that will be used when signing in
  const mockUser = {
    id: 'mock-user-id',
    email: '',
    user_metadata: {
      name: '',
      phone: ''
    }
  } as User;

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      setLoading(true);
      
      // Mock user creation
      const mockCreatedUser = {
        ...mockUser,
        email,
        user_metadata: {
          name,
          phone
        }
      } as User;
      
      setUser(mockCreatedUser);
      
      const mockSession = {
        user: mockCreatedUser,
        access_token: 'mock-token',
      } as Session;
      
      setSession(mockSession);
      
      toast({
        title: 'Account created!',
        description: 'Welcome to the bulletin.',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing up',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Mock user sign-in
      const mockSignedInUser = {
        ...mockUser,
        email,
        user_metadata: {
          name: 'Demo User',
          phone: '123-456-7890'
        }
      } as User;
      
      setUser(mockSignedInUser);
      
      const mockSession = {
        user: mockSignedInUser,
        access_token: 'mock-token',
      } as Session;
      
      setSession(mockSession);
      
      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setUser(null);
      setSession(null);
      
      toast({
        title: 'Signed out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
