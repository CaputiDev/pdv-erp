import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { DollarSign, Package, Users, ShoppingCart, TrendingUp } from 'lucide-react-native';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Order {
  id: string;
  status: "pendente" | "concluido";
  total: number;
}

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
      color: "bg-emerald-500",
    },
    {
      title: "Pedidos Concluídos",
      value: completedOrders.length.toString(),
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      title: "Total de Clientes",
      value: clients.length.toString(),
      icon: Users,
      color: "bg-violet-500",
    },
    {
      title: "Produtos Cadastrados",
      value: products.length.toString(),
      icon: Package,
      color: "bg-amber-500",
    },
  ];

  const quickActions = [
    {
      title: "Gerenciar Clientes",
      description: "Ver e cadastrar clientes",
      path: "/clientes",
      icon: Users,
      color: "bg-violet-500",
    },
    {
      title: "Gerenciar Produtos",
      description: "Controlar estoque",
      path: "/produtos",
      icon: Package,
      color: "bg-amber-500",
    },
    {
      title: "Criar Novo Pedido",
      description: "Iniciar venda",
      path: "/pedidos",
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
  ];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 24 }}>
      <View>
        <Text className="text-xl font-bold mb-4 text-foreground">Visão Geral</Text>
        <View className="flex-row flex-wrap justify-between gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <View 
                key={stat.title} 
                className="bg-card rounded-xl p-4 shadow-sm border border-border flex-1 min-w-[45%] max-w-[48%]"
              >
                <View className="flex-row items-center gap-3 mb-2">
                  <View className={`${stat.color} p-2 rounded-lg`}>
                    <Icon color="white" size={20} />
                  </View>
                </View>
                <Text className="text-muted-foreground text-xs font-medium">{stat.title}</Text>
                <Text className="text-lg font-bold mt-1 text-foreground">{stat.value}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View>
        <Text className="text-xl font-bold mb-4 text-foreground">Ações Rápidas</Text>
        <View className="flex-col gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.path}
                onPress={() => router.push(action.path as any)}
                activeOpacity={0.7}
                className="bg-card rounded-xl p-4 shadow-sm border border-border flex-row items-center gap-4"
              >
                <View className={`${action.color} p-3 rounded-xl`}>
                  <Icon color="white" size={24} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{action.title}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5">{action.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
