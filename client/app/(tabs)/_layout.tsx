import { useEffect, useState } from 'react';
import { Tabs, usePathname } from 'expo-router';
import { 
  Home, Users, Package, ShoppingCart, Cloud, 
  Settings, X, Sun, Moon, Monitor, Database, RefreshCw 
} from 'lucide-react-native';
import { TouchableOpacity, View, Modal, ScrollView, Text, TextInput, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useSync } from '../../domains/sync/SyncContext';
import { useTheme } from '@/components/ThemeContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme, setTheme } = useTheme();
  const { 
    backendUrl,
    setBackendUrl,
    lastSync,
    connectionStatus, 
    totalPending, 
    handleSync,
    isSyncing,
    verifyConnection
  } = useSync();

  const pathname = usePathname();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [isTestingUrl, setIsTestingUrl] = useState(false);

  // Sincronizar sempre que o usuário mudar de aba (entrar em uma página)
  useEffect(() => {
    if (connectionStatus === "online" && !isSyncing) {
      handleSync();
    }
  }, [pathname]);

  // Atualizar input da URL se a URL do backend mudar ou quando o modal abrir
  useEffect(() => {
    setInputUrl(backendUrl);
  }, [backendUrl, isSettingsVisible]);

  const handleSaveUrl = async () => {
    setIsTestingUrl(true);
    let cleanUrl = inputUrl.trim();
    if (cleanUrl.endsWith("/")) {
      cleanUrl = cleanUrl.slice(0, -1);
    }
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    let isOnline = false;
    try {
      const response = await fetch(`${cleanUrl}/`, { method: "GET", signal: controller.signal });
      clearTimeout(id);
      if (response.ok) {
        const data = await response.json();
        isOnline = data.status === "online";
      }
    } catch (e) {
      clearTimeout(id);
    }
    setIsTestingUrl(false);
    setBackendUrl(cleanUrl);
    Toast.show({
      type: isOnline ? "success" : "warning",
      text1: isOnline ? "Conexão Estabelecida" : "URL Salva com Alerta",
      text2: isOnline ? "Servidor conectado com sucesso!" : "Não foi possível conectar ao servidor configurado.",
      position: "bottom"
    });
  };

  // Mostrar bolinha se o servidor estiver caído (vermelho) ou se houver itens desincronizados (laranja)
  const showBadge = connectionStatus === "offline" || totalPending > 0;
  const badgeColor = connectionStatus === "offline" ? "bg-destructive" : "bg-amber-500";

  const themeOptions = [
    { id: 'light' as const, label: 'Claro', icon: Sun },
    { id: 'dark' as const, label: 'Escuro', icon: Moon },
    { id: 'system' as const, label: 'Sistema', icon: Monitor }
  ];

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#18181b' : '#ffffff',
            borderTopColor: colorScheme === 'dark' ? '#27272a' : '#e2e8f0',
          },
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#18181b' : '#ffffff',
          },
          headerTintColor: Colors[colorScheme].text,
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, true),
          headerTitle: 'Sistema de Gestão',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => setIsSettingsVisible(true)}
              activeOpacity={0.7}
              style={{ marginLeft: 16 }}
            >
              <Settings color={Colors[colorScheme].text} size={24} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                const formattedSync = lastSync 
                  ? `Última sincronização: ${lastSync}` 
                  : "Nunca sincronizado";
                Toast.show({
                  type: 'info',
                  text1: 'Status de Sincronização',
                  text2: formattedSync,
                  position: 'top',
                });
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

      {/* MODAL DE CONFIGURAÇÕES */}
      <Modal
        visible={isSettingsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-background rounded-t-[36px] max-h-[85%] border-t border-border/50">
            
            {/* Cabeçalho do Modal */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-border/10">
              <View className="flex-row items-center gap-2">
                <Settings color={Colors[colorScheme].text} size={20} />
                <Text className="text-lg font-bold text-foreground">Configurações</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setIsSettingsVisible(false)}
                className="bg-muted p-2 rounded-full"
                activeOpacity={0.7}
              >
                <X color={Colors[colorScheme].text} size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
              
              {/* SEÇÃO APARÊNCIA */}
              <View className="gap-3">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aparência</Text>
                <View className="flex-row gap-2">
                  {themeOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        onPress={() => setTheme(opt.id)}
                        activeOpacity={0.8}
                        className={`flex-1 flex-row items-center justify-center gap-2 py-3 px-2 h-11 rounded-xl border ${
                          theme === opt.id 
                            ? "bg-primary border-primary" 
                            : "bg-card border-border/80"
                        }`}
                      >
                        <Icon color={theme === opt.id ? "#ffffff" : Colors[colorScheme].text} size={16} />
                        <Text className={`text-xs font-bold ${theme === opt.id ? "text-white" : "text-foreground"}`}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* SEÇÃO SINCRONIZAÇÃO */}
              <View className="gap-4">
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sincronização Cloud</Text>
                
                {/* Status da conexão */}
                <View className="bg-card rounded-2xl p-4 border border-border/80 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className={`w-2.5 h-2.5 rounded-full ${
                      connectionStatus === "online" ? "bg-emerald-500" :
                      connectionStatus === "offline" ? "bg-destructive" :
                      "bg-amber-500"
                    }`} />
                    <Text className="text-sm font-semibold text-foreground">
                      {connectionStatus === "online" ? "Servidor Online" :
                       connectionStatus === "offline" ? "Servidor Offline" :
                       "Verificando conexão..."}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={verifyConnection}
                    disabled={connectionStatus === "checking"}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-1.5 bg-muted px-3 py-1.5 rounded-lg"
                  >
                    <RefreshCw color="#3b82f6" size={12} className={connectionStatus === "checking" ? "animate-spin" : ""} />
                    <Text className="text-xs font-bold text-primary">Testar</Text>
                  </TouchableOpacity>
                </View>

                {/* Configuração de URL */}
                <View className="gap-2 bg-card rounded-2xl p-4 border border-border/80">
                  <Text className="text-xs font-bold text-muted-foreground">URL do Servidor Backend</Text>
                  <TextInput
                    value={inputUrl}
                    onChangeText={setInputUrl}
                    placeholder="Ex: http://192.168.0.10:8000"
                    placeholderTextColor="#9ca3af"
                    className="bg-muted px-4 py-3 rounded-xl border border-border/80 text-foreground text-sm"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={handleSaveUrl}
                    disabled={isTestingUrl}
                    activeOpacity={0.8}
                    className="h-11 bg-primary rounded-xl items-center justify-center flex-row"
                  >
                    {isTestingUrl ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-sm font-bold text-white">Salvar e Testar URL</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Resumo de sincronização e Botão Sincronizar Agora */}
                <View className="bg-card rounded-2xl p-4 border border-border/80 gap-3">
                  <View className="gap-1.5">
                    <Text className="text-xs text-muted-foreground">Última atualização: {lastSync || "Nunca"}</Text>
                    <Text className="text-xs text-muted-foreground">Pendências locais: {totalPending} item(ns)</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSync(true)}
                    disabled={isSyncing}
                    activeOpacity={0.8}
                    className={`h-11 rounded-xl items-center justify-center flex-row gap-2 ${
                      isSyncing ? "bg-primary/50" : "bg-primary"
                    }`}
                  >
                    {isSyncing ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Database color="#ffffff" size={16} />
                        <Text className="text-sm font-bold text-white">Sincronizar Agora</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

