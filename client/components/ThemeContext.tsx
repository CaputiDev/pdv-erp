import React, { createContext, useContext, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colorScheme: 'light' | 'dark';
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useLocalStorage<ThemeType>('theme_preference', 'system');
  const deviceColorScheme = useDeviceColorScheme();
  const { setColorScheme: setNwColorScheme } = useNativeWindColorScheme();

  const computedColorScheme = theme === 'system'
    ? (deviceColorScheme === 'unspecified' || !deviceColorScheme ? 'light' : deviceColorScheme)
    : theme;

  useEffect(() => {
    // Sincronizar o tema calculado com o NativeWind
    setNwColorScheme(computedColorScheme);
  }, [computedColorScheme, setNwColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colorScheme: computedColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
