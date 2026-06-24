import { useEffect, useState } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { 
  Home, Users, Package, ShoppingCart, Cloud, 
  Settings, X, Sun, Moon, Monitor, Database, RefreshCw,
  Shield, Wallet, Truck, Landmark, BarChart3, Menu, LogOut
} from 'lucide-react-native';
import { TouchableOpacity, View, Modal, ScrollView, Text, TextInput, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useSync } from '../../domains/sync/SyncContext';
import { useTheme } from '@/components/ThemeContext';
import { useAuth } from '../../domains/users/AuthContext';

const TAB_METADATA: { [key: string]: { title: string; icon: any; route: string } } = {
  index: { title: 'Início', icon: Home, route: '/(tabs)' },
  clientes: { title: 'Clientes', icon: Users, route: '/(tabs)/clientes' },
  produtos: { title: 'Produtos', icon: Package, route: '/(tabs)/produtos' },
  pedidos: { title: 'Vendas', icon: ShoppingCart, route: '/(tabs)/pedidos' },
  admin: { title: 'Admin', icon: Shield, route: '/(tabs)/admin' },
  caixa: { title: 'Caixa', icon: Wallet, route: '/(tabs)/caixa' },
  estoque: { title: 'Estoque', icon: Truck, route: '/(tabs)/estoque' },
  financeiro: { title: 'Finanças', icon: Landmark, route: '/(tabs)/financeiro' },
  gestor: { title: 'Gestão', icon: BarChart3, route: '/(tabs)/gestor' }
};

const getRoleTabs = (role?: string) => {
  if (!role) return [];
  switch (role) {
    case 'admin':
      return ['clientes', 'produtos', 'pedidos', 'caixa', 'estoque', 'financeiro', 'gestor', 'admin'];
    case 'caixa':
      return ['index', 'caixa'];
    case 'vendedor':
      return ['index', 'clientes', 'produtos', 'pedidos'];
    case 'estoque':
      return ['index', 'produtos', 'estoque'];
    case 'financeiro':
      return ['index', 'clientes', 'financeiro'];
    case 'gestor_geral':
    case 'gestor_rh':
      return ['index', 'clientes', 'produtos', 'gestor'];
    default:
      return ['index'];
  }
};


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { theme, setTheme } = useTheme();
  const { currentUser, logout } = useAuth();
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

  const router = useRouter();
  const pathname = usePathname();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [isTestingUrl, setIsTestingUrl] = useState(false);

  const allAuthorizedTabs = getRoleTabs(currentUser?.role);
  const bottomBarTabs = allAuthorizedTabs.slice(0, 4);
  const sidebarTabs = allAuthorizedTabs.slice(4);

  const isTabInBottomBar = (tabName: string) => {
    return bottomBarTabs.includes(tabName);
  };

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
              onPress={() => setIsSidebarVisible(true)}
              activeOpacity={0.7}
              style={{ marginLeft: 16 }}
            >
              <Menu color={Colors[colorScheme].text} size={24} />
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
            href: (isTabInBottomBar('index') ? '/(tabs)' : null) as any,
            tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="clientes"
          options={{
            title: 'Clientes',
            href: (isTabInBottomBar('clientes') ? '/(tabs)/clientes' : null) as any,
            tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="produtos"
          options={{
            title: 'Produtos',
            href: (isTabInBottomBar('produtos') ? '/(tabs)/produtos' : null) as any,
            tabBarIcon: ({ color }) => <Package color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="pedidos"
          options={{
            title: 'Vendas',
            href: (isTabInBottomBar('pedidos') ? '/(tabs)/pedidos' : null) as any,
            tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            href: (isTabInBottomBar('admin') ? '/(tabs)/admin' : null) as any,
            tabBarIcon: ({ color }) => <Shield color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="caixa"
          options={{
            title: 'Caixa',
            href: (isTabInBottomBar('caixa') ? '/(tabs)/caixa' : null) as any,
            tabBarIcon: ({ color }) => <Wallet color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="estoque"
          options={{
            title: 'Estoque',
            href: (isTabInBottomBar('estoque') ? '/(tabs)/estoque' : null) as any,
            tabBarIcon: ({ color }) => <Truck color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="financeiro"
          options={{
            title: 'Finanças',
            href: (isTabInBottomBar('financeiro') ? '/(tabs)/financeiro' : null) as any,
            tabBarIcon: ({ color }) => <Landmark color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="gestor"
          options={{
            title: 'Gestão',
            href: (isTabInBottomBar('gestor') ? '/(tabs)/gestor' : null) as any,
            tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
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

      {/* SIDEBAR DE NAVEGAÇÃO E OPÇÕES */}
      <Modal
        visible={isSidebarVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSidebarVisible(false)}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {/* Painel do Sidebar (Posicionado à Esquerda) */}
          <View className="w-[280px] h-full bg-background border-r border-border/80 p-6 pt-12 gap-6 justify-between shadow-2xl">
            <View className="gap-6">
              {/* Perfil do Usuário */}
              <View className="flex-row items-center gap-3 border-b border-border/40 pb-5">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
                  <Text className="text-primary font-bold text-lg">
                    {currentUser?.name?.slice(0, 2).toUpperCase() || 'US'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
                    {currentUser?.name || 'Colaborador'}
                  </Text>
                  <Text className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider mt-0.5">
                    {currentUser?.role?.replace('_', ' ') || 'Carregando...'}
                  </Text>
                </View>
              </View>

              {/* Acesso Rápido / Recursos Ocultos */}
              {sidebarTabs.length > 0 && (
                <View className="gap-2">
                  {sidebarTabs.map((tabKey) => {
                    const metadata = TAB_METADATA[tabKey];
                    if (!metadata) return null;
                    const Icon = metadata.icon;
                    return (
                      <TouchableOpacity
                        key={tabKey}
                        onPress={() => {
                          setIsSidebarVisible(false);
                          router.navigate(metadata.route as any);
                        }}
                        activeOpacity={0.7}
                        className="flex-row items-center gap-3 py-3 px-3 rounded-xl bg-card border border-border/40"
                      >
                        <Icon color={Colors[colorScheme].text} size={18} />
                        <Text className="text-sm font-semibold text-foreground">
                          {metadata.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Ações do Rodapé do Sidebar */}
            <View className="border-t border-border/40 pt-4 gap-3">
              <TouchableOpacity
                onPress={() => {
                  setIsSidebarVisible(false);
                  setIsSettingsVisible(true);
                }}
                activeOpacity={0.7}
                className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl border border-border/60"
              >
                <Settings color={Colors[colorScheme].text} size={16} />
                <Text className="text-xs font-bold text-foreground">Configurações</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsSidebarVisible(false);
                  logout();
                }}
                activeOpacity={0.7}
                className="flex-row items-center gap-3 py-2.5 px-3 rounded-xl bg-destructive/10 border border-destructive/20"
              >
                <LogOut color="#ef4444" size={16} />
                <Text className="text-xs font-bold text-destructive">Fazer Logout</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Overlay semi-transparente */}
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => setIsSidebarVisible(false)}
            className="flex-1 bg-black/60"
          />
        </View>
      </Modal>
    </View>
  );
}

