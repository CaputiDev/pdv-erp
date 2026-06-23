import { useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity 
} from "react-native";
import { Plus, Package } from "lucide-react-native";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import Toast from "react-native-toast-message";
import { Product } from "../../domains/products/types";
import { ProductCard } from "../../domains/products/components/ProductCard";
import { ProductFormModal } from "../../domains/products/components/ProductFormModal";

export default function Products() {
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = (productData: Omit<Product, 'id'>) => {
    if (editingProduct) {
      // Update product
      const updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...productData }
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
        ...productData
      };
      setProducts([...products, newProduct]);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Produto cadastrado com sucesso!'
      });
    }

    setEditingProduct(null);
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
        renderItem={({ item: product }) => (
          <ProductCard product={product} onEdit={handleEditProduct} />
        )}
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>

      <ProductFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingProduct={editingProduct}
      />
    </View>
  );
}
