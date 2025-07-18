import { createContext, useContext, useState, useEffect } from 'react';

type DevContextType = {
  isDevMode: boolean;
  toggleDevMode: () => void;
};

const DEV_MODE_STORAGE_KEY = 'devMode';

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    // Initialize state from localStorage
    return localStorage.getItem(DEV_MODE_STORAGE_KEY) === 'true';
  });

  const toggleDevMode = () => {
    setIsDevMode(prev => {
      const newState = !prev;
      // Update localStorage
      if (newState) {
        localStorage.setItem(DEV_MODE_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(DEV_MODE_STORAGE_KEY);
      }
      return newState;
    });
  };

  // Optional: Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === DEV_MODE_STORAGE_KEY) {
        setIsDevMode(event.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <DevContext.Provider value={{ isDevMode, toggleDevMode }}>
      {children}
    </DevContext.Provider>
  );
}

export function useDev() {
  const context = useContext(DevContext);
  if (context === undefined) {
    throw new Error('useDev must be used within a DevProvider');
  }
  return context;
} 