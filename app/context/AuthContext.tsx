import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

type User = {
  email: string;
  name: string;
  token: string;
} | null;

type AuthContextType = {
  user: User;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    
    // Simple navigation protection logic could go here, 
    // but for now we'll let the login screen handle the redirect 
    // or let the root layout handle "if !user && inAuthGroup -> replace('/login')"
    // implementation details often vary. 
    // Given the user wants "dashboard me jaye", explicit navigation on login is safer.
  }, [user, isLoading, segments]);

  const login = async (email: string, pass: string) => {
    // Default ID/Password as requested
    // You can also add more complex validation here
    if ((email === 'admin@recon.com' || email === 'user@recon.com') && pass === '12345678') {
      const fakeUser = {
        email,
        name: email.split('@')[0],
        token: 'fake-jwt-token-123',
      };
      
      try {
        await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
        setUser(fakeUser);
        return true;
      } catch (e) {
        console.error('Login failed', e);
        return false;
      }
    }
    
    // Allow any login for demo if not matching default? 
    // User said "default id password dalo taki login krke dashboard me jaye", 
    // implying meaningful auth. I'll stick to specific credentials or allow "test" credentials.
    // Let's being lenient but prefer the default. 
    
    // Actually, let's just allow it for now if they use the default, 
    // or maybe simulate a successful login for any valid formatted email?
    // "context api se add kro ... default id password dalo"
    // I will enforce the check for the default one, but maybe allow others if needed.
    // For now: STRICT check on default or generic fallback?
    // I'll add a generic fallback for testing convenience if the user wants purely UI check.
    // But "default id password" suggests a specific pair.
    
    return false;
  };

  const signup = async (email: string, pass: string, name: string) => {
    // Simulate API call
    const fakeUser = {
      email,
      name,
      token: 'fake-jwt-token-created',
    };
    try {
        await AsyncStorage.setItem('user', JSON.stringify(fakeUser));
        setUser(fakeUser);
        return true;
    } catch (e) {
        return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      router.replace('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
