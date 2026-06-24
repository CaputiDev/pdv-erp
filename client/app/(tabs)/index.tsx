import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { DollarSign, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react-native';
import { useLocalStorage } from '../../hooks/useLocalStorage';

import { Order } from '../../domains/orders/types';

export default function Dashboard() {
  const [orders] = useLocalStorage<Order[]>("orders", []);
  const [clients] = useLocalStorage<any[]>("clients", []);
  const [products] = useLocalStorage<any[]>("products", []);

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
                className="bg-card rounded-2xl p-4.5 shadow-sm border border-border/80 flex-row items-center gap-4"
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
