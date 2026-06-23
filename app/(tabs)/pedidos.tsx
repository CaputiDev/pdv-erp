import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  SafeAreaView,
  Alert
} from "react-native";
import { Plus, Minus, ShoppingCart, Trash2, Check, ChevronDown } from "lucide-react-native";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import Toast from "react-native-toast-message";
import { OrderCard, Order } from "../../components/OrderCard";
import { ClientSelectionModal, Client } from "../../components/ClientSelectionModal";
import { ProductSelectionModal, Product } from "../../components/ProductSelectionModal";

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export default function Orders() {
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* TAB SWITCHER */}
      <View className="flex-row mx-4 mt-4 bg-muted/40 p-1 rounded-2xl border border-border/80">
        {(["novo", "historico"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === tab ? "bg-card shadow-sm" : ""}`}
          >
            <Text className={`text-sm font-bold ${activeTab === tab ? "text-foreground" : "text-muted-foreground"}`}>
              {tab === "novo" ? "Novo Pedido" : "Histórico"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "novo" ? (
        <>
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 220, gap: 20 }}>
            {/* CLIENT SELECTOR */}
            <View>
              <Text className="text-sm font-semibold mb-1.5 text-foreground">Cliente *</Text>
              <TouchableOpacity
                onPress={() => setShowClientModal(true)}
                activeOpacity={0.7}
                className="px-4 py-3.5 bg-card border border-border/80 rounded-2xl flex-row justify-between items-center shadow-sm"
              >
                <Text className={`text-sm ${selectedClient ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {selectedClient ? selectedClient.name : "Selecione um cliente"}
                </Text>
                <ChevronDown className="text-muted-foreground" size={18} />
              </TouchableOpacity>
            </View>

            {/* ADD PRODUCT SECTION */}
            <View className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm gap-4">
              <Text className="text-base font-bold text-foreground">Adicionar Produtos</Text>
              <TouchableOpacity
                onPress={() => setShowProductModal(true)}
                activeOpacity={0.7}
                className="px-4 py-3.5 bg-muted/30 border border-border/80 rounded-2xl flex-row justify-between items-center"
              >
                <Text className={`text-sm ${selectedProduct ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {selectedProduct 
                    ? `${selectedProduct.name} - R$ ${selectedProduct.price.toFixed(2)} (Est: ${selectedProduct.stock})` 
                    : "Selecione um produto"}
                </Text>
                <ChevronDown className="text-muted-foreground" size={18} />
              </TouchableOpacity>

              <View className="flex-row gap-3">
                <TextInput
                  keyboardType="number-pad"
                  value={quantity.toString()}
                  onChangeText={(text) => setQuantity(parseInt(text) || 1)}
                  className="w-20 px-4 py-3.5 bg-muted/30 text-foreground border border-border/80 rounded-2xl text-center text-sm font-bold"
                />
                <TouchableOpacity
                  onPress={addToCart}
                  activeOpacity={0.7}
                  className="flex-1 bg-primary py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
                >
                  <Plus color="white" size={18} />
                  <Text className="text-primary-foreground font-bold text-sm">Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* SHOPPING CART */}
            <View>
              <Text className="text-base font-bold text-foreground mb-3">Carrinho</Text>
              {cart.length === 0 ? (
                <View className="items-center justify-center py-12 bg-card border border-border/80 rounded-3xl shadow-sm">
                  <ShoppingCart className="text-muted-foreground/60 mb-3" size={32} />
                  <Text className="text-muted-foreground text-sm font-semibold">Carrinho vazio</Text>
                </View>
              ) : (
                <View className="gap-3">
                  {cart.map((item) => (
                    <View key={item.productId} className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm">
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="flex-1 text-base font-bold text-foreground pr-2 leading-5">{item.productName}</Text>
                        <TouchableOpacity
                          onPress={() => removeFromCart(item.productId)}
                          activeOpacity={0.7}
                          className="p-2 bg-destructive/10 rounded-xl"
                        >
                          <Trash2 className="text-destructive" size={16} />
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1 bg-muted/40 rounded-xl p-1">
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.productId, -1)}
                            activeOpacity={0.7}
                            className="p-1.5 bg-card rounded-lg shadow-sm"
                          >
                            <Minus className="text-foreground" size={12} />
                          </TouchableOpacity>
                          <Text className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</Text>
                          <TouchableOpacity
                            onPress={() => updateQuantity(item.productId, 1)}
                            activeOpacity={0.7}
                            className="p-1.5 bg-card rounded-lg shadow-sm"
                          >
                            <Plus className="text-foreground" size={12} />
                          </TouchableOpacity>
                        </View>

                        <View className="items-end">
                          <Text className="text-[10px] text-muted-foreground font-medium">R$ {item.price.toFixed(2)} × {item.quantity}</Text>
                          <Text className="text-base font-extrabold text-emerald-600 mt-0.5">R$ {(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* FOOTER CHECKOUT */}
          <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border/80 shadow-2xl p-5">
            <View className="max-w-md mx-auto gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">Status do Pedido:</Text>
                <View className="flex-row bg-muted/30 border border-border/80 rounded-2xl p-1">
                  {(["pendente", "concluido"] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setStatus(s)}
                      activeOpacity={0.7}
                      className={`px-4 py-2 rounded-xl shadow-sm ${status === s ? "bg-primary" : ""}`}
                    >
                      <Text className={`text-xs font-bold ${status === s ? "text-primary-foreground" : "text-muted-foreground"}`}>
                        {s === "pendente" ? "Pendente" : "Concluído"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row items-center justify-between my-1">
                <Text className="text-base font-bold text-foreground">Total:</Text>
                <Text className="text-2xl font-extrabold text-emerald-600">R$ {total.toFixed(2)}</Text>
              </View>

              <TouchableOpacity
                onPress={finalizeOrder}
                disabled={cart.length === 0 || !selectedClientId}
                activeOpacity={0.7}
                className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
                  cart.length > 0 && selectedClientId ? "bg-primary shadow-lg" : "bg-muted/80 opacity-50"
                }`}
              >
                <Check color="white" size={20} />
                <Text className="text-primary-foreground font-bold text-base">Finalizar Pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        /* ORDER HISTORY LIST */
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20 bg-card border border-border/80 rounded-3xl shadow-sm">
              <ShoppingCart className="text-muted-foreground/60 mb-3" size={32} />
              <Text className="text-muted-foreground text-sm font-semibold">Nenhum pedido no histórico</Text>
            </View>
          }
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              onComplete={completeOrder}
              onDelete={deleteOrder}
            />
          )}
        />
      )}

      {/* SELECTION MODALS */}
      <ClientSelectionModal
        visible={showClientModal}
        onClose={() => setShowClientModal(false)}
        clients={clients}
        onSelect={(id) => setSelectedClientId(id)}
      />

      <ProductSelectionModal
        visible={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={products}
        onSelect={(id) => setSelectedProductId(id)}
      />
    </SafeAreaView>
  );
}
