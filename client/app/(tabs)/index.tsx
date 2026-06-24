import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { 
  DollarSign, Package, Users, ShoppingCart, TrendingUp, 
  Cloud, Database, Settings, RefreshCw, AlertCircle, CheckCircle2 
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Order } from '../../domains/orders/types';
import { useSync } from '../../domains/sync/SyncContext';

export default function Dashboard() {
  const [orders] = useLocalStorage<Order[]>("orders", []);
  
  const {
    backendUrl, setBackendUrl,
    lastSync,
    connectionStatus,
    isSyncing,
    totalPending,
    verifyConnection,
    handleSync,
    isSyncCardExpanded
  } = useSync();

  const [showConfig, setShowConfig] = useState(false);
  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [isTestingUrl, setIsTestingUrl] = useState(false);

  useEffect(() => {
    setInputUrl(backendUrl);
  }, [backendUrl, isSyncCardExpanded]);

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
    setShowConfig(false);
    Toast.show({
      type: isOnline ? "success" : "warning",
      text1: isOnline ? "Conexão Estabelecida" : "URL Salva com Alerta",
      text2: isOnline ? "Servidor conectado com sucesso!" : "Não foi possível conectar ao servidor configurado.",
      position: "bottom"
    });
  };

  const completedOrders = orders.filter((o) => o.status === "concluido");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

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
      value: "...",
      icon: Users,
      iconColor: "#8b5cf6",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Produtos Cadastrados",
      value: "...",
      icon: Package,
      iconColor: "#f59e0b",
      bgColor: "bg-amber-500/10",
    },
  ];

  const { clients: localClients, products: localProducts } = useSync();

  stats[2].value = localClients.length.toString();
  stats[3].value = localProducts.length.toString();

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
      
      {/* SEÇÃO DE SINCRONIZAÇÃO CLOUD (CONDICIONAL - RECOLHIDA POR PADRÃO) */}
      {isSyncCardExpanded && (
        <View className="bg-card rounded-2xl p-5 shadow-sm border border-border/80 gap-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Cloud color="#3b82f6" size={20} />
              <Text className="text-sm font-bold text-foreground">Sincronização Cloud</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowConfig(!showConfig)}
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
            <Text className="text-xs text-muted-foreground">Última atualização: {lastSync || "Nunca"}</Text>
          </View>

          {showConfig && (
            <View className="gap-2 pt-2 border-t border-border/30">
              <TextInput
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="Ex: http://192.168.0.10:8000"
                placeholderTextColor="#9ca3af"
                className="bg-muted px-4 py-2.5 rounded-xl border border-border/80 text-foreground text-sm"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={handleSaveUrl}
                disabled={isTestingUrl}
                className="h-10 bg-primary rounded-xl items-center justify-center flex-row"
              >
                {isTestingUrl ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-xs font-bold text-white">Salvar e Testar URL</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Mensagens de pendências */}
          {totalPending > 0 ? (
            <View className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex-row items-center gap-2">
              <AlertCircle color="#f59e0b" size={16} />
              <Text className="text-xs text-amber-700 font-semibold flex-1">
                {totalPending} item(ns) desincronizados.
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
      )}

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
    </ScrollView>
  );
}
