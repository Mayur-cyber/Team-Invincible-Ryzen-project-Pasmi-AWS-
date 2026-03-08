import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { authClient, getToken } from '../auth';

interface UserProfile {
  username: string;
  email: string;
  profileImage: string;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    setIsLoading(true);
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          username: data.email.split('@')[0],
          email: data.email,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`
        });
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to fetch user profiles", e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Listen for storage events to sync auth state across tabs and local auth events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        refreshUser();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('auth-change', refreshUser);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('auth-change', refreshUser);
    };
  }, []);

  const updateUser = (_updates: Partial<UserProfile>) => {
    console.warn("updateUser not fully implemented.");
  };

  const clearUser = () => {
    authClient.signOut();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, updateUser, clearUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
