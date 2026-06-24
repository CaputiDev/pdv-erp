import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

export const useColorScheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return 'light';
  }
  return context.colorScheme;
};
