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
import { Plus, Package, AlertTriangle, X } from "lucide-react-native";
import { useLocalStorage } from "../../hooks/useLocalStorage";

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
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    barcode: "",
    criticalStock: "5",
  });

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.price || !formData.stock) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      barcode: formData.barcode,
      criticalStock: parseInt(formData.criticalStock || "5"),
    };
    setProducts([...products, newProduct]);
    setFormData({ name: "", price: "", stock: "", barcode: "", criticalStock: "5" });
    setShowModal(false);
  };

  return (
    <View className="flex-1 bg-background p-4 relative">
      <FlatList
        data={products}
        keyExtractor={(product) => product.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="bg-muted/30 p-4 rounded-full mb-3">
              <Package className="text-muted-foreground opacity-50" size={32} />
            </View>
            <Text className="text-muted-foreground text-sm font-medium">Nenhum produto cadastrado</Text>
          </View>
        }
        renderItem={({ item: product }) => {
          const isLowStock = product.stock <= product.criticalStock;

          return (
            <View 
              className={`bg-card rounded-xl p-4 border shadow-sm mb-3 ${
                isLowStock ? "border-destructive/40 bg-destructive/5" : "border-border"
              }`}
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center gap-2 flex-wrap">
                    <Text className="text-base font-bold text-foreground leading-5">{product.name}</Text>
                    {isLowStock && (
                      <View className="bg-destructive/10 px-1.5 py-0.5 rounded-md flex-row items-center gap-1">
                        <AlertTriangle className="text-destructive" size={10} />
                        <Text className="text-[10px] text-destructive font-bold uppercase">Estoque Crítico</Text>
                      </View>
                    )}
                  </View>

                  <View className="flex-row items-center gap-6 mt-3">
                    <View>
                      <Text className="text-[10px] text-muted-foreground uppercase font-medium">Preço</Text>
                      <Text className="text-base font-bold text-emerald-600 mt-0.5">
                        R$ {product.price.toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-[10px] text-muted-foreground uppercase font-medium">Estoque</Text>
                      <Text className={`text-base font-bold mt-0.5 ${isLowStock ? "text-destructive" : "text-foreground"}`}>
                        {product.stock} un.
                      </Text>
                    </View>
                  </View>

                  {!!product.barcode && (
                    <Text className="text-xs text-muted-foreground mt-3 font-mono">
                      Cód: {product.barcode}
                    </Text>
                  )}
                </View>

                <View className="bg-primary/10 p-2.5 rounded-full">
                  <Package className="text-primary" size={20} />
                </View>
              </View>
            </View>
          );
        }}
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="bg-card rounded-t-3xl p-6 max-h-[85vh] border-t border-border shadow-2xl">
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-lg font-bold text-foreground">Novo Produto</Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="p-1.5 bg-muted/40 rounded-full"
                >
                  <X className="text-foreground" size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                <View className="gap-4">
                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Nome do Produto *</Text>
                    <TextInput
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      placeholder="Nome do produto"
                      placeholderTextColor="#94a3b8"
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Preço de Venda *</Text>
                    <TextInput
                      value={formData.price}
                      onChangeText={(text) => setFormData({ ...formData, price: text })}
                      placeholder="0.00"
                      placeholderTextColor="#94a3b8"
                      keyboardType="decimal-pad"
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Estoque Inicial *</Text>
                    <TextInput
                      value={formData.stock}
                      onChangeText={(text) => setFormData({ ...formData, stock: text })}
                      placeholder="0"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Nível Crítico de Estoque *</Text>
                    <TextInput
                      value={formData.criticalStock}
                      onChangeText={(text) => setFormData({ ...formData, criticalStock: text })}
                      placeholder="5"
                      placeholderTextColor="#94a3b8"
                      keyboardType="number-pad"
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Código de Barras</Text>
                    <TextInput
                      value={formData.barcode}
                      onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                      placeholder="000000000000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="default"
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!formData.name.trim() || !formData.price || !formData.stock}
                activeOpacity={0.8}
                className={`w-full py-4 rounded-xl items-center justify-center ${
                  formData.name.trim() && formData.price && formData.stock ? "bg-primary" : "bg-muted/80 opacity-50"
                }`}
              >
                <Text className="text-primary-foreground font-semibold text-base">Cadastrar Produto</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
