import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { login as apiLogin, signup as apiSignup, logoutUser as apiLogout, saveToken, getReporterProfile } from '../server';

type User = {
  email: string;
  name: string;
  // Add other user fields as returned by your backend
} | null;

// Define Profile Type
export type ReporterProfile = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  bio: string;
  city: string;
  state: string;
  pincode: string;
  selfie_photo: string | null;
  id_proof_type: string;
  id_proof_number: string;
  kyc_status: string;
  reporter_status: string;
  can_submit_stories: boolean;
  created_at: string;
  suspension_reason: string | null;
  rejection_reason: string | null;
  admin_notes: string | null;
  years_of_experience: number | null;
  address_line1: string;
  address_line2: string;
  id_proof_document: string | null;
  // Add other fields as needed
};

type AuthContextType = {
  user: User; // Legacy simple user object
  userProfile: ReporterProfile | null; // Full profile
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  signup: (formData: FormData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [userProfile, setUserProfile] = useState<ReporterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const fetchProfile = async () => {
      try {
          const res = await getReporterProfile();
          if (res.data && res.data.status && res.data.data) {
              const profileData = res.data.data;
              setUserProfile(profileData);
              // Also sync legacy user state if needed
              setUser({ 
                  email: profileData.email, 
                  name: profileData.username 
              });
              await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
          }
      } catch (e) {
          console.error("Failed to fetch profile", e);
      }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedProfile = await AsyncStorage.getItem('userProfile');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedProfile) {
            setUserProfile(JSON.parse(storedProfile));
        }
        
        // Always try to refresh profile on load if we have a token (implicit via axios interceptor)
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            await fetchProfile();
        }

      } catch (e) {
        console.error('Failed to load user', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username: string, pass: string) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', pass);

      // Call API
      const response = await apiLogin(formData);
      
      const data = response.data;
      const access = data.access || data.data?.access;
      const refresh = data.refresh || data.data?.refresh;
      
      if (access) {
        await saveToken(access, refresh);
        
        // Fetch Profile Immediately
        await fetchProfile();
        
        return true;
      }
      
      return false;

    } catch (e: any) {
      console.error('Login failed', e);
      return false;
    }
  };

  const signup = async (formData: FormData) => {
    try {
        const response = await apiSignup(formData);
        if (response.data && response.data.status) {
            return true;
        }
        return false;
    } catch (e) {
        console.error("Signup failed", e);
        return false;
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userProfile');
      setUser(null);
      setUserProfile(null);
      router.replace('/login');
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isLoading, login, signup, logout, refreshProfile: fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
