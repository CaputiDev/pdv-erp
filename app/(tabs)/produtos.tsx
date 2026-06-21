import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import { Plus, Package, AlertTriangle, X, Edit } from "lucide-react-native";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import Toast from "react-native-toast-message";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  criticalStock: number;
}

export default function Products() {
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [showModal, setShowModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    barcode: "",
    criticalStock: "5",
  });

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      barcode: product.barcode || "",
      criticalStock: product.criticalStock.toString(),
    });
    setEditingProductId(product.id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "", price: "", stock: "", barcode: "", criticalStock: "5" });
    setEditingProductId(null);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.price || !formData.stock) return;

    if (editingProductId) {
      // Update product
      const updatedProducts = products.map((p) =>
        p.id === editingProductId
          ? {
              ...p,
              name: formData.name.trim(),
              price: parseFloat(formData.price),
              stock: parseInt(formData.stock),
              barcode: formData.barcode.trim(),
              criticalStock: parseInt(formData.criticalStock || "5"),
            }
          : p
      );
      setProducts(updatedProducts);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Produto atualizado com sucesso!'
      });
    } else {
      // Create product
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        barcode: formData.barcode.trim(),
        criticalStock: parseInt(formData.criticalStock || "5"),
      };
      setProducts([...products, newProduct]);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Produto cadastrado com sucesso!'
      });
    }

    setFormData({ name: "", price: "", stock: "", barcode: "", criticalStock: "5" });
    setEditingProductId(null);
    setShowModal(false);
  };

  return (
    <View className="flex-1 bg-background p-4 relative">
      <FlatList
        data={products}
        keyExtractor={(product) => product.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <View className="bg-muted/50 p-5 rounded-full mb-4">
              <Package className="text-muted-foreground/60" size={32} />
            </View>
            <Text className="text-muted-foreground text-sm font-semibold">Nenhum produto cadastrado</Text>
            <Text className="text-muted-foreground/60 text-xs mt-1">Cadastre novos produtos clicando no botão +</Text>
          </View>
        }
        renderItem={({ item: product }) => {
          const isLowStock = product.stock <= product.criticalStock;

          return (
            <View className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm mb-3">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center justify-between gap-2 flex-wrap mb-2">
                    <View className="flex-row items-center gap-2 flex-wrap flex-1">
                      <Text className="text-base font-bold text-foreground leading-5">{product.name}</Text>
                      {isLowStock && (
                        <View className="bg-destructive/10 px-2 py-0.5 rounded-lg flex-row items-center gap-1">
                          <AlertTriangle className="text-destructive" size={11} />
                          <Text className="text-[10px] text-destructive font-bold uppercase tracking-wider">Estoque Crítico</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleEditProduct(product)}
                      activeOpacity={0.7}
                      className="p-1.5 bg-muted/30 rounded-lg"
                    >
                      <Edit className="text-muted-foreground" size={14} />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center gap-6 mt-3">
                    <View>
                      <Text className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Preço</Text>
                      <Text className="text-base font-extrabold text-emerald-600 mt-1">
                        R$ {product.price.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Estoque</Text>
                      <Text className={`text-base font-extrabold mt-1 ${isLowStock ? "text-destructive" : "text-foreground"}`}>
                        {product.stock} un.
                      </Text>
                    </View>
                  </View>

                  {!!product.barcode && (
                    <Text className="text-[11px] text-muted-foreground/80 mt-3 font-mono">
                      Cód: {product.barcode}
                    </Text>
                  )}
                </View>

                <View className="bg-primary/10 p-3 rounded-xl">
                  <Package className="text-primary" size={20} />
                </View>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 justify-end bg-black/60">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="bg-card rounded-t-[32px] p-6 max-h-[85vh] border-t border-border shadow-2xl">
              {/* Drag Handle Indicator */}
              <View className="w-12 h-1 bg-muted rounded-full self-center mb-5 opacity-60" />

              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-lg font-bold text-foreground">
                  {editingProductId ? "Editar Produto" : "Novo Produto"}
                </Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  activeOpacity={0.7}
                  className="p-1.5 bg-muted/40 rounded-full"
                >
                  <X className="text-foreground" size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                <View className="gap-4">
                  <View>
                    <Text className="text-sm font-semibold mb-1.5 text-foreground">Nome do Produto *</Text>
                    <TextInput
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      placeholder="Nome do produto"
                      placeholderTextColor="#94a3b8"
                      className="px-4 py-3 bg-muted/30 text-foreground border border-border/80 rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold mb-1.5 text-foreground">Preço de Venda *</Text>
                    <TextInput
                      value={formData.price}
                      onChangeText={(text) => setFormData({ ...formData, price: text })}
                      placeholder="0.00"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                      className="px-4 py-3 bg-muted/30 text-foreground border border-border/80 rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold mb-1.5 text-foreground">Estoque Inicial *</Text>
                    <TextInput
                      value={formData.stock}
                      onChangeText={(text) => setFormData({ ...formData, stock: text })}
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      className="px-4 py-3 bg-muted/30 text-foreground border border-border/80 rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold mb-1.5 text-foreground">Nível Crítico de Estoque *</Text>
                    <TextInput
                      value={formData.criticalStock}
                      onChangeText={(text) => setFormData({ ...formData, criticalStock: text })}
                      placeholder="5"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      className="px-4 py-3 bg-muted/30 text-foreground border border-border/80 rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-semibold mb-1.5 text-foreground">Código de Barras</Text>
                    <TextInput
                      value={formData.barcode}
                      onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                      placeholder="000000000000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="default"
                      className="px-4 py-3 bg-muted/30 text-foreground border border-border/80 rounded-xl text-sm"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!formData.name.trim() || !formData.price || !formData.stock}
                activeOpacity={0.7}
                className={`w-full py-4 rounded-xl items-center justify-center ${
                  formData.name.trim() && formData.price && formData.stock ? "bg-primary" : "bg-muted/80 opacity-50"
                }`}
              >
                <Text className="text-primary-foreground font-semibold text-base">
                  {editingProductId ? "Salvar Alterações" : "Cadastrar Produto"}
                </Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
