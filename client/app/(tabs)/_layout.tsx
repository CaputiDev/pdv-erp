import { useEffect } from 'react';
import { Tabs, router, usePathname } from 'expo-router';
import { Home, Users, Package, ShoppingCart, Cloud } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useSync } from '../../domains/sync/SyncContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { 
    connectionStatus, 
    totalPending, 
    isSyncCardExpanded, 
    setIsSyncCardExpanded,
    handleSync,
    isSyncing
  } = useSync();

  const pathname = usePathname();

  // Sincronizar sempre que o usuário mudar de aba (entrar em uma página)
  useEffect(() => {
    if (connectionStatus === "online" && !isSyncing) {
      handleSync();
    }
  }, [pathname]);

  // Mostrar bolinha se o servidor estiver caído (vermelho) ou se houver itens desincronizados (laranja)
  const showBadge = connectionStatus === "offline" || totalPending > 0;
  const badgeColor = connectionStatus === "offline" ? "bg-destructive" : "bg-amber-500";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerTitle: 'Sistema de Gestão',
        headerTitleAlign: 'center',
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              router.push('/');
              setIsSyncCardExpanded(prev => !prev);
            }}
            activeOpacity={0.7}
            style={{ marginRight: 16, position: 'relative' }}
          >
            <Cloud color={Colors[colorScheme].text} size={24} />
            {showBadge && (
              <View className={`absolute -top-1 -right-1.5 w-3 h-3 rounded-full border border-background ${badgeColor}`} />
            )}
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="clientes"
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="produtos"
        options={{
          title: 'Produtos',
          tabBarIcon: ({ color }) => <Package color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

