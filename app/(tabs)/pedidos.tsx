import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  ScrollView, 
  SafeAreaView 
} from "react-native";
import { Plus, Minus, ShoppingCart, Trash2, Check, ChevronDown, X } from "lucide-react-native";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import Toast from "react-native-toast-message";

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

  const [showClientModal, setShowClientModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  const [clientSearch, setClientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = () => {
    if (!selectedProductId) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Selecione um produto'
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    if (quantity > product.stock) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Quantidade maior que o estoque disponível'
      });
      return;
    }

    const existingItem = cart.find((item) => item.productId === selectedProductId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Quantidade total excede o estoque'
        });
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
    Toast.show({
      type: 'success',
      text1: 'Sucesso',
      text2: 'Produto adicionado ao carrinho'
    });
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
            Toast.show({
              type: 'error',
              text1: 'Erro',
              text2: 'Quantidade excede o estoque'
            });
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
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Selecione um cliente'
      });
      return;
    }

    if (cart.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Adicione produtos ao carrinho'
      });
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
    Toast.show({
      type: 'success',
      text1: 'Sucesso',
      text2: 'Pedido finalizado com sucesso!'
    });
  };
  return (
    <SafeAreaView className="flex-1 bg-background">
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
          
          <View>
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
          </View>

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
                <View
                  key={item.productId}
                  className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="flex-1 text-base font-bold text-foreground pr-2 leading-5">
                      {item.productName}
                    </Text>
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
                      <Text className="w-8 text-center text-sm font-bold text-foreground">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.productId, 1)}
                        activeOpacity={0.7}
                        className="p-1.5 bg-card rounded-lg shadow-sm"
                      >
                        <Plus className="text-foreground" size={12} />
                      </TouchableOpacity>
                    </View>

                    <View className="items-end">
                      <Text className="text-[10px] text-muted-foreground font-medium">
                        R$ {item.price.toFixed(2)} × {item.quantity}
                      </Text>
                      <Text className="text-base font-extrabold text-emerald-600 mt-0.5">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </Text>
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
              <TouchableOpacity
                onPress={() => setStatus("pendente")}
                activeOpacity={0.7}
                className={`px-4 py-2 rounded-xl shadow-sm ${status === "pendente" ? "bg-primary" : ""}`}
              >
                <Text className={`text-xs font-bold ${status === "pendente" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  Pendente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatus("concluido")}
                activeOpacity={0.7}
                className={`px-4 py-2 rounded-xl shadow-sm ${status === "concluido" ? "bg-primary" : ""}`}
              >
                <Text className={`text-xs font-bold ${status === "concluido" ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  Concluído
                </Text>
              </TouchableOpacity>
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

      {/* CLIENT SELECTION MODAL */}
      <Modal
        visible={showClientModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => { setShowClientModal(false); setClientSearch(""); }}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-5">
          <View className="bg-card w-full max-h-[70vh] rounded-3xl border border-border shadow-2xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold text-foreground">Selecionar Cliente</Text>
              <TouchableOpacity onPress={() => { setShowClientModal(false); setClientSearch(""); }} className="p-1.5 bg-muted/40 rounded-full">
                <X className="text-foreground" size={16} />
              </TouchableOpacity>
            </View>
            
            {/* Inline search filter */}
            <View className="flex-row items-center bg-muted/30 border border-border/80 rounded-xl px-3 py-2 mb-3">
              <TextInput
                placeholder="Buscar por nome..."
                placeholderTextColor="#94a3b8"
                value={clientSearch}
                onChangeText={setClientSearch}
                className="flex-1 text-foreground text-sm py-0.5"
              />
            </View>

            <FlatList
              data={filteredClients}
              keyExtractor={(client) => client.id}
              ListEmptyComponent={<Text className="text-muted-foreground text-center py-6 text-sm">Nenhum cliente cadastrado</Text>}
              renderItem={({ item: client }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedClientId(client.id);
                    setClientSearch("");
                    setShowClientModal(false);
                  }}
                  className="py-3 border-b border-border/60"
                >
                  <Text className="text-sm font-semibold text-foreground">{client.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* PRODUCT SELECTION MODAL */}
      <Modal
        visible={showProductModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => { setShowProductModal(false); setProductSearch(""); }}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-5">
          <View className="bg-card w-full max-h-[70vh] rounded-3xl border border-border shadow-2xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-bold text-foreground">Selecionar Produto</Text>
              <TouchableOpacity onPress={() => { setShowProductModal(false); setProductSearch(""); }} className="p-1.5 bg-muted/40 rounded-full">
                <X className="text-foreground" size={16} />
              </TouchableOpacity>
            </View>

            {/* Inline search filter */}
            <View className="flex-row items-center bg-muted/30 border border-border/80 rounded-xl px-3 py-2 mb-3">
              <TextInput
                placeholder="Buscar por nome..."
                placeholderTextColor="#94a3b8"
                value={productSearch}
                onChangeText={setProductSearch}
                className="flex-1 text-foreground text-sm py-0.5"
              />
            </View>

            <FlatList
              data={filteredProducts}
              keyExtractor={(product) => product.id}
              ListEmptyComponent={<Text className="text-muted-foreground text-center py-6 text-sm">Nenhum produto cadastrado</Text>}
              renderItem={({ item: product }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedProductId(product.id);
                    setProductSearch("");
                    setShowProductModal(false);
                  }}
                  className="py-3 border-b border-border/60 flex-row justify-between items-center"
                >
                  <Text className="text-sm font-semibold text-foreground flex-1 pr-2">{product.name}</Text>
                  <Text className="text-xs font-bold text-emerald-600">R$ {product.price.toFixed(2)}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
