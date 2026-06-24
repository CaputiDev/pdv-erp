import { Outlet, Link, useLocation } from "react-router";
import { Home, Users, Package, ShoppingCart } from "lucide-react";

export default function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/clientes", icon: Users, label: "Clientes" },
    { path: "/produtos", icon: Package, label: "Produtos" },
    { path: "/pedidos", icon: ShoppingCart, label: "Pedidos" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-center">Sistema de Gestão</h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
