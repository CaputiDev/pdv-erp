import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';


import { useColorScheme } from '@/components/useColorScheme';
import { ThemeProvider as CustomThemeProvider } from '../components/ThemeContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { AuthProvider, useAuth } from '../domains/users/AuthContext';
import { useSegments, useRouter } from 'expo-router';

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <CustomThemeProvider>
        <RootLayoutNav />
      </CustomThemeProvider>
    </AuthProvider>
  );
}

import Toast from 'react-native-toast-message';
import { SyncProvider } from '../domains/sync/SyncContext';

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4f46e5',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#6366f1',
    background: '#09090b',
    card: '#18181b',
    text: '#fafafa',
    border: '#27272a',
  },
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { currentUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const firstSegment = segments[0] as string;
    const inAuthGroup = firstSegment === 'login' || firstSegment === 'change-password';

    if (!currentUser) {
      // Se não está autenticado, forçar ir para login
      if (firstSegment !== 'login') {
        router.replace('/login' as any);
      }
    } else if (currentUser.isTempPassword) {
      // Se a senha é temporária, forçar trocar senha
      if (firstSegment !== 'change-password') {
        router.replace('/change-password' as any);
      }
    } else {
      // Se está logado e senha é definitiva, mas está na auth, redireciona para dashboard
      if (inAuthGroup) {
        router.replace('/(tabs)' as any);
      }
    }
  }, [currentUser, segments]);

  return (
    <SyncProvider>
      <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="change-password" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
        <Toast />
      </ThemeProvider>
    </SyncProvider>
  );
}
