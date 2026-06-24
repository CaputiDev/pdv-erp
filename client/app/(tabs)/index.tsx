import { ScrollView, View, Text } from 'react-native';
import { DollarSign, Package, Users, TrendingUp } from 'lucide-react-native';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Order } from '../../domains/orders/types';
import { useSync } from '../../domains/sync/SyncContext';

export default function Dashboard() {
  const [orders] = useLocalStorage<Order[]>("orders", []);
  const { clients: localClients, products: localProducts } = useSync();

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
      value: localClients.length.toString(),
      icon: Users,
      iconColor: "#8b5cf6",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Produtos Cadastrados",
      value: localProducts.length.toString(),
      icon: Package,
      iconColor: "#f59e0b",
      bgColor: "bg-amber-500/10",
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
    </ScrollView>
  );
}
