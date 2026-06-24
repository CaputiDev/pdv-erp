import { Link } from "react-router";
import { DollarSign, Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

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
      color: "bg-green-500",
    },
    {
      title: "Pedidos Concluídos",
      value: completedOrders.length,
      icon: TrendingUp,
      color: "bg-blue-500",
    },
    {
      title: "Total de Clientes",
      value: clients.length,
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Produtos Cadastrados",
      value: products.length,
      icon: Package,
      color: "bg-orange-500",
    },
  ];

  const quickActions = [
    {
      title: "Gerenciar Clientes",
      description: "Ver e cadastrar clientes",
      path: "/clientes",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: "Gerenciar Produtos",
      description: "Controlar estoque",
      path: "/produtos",
      icon: Package,
      color: "bg-orange-500",
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
    <div className="p-4 space-y-6">
      <div>
        <h2 className="mb-4">Visão Geral</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="bg-card rounded-lg p-4 shadow-sm border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{stat.title}</p>
                <p className="text-2xl mt-1">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3">Ações Rápidas</h3>
        <div className="space-y-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="bg-card rounded-lg p-4 shadow-sm border border-border flex items-center gap-4 active:scale-95 transition-transform"
              >
                <div className={`${action.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4>{action.title}</h4>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
