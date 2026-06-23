import { useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { Client } from "../../clients/types";
import { Product } from "../../products/types";
import { Order, CartItem } from "../types";

export function useOrdersManager() {
  const [clients] = useLocalStorage<Client[]>("clients", []);
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [orders, setOrders] = useLocalStorage<Order[]>("orders", []);

  const [activeTab, setActiveTab] = useState<"novo" | "historico">("novo");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"pendente" | "concluido">("pendente");

  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = () => {
    if (!selectedProductId) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Selecione um produto' });
      return;
    }
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (quantity > product.stock) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Quantidade maior que o estoque disponível' });
      return;
    }

    const existingItem = cart.find((item) => item.productId === selectedProductId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Quantidade total excede o estoque' });
        return;
      }
      setCart(cart.map((item) => item.productId === selectedProductId ? { ...item, quantity: newQuantity } : item));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, price: product.price, quantity }]);
    }
    setSelectedProductId("");
    setQuantity(1);
    Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Produto adicionado ao carrinho' });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart(cart.map((item) => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        if (newQuantity > product.stock) {
          Toast.show({ type: 'error', text1: 'Erro', text2: 'Quantidade excede o estoque' });
          return item;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const finalizeOrder = () => {
    if (!selectedClientId || cart.length === 0) {
      Toast.show({ type: 'error', text1: 'Erro', text2: !selectedClientId ? 'Selecione um cliente' : 'Adicione produtos ao carrinho' });
      return;
    }
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) return;

    if (status === "concluido") {
      setProducts(products.map((p) => {
        const item = cart.find((i) => i.productId === p.id);
        return item ? { ...p, stock: p.stock - item.quantity } : p;
      }));
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
    Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Pedido finalizado com sucesso!' });
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let stockValid = true;
    const updatedProducts = products.map((p) => {
      const item = order.items.find((i) => i.productId === p.id);
      if (item) {
        if (p.stock < item.quantity) stockValid = false;
        return { ...p, stock: p.stock - item.quantity };
      }
      return p;
    });

    if (!stockValid) {
      Toast.show({ type: 'error', text1: 'Erro ao concluir', text2: 'Estoque insuficiente para um ou mais produtos' });
      return;
    }

    setProducts(updatedProducts);
    setOrders(orders.map((o) => o.id === orderId ? { ...o, status: "concluido" as const } : o));
    Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Pedido concluído com sucesso!' });
  };

  const deleteOrder = (orderId: string) => {
    Alert.alert("Excluir Pedido", "Tem certeza que deseja excluir este pedido do histórico?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          setOrders(orders.filter(o => o.id !== orderId));
          Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Pedido excluído com sucesso!' });
        }
      }
    ]);
  };

  return {
    clients,
    products,
    orders,
    activeTab,
    setActiveTab,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    selectedProduct,
    setSelectedProductId,
    cart,
    quantity,
    setQuantity,
    status,
    setStatus,
    showClientModal,
    setShowClientModal,
    showProductModal,
    setShowProductModal,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    finalizeOrder,
    completeOrder,
    deleteOrder
  };
}
