import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'end-user' | 'support-agent' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize with demo users if not exist
  useEffect(() => {
    const storedUsers = localStorage.getItem('quickdesk_users');
    if (!storedUsers) {
      const demoUsers = [
        {
          id: '1',
          email: 'admin@quickdesk.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin' as UserRole,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'agent@quickdesk.com',
          password: 'agent123',
          name: 'Support Agent',
          role: 'support-agent' as UserRole,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          email: 'user@quickdesk.com',
          password: 'user123',
          name: 'End User',
          role: 'end-user' as UserRole,
          createdAt: new Date().toISOString(),
        }
      ];
      localStorage.setItem('quickdesk_users', JSON.stringify(demoUsers));
    }

    // Check for existing session
    const storedUser = localStorage.getItem('quickdesk_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('quickdesk_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        createdAt: foundUser.createdAt,
      };
      setUser(userSession);
      localStorage.setItem('quickdesk_current_user', JSON.stringify(userSession));
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${foundUser.name}`,
      });
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('quickdesk_users') || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      toast({
        title: "Registration failed",
        description: "User with this email already exists",
        variant: "destructive",
      });
      return false;
    }
    
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      password,
      name,
      role,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem('quickdesk_users', JSON.stringify(users));
    
    const userSession = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
    setUser(userSession);
    localStorage.setItem('quickdesk_current_user', JSON.stringify(userSession));
    
    toast({
      title: "Welcome to QuickDesk!",
      description: `Account created successfully for ${name}`,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quickdesk_current_user');
    toast({
      title: "Logged out",
      description: "Successfully logged out from QuickDesk",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};