import { useState } from "react";
import { Alert, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { useLocalStorage } from "../../../hooks/useLocalStorage";
import { Client } from "../../clients/types";
import { Product } from "../../products/types";
import { Order, CartItem } from "../types";
import { generateUniqueUUID } from "../../../utils/uuid";

export function useOrdersManager() {
  const [clients] = useLocalStorage<Client[]>("clients", []);
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [orders, setOrders] = useLocalStorage<Order[]>("orders", []);

  const [activeTab, setActiveTab] = useState<"novo" | "historico">("novo");
  const [step, setStep] = useState<"cliente" | "produtos" | "revisao">("cliente");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState<"pendente" | "concluido">("pendente");

  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"todos" | "pendente" | "concluido">("todos");

  const resetOrder = () => {
    setCart([]);
    setSelectedClientId("");
    setQuantity("1");
    setStatus("pendente");
    setStep("cliente");
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch = order.clientName.toLowerCase().includes(historySearch.toLowerCase());
      return matchesSearch && (historyFilter === "todos" || order.status === historyFilter);
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const showConfirm = (title: string, message: string, confirmText: string, onConfirm: () => void) => {
    if (Platform.OS === "web") {
      if (window.confirm(message)) onConfirm();
    } else {
      Alert.alert(title, message, [
        { text: "Cancelar", style: "cancel" },
        { text: confirmText, style: "destructive", onPress: onConfirm }
      ]);
    }
  };

  const addToCart = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      Toast.show({ type: "error", text1: "Erro", text2: "Selecione um produto válido" });
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0 || qty > product.stock) {
      Toast.show({ type: "error", text1: "Erro", text2: qty <= 0 ? "Quantidade inválida" : "Estoque insuficiente" });
      return;
    }

    const existingItem = cart.find((item) => item.productId === selectedProductId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + qty;
      if (newQuantity > product.stock) {
        Toast.show({ type: "error", text1: "Erro", text2: "Quantidade total excede o estoque" });
        return;
      }
      setCart(cart.map((item) => item.productId === selectedProductId ? { ...item, quantity: newQuantity } : item));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, price: product.price, quantity: qty }]);
    }
    setSelectedProductId("");
    setQuantity("1");
    Toast.show({ type: "success", text1: "Sucesso", text2: "Produto adicionado ao carrinho" });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart(cart.map((item) => {
      if (item.productId !== productId) return item;
      const newQuantity = Math.max(1, item.quantity + delta);
      if (newQuantity > product.stock) {
        Toast.show({ type: "error", text1: "Erro", text2: "Quantidade excede o estoque" });
        return item;
      }
      return { ...item, quantity: newQuantity };
    }));
  };

  const finalizeOrder = () => {
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client || cart.length === 0) {
      Toast.show({ type: "error", text1: "Erro", text2: !client ? "Selecione um cliente" : "Adicione produtos ao carrinho" });
      return;
    }

    if (status === "concluido") {
      setProducts(products.map((p) => {
        const item = cart.find((i) => i.productId === p.id);
        return item ? { ...p, stock: p.stock - item.quantity } : p;
      }));
    }

    const newOrder: Order = {
      id: generateUniqueUUID(orders.map((o) => o.id)),
      clientId: client.id,
      clientName: client.name,
      items: cart,
      total,
      status,
      date: new Date().toISOString(),
    };

    setOrders([...orders, newOrder]);
    resetOrder();
    Toast.show({ type: "success", text1: "Sucesso", text2: "Pedido finalizado com sucesso!" });
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const insufficientStock = order.items.some((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      return !p || p.stock < item.quantity;
    });

    if (insufficientStock) {
      Toast.show({ type: "error", text1: "Erro ao concluir", text2: "Estoque insuficiente para um ou mais produtos" });
      return;
    }

    setProducts(products.map((p) => {
      const item = order.items.find((i) => i.productId === p.id);
      return item ? { ...p, stock: p.stock - item.quantity } : p;
    }));

    setOrders(orders.map((o) => o.id === orderId ? { ...o, status: "concluido" } : o));
    Toast.show({ type: "success", text1: "Sucesso", text2: "Pedido concluído com sucesso!" });
  };

  const deleteOrder = (orderId: string) => {
    showConfirm("Excluir Pedido", "Tem certeza que deseja excluir este pedido do histórico?", "Excluir", () => {
      setOrders(orders.filter((o) => o.id !== orderId));
      Toast.show({ type: "success", text1: "Sucesso", text2: "Pedido excluído com sucesso!" });
    });
  };

  const cancelOrder = () => {
    showConfirm("Cancelar Pedido", "Tem certeza que deseja cancelar este pedido? Todo o progresso será perdido.", "Confirmar Cancelamento", () => {
      resetOrder();
      Toast.show({ type: "info", text1: "Pedido cancelado" });
    });
  };

  return {
    clients,
    products,
    orders,
    filteredOrders,
    activeTab,
    setActiveTab,
    step,
    setStep,
    resetOrder,
    cancelOrder,
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
    historySearch,
    setHistorySearch,
    historyFilter,
    setHistoryFilter,
    addToCart,
    removeFromCart,
    updateQuantity,
    finalizeOrder,
    completeOrder,
    deleteOrder
  };
}
