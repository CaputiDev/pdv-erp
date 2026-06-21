import { useState } from "react";
import { Plus, Minus, ShoppingCart, Trash2, Check } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: CartItem[];
  total: number;
  status: "pendente" | "concluido";
  date: string;
}

export default function Orders() {
  const [clients] = useLocalStorage<Client[]>("clients", []);
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [orders, setOrders] = useLocalStorage<Order[]>("orders", []);

  const [selectedClientId, setSelectedClientId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"pendente" | "concluido">("pendente");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = () => {
    if (!selectedProductId) {
      toast.error("Selecione um produto");
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (quantity > product.stock) {
      toast.error("Quantidade maior que o estoque disponível");
      return;
    }

    const existingItem = cart.find((item) => item.productId === selectedProductId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        toast.error("Quantidade total excede o estoque");
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity(1);
    toast.success("Produto adicionado ao carrinho");
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart(
      cart.map((item) => {
        if (item.productId === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          if (newQuantity > product.stock) {
            toast.error("Quantidade excede o estoque");
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const finalizeOrder = () => {
    if (!selectedClientId) {
      toast.error("Selecione um cliente");
      return;
    }

    if (cart.length === 0) {
      toast.error("Adicione produtos ao carrinho");
      return;
    }

    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) return;

    if (status === "concluido") {
      const updatedProducts = products.map((product) => {
        const cartItem = cart.find((item) => item.productId === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      });
      setProducts(updatedProducts);
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      clientId: client.id,
      clientName: client.name,
      items: cart,
      total,
      status,
      date: new Date().toISOString(),
    };

    setOrders([...orders, newOrder]);
    setCart([]);
    setSelectedClientId("");
    setStatus("pendente");
    toast.success("Pedido finalizado com sucesso!");
  };

  return (
    <div className="p-4 space-y-4 pb-32">
      <h2>Novo Pedido</h2>

      <div>
        <label className="block mb-2">Cliente *</label>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
        >
          <option value="">Selecione um cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="mb-3">Adicionar Produtos</h3>
        <div className="space-y-3">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-4 py-3 bg-input-background rounded-lg border border-border"
          >
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - R$ {product.price.toFixed(2)} (Est: {product.stock})
              </option>
            ))}
          </select>

          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24 px-4 py-3 bg-input-background rounded-lg border border-border text-center"
              placeholder="Qtd"
            />
            <button
              onClick={addToCart}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3">Carrinho</h3>
        {cart.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Carrinho vazio</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="bg-card rounded-lg p-3 shadow-sm border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="flex-1">{item.productName}</h4>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 bg-muted rounded hover:bg-muted/80"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 bg-muted rounded hover:bg-muted/80"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      R$ {item.price.toFixed(2)} × {item.quantity}
                    </p>
                    <p className="text-green-600">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border shadow-lg p-4">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <span>Status do Pedido:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "pendente" | "concluido")}
              className="px-4 py-2 bg-input-background rounded-lg border border-border"
            >
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-lg">
            <span>Total:</span>
            <span className="text-green-600">R$ {total.toFixed(2)}</span>
          </div>

          <button
            onClick={finalizeOrder}
            disabled={cart.length === 0 || !selectedClientId}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-5 h-5" />
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}
