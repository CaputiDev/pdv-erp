import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { 
  DollarSign, Package, Users, ShoppingCart, TrendingUp, 
  Cloud, Database, Wifi, WifiOff, Settings, RefreshCw, 
  AlertCircle, CheckCircle2 
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Order } from '../../domains/orders/types';
import { Client } from '../../domains/clients/types';
import { Product } from '../../domains/products/types';

export default function Dashboard() {
  const [orders, setOrders] = useLocalStorage<Order[]>("orders", []);
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);

  // Configuração do Servidor e Sincronismo
  const defaultBackendUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
  const [backendUrl, setBackendUrl] = useLocalStorage<string>("backend_url", defaultBackendUrl);
  const [lastSync, setLastSync] = useLocalStorage<string | null>("last_sync", null);

  const [connectionStatus, setConnectionStatus] = useState<"checking" | "online" | "offline">("checking");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(backendUrl);

  const completedOrders = orders.filter((o) => o.status === "concluido");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Contadores de Pendências de Sincronismo
  const pendingClients = clients.filter(c => !c.synced);
  const pendingProducts = products.filter(p => !p.synced);
  const pendingOrders = orders.filter(o => !o.synced);
  const totalPending = pendingClients.length + pendingProducts.length + pendingOrders.length;

  const checkConnection = async (url: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(`${url}/`, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(id);
      if (response.ok) {
        const data = await response.json();
        return data.status === "online";
      }
    } catch (e) {
      clearTimeout(id);
    }
    return false;
  };

  const verifyConnection = async () => {
    setConnectionStatus("checking");
    const isOnline = await checkConnection(backendUrl);
    setConnectionStatus(isOnline ? "online" : "offline");
  };

  useEffect(() => {
    verifyConnection();
  }, [backendUrl]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const isOnline = await checkConnection(backendUrl);
      if (!isOnline) {
        setConnectionStatus("offline");
        Toast.show({
          type: "error",
          text1: "Erro de Conexão",
          text2: "Servidor indisponível. Verifique a URL do backend.",
          position: "bottom"
        });
        setIsSyncing(false);
        return;
      }
      setConnectionStatus("online");

      // Preparar payload de upload com apenas itens pendentes (removendo a tag temporária synced para o backend)
      const payload = {
        clients: pendingClients.map(({ synced, ...rest }) => rest),
        products: pendingProducts.map(({ synced, ...rest }) => rest),
        orders: pendingOrders.map(({ synced, ...rest }) => rest),
      };

      const response = await fetch(`${backendUrl}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Erro na rota /sync");
      }

      const syncResult = await response.json();
      const { synced_clients, synced_products, synced_orders } = syncResult;

      // Atualizar status dos itens locais enviados
      const updatedClients = clients.map(c => 
        synced_clients.includes(c.id) ? { ...c, synced: true } : c
      );
      const updatedProducts = products.map(p => 
        synced_products.includes(p.id) ? { ...p, synced: true } : p
      );
      const updatedOrders = orders.map(o => 
        synced_orders.includes(o.id) ? { ...o, synced: true } : o
      );

      // Baixar dados mais recentes do servidor (Download & Merge)
      const clientsRes = await fetch(`${backendUrl}/clientes`);
      let latestClients = updatedClients;
      if (clientsRes.ok) {
        const serverClients: Client[] = await clientsRes.json();
        const serverClientsMarked = serverClients.map(c => ({ ...c, synced: true }));
        latestClients = [
          ...serverClientsMarked,
          ...updatedClients.filter(c => !c.synced && !serverClientsMarked.some(sc => sc.id === c.id))
        ];
      }

      const productsRes = await fetch(`${backendUrl}/produtos`);
      let latestProducts = updatedProducts;
      if (productsRes.ok) {
        const serverProducts: Product[] = await productsRes.json();
        const serverProductsMarked = serverProducts.map(p => ({ ...p, synced: true }));
        latestProducts = [
          ...serverProductsMarked,
          ...updatedProducts.filter(p => !p.synced && !serverProductsMarked.some(sp => sp.id === p.id))
        ];
      }

      setClients(latestClients);
      setProducts(latestProducts);
      setOrders(updatedOrders);

      const nowStr = new Date().toLocaleString("pt-BR");
      setLastSync(nowStr);

      Toast.show({
        type: "success",
        text1: "Sincronização Concluída",
        text2: "Dados sincronizados e atualizados com sucesso!",
        position: "bottom"
      });
    } catch (error) {
      console.error("Erro de sincronização:", error);
      Toast.show({
        type: "error",
        text1: "Falha na Sincronização",
        text2: "Ocorreu um erro ao enviar/receber dados do servidor.",
        position: "bottom"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveUrl = async () => {
    setIsTestingUrl(true);
    let cleanUrl = inputUrl.trim();
    if (cleanUrl.endsWith("/")) {
      cleanUrl = cleanUrl.slice(0, -1);
    }

    const isOnline = await checkConnection(cleanUrl);
    setIsTestingUrl(false);

    setBackendUrl(cleanUrl);
    setConnectionStatus(isOnline ? "online" : "offline");
    setShowConfigModal(false);

    Toast.show({
      type: isOnline ? "success" : "warning",
      text1: isOnline ? "Conexão Estabelecida" : "URL Salva com Alerta",
      text2: isOnline ? "Servidor conectado com sucesso!" : "Não foi possível conectar ao servidor configurado.",
      position: "bottom"
    });
  };

  const stats = [
    {
      title: "Faturamento Total",
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      iconColor: "#10b981",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Pedidos Concluídos",
      value: completedOrders.length.toString(),
      icon: TrendingUp,
      iconColor: "#3b82f6",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total de Clientes",
      value: clients.length.toString(),
      icon: Users,
      iconColor: "#8b5cf6",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Produtos Cadastrados",
      value: products.length.toString(),
      icon: Package,
      iconColor: "#f59e0b",
      bgColor: "bg-amber-500/10",
    },
  ];

  const quickActions = [
    {
      title: "Gerenciar Clientes",
      description: "Ver e cadastrar clientes",
      path: "/clientes",
      icon: Users,
      iconColor: "#8b5cf6",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Gerenciar Produtos",
      description: "Controlar estoque",
      path: "/produtos",
      icon: Package,
      iconColor: "#f59e0b",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Criar Novo Pedido",
      description: "Iniciar venda",
      path: "/pedidos",
      icon: ShoppingCart,
      iconColor: "#3b82f6",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 24 }}>
      
      {/* SEÇÃO DE SINCRONIZAÇÃO CLOUD */}
      <View className="bg-card rounded-2xl p-5 shadow-sm border border-border/80 gap-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Cloud color="#3b82f6" size={20} />
            <Text className="text-sm font-bold text-foreground">Sincronização Cloud</Text>
          </View>
          <TouchableOpacity 
            onPress={() => { setInputUrl(backendUrl); setShowConfigModal(true); }}
            className="bg-muted p-1.5 rounded-lg"
            activeOpacity={0.7}
          >
            <Settings color="#6b7280" size={16} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus === "online" ? "bg-emerald-500" :
              connectionStatus === "offline" ? "bg-destructive" :
              "bg-amber-500"
            }`} />
            <Text className="text-xs font-semibold text-muted-foreground">
              {connectionStatus === "online" ? "Servidor Online" :
               connectionStatus === "offline" ? "Servidor Offline" :
               "Verificando conexão..."}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={verifyConnection}
            disabled={connectionStatus === "checking"}
            className="flex-row items-center gap-1"
          >
            <RefreshCw color="#3b82f6" size={12} className={connectionStatus === "checking" ? "animate-spin" : ""} />
            <Text className="text-xs font-bold text-primary">Testar</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-muted/40 p-3 rounded-xl border border-border/40 gap-1">
          <Text className="text-xs text-muted-foreground">Servidor: {backendUrl}</Text>
          <Text className="text-xs text-muted-foreground">Último Sincronismo: {lastSync || "Nunca"}</Text>
        </View>

        {/* Mensagens de pendências */}
        {totalPending > 0 ? (
          <View className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex-row items-center gap-2">
            <AlertCircle color="#f59e0b" size={16} />
            <Text className="text-xs text-amber-700 font-semibold flex-1">
              {totalPending} item(ns) pendente(s) de sincronismo.
            </Text>
          </View>
        ) : (
          <View className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex-row items-center gap-2">
            <CheckCircle2 color="#10b981" size={16} />
            <Text className="text-xs text-emerald-700 font-semibold flex-1">
              Todos os dados locais estão sincronizados.
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleSync}
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

      <View>
        <Text className="text-lg font-bold mb-4 text-foreground tracking-tight">Visão Geral</Text>
        <View className="flex-row flex-wrap justify-between gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <View 
                key={stat.title} 
                className="bg-card rounded-2xl p-5 shadow-sm border border-border/80 flex-1 min-w-[45%] max-w-[48%]"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className={`${stat.bgColor} p-2.5 rounded-xl`}>
                    <Icon color={stat.iconColor} size={22} />
                  </View>
                </View>
                <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{stat.title}</Text>
                <Text className="text-2xl font-extrabold mt-1.5 text-foreground">{stat.value}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="text-lg font-bold mb-4 text-foreground tracking-tight">Ações Rápidas</Text>
        <View className="flex-col gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.path}
                onPress={() => router.push(action.path as any)}
                activeOpacity={0.7}
                className="bg-card rounded-2xl p-4 shadow-sm border border-border/80 flex-row items-center gap-4"
              >
                <View className={`${action.bgColor} p-3 rounded-xl`}>
                  <Icon color={action.iconColor} size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-foreground">{action.title}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{action.description}</Text>
                </View>
                <View className="bg-muted px-3 py-1.5 rounded-full">
                  <Text className="text-xs font-semibold text-muted-foreground">Acessar</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* MODAL DE CONFIGURAÇÃO DE URL DO SERVIDOR */}
      <Modal
        visible={showConfigModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfigModal(false)}
      >
        <View className="flex-1 bg-black/60 justify-center p-6">
          <View className="bg-card rounded-3xl p-6 border border-border/80 gap-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-bold text-foreground">Configurar Servidor</Text>
              <TouchableOpacity onPress={() => setShowConfigModal(false)}>
                <Text className="text-muted-foreground text-sm font-bold">Fechar</Text>
              </TouchableOpacity>
            </View>

            <View className="gap-1.5">
              <Text className="text-xs font-bold text-muted-foreground uppercase">URL Base da API</Text>
              <TextInput
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="Ex: http://192.168.0.10:8000"
                placeholderTextColor="#9ca3af"
                className="bg-muted px-4 py-3 rounded-xl border border-border/80 text-foreground text-sm"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="text-[10px] text-muted-foreground leading-relaxed">
                Use 10.0.2.2:8000 para emuladores Android ou localhost:8000 para iOS/Web. Para aparelhos físicos, use o IP da sua máquina.
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowConfigModal(false)}
                className="flex-1 h-11 bg-muted rounded-xl items-center justify-center"
              >
                <Text className="text-sm font-bold text-muted-foreground">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveUrl}
                disabled={isTestingUrl}
                className="flex-1 h-11 bg-primary rounded-xl items-center justify-center flex-row gap-1"
              >
                {isTestingUrl ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-sm font-bold text-white">Salvar e Testar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
