import { useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Platform
} from "react-native";
import { Plus, Package } from "lucide-react-native";
import { SearchAndFilters } from "../../components/SearchAndFilters";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import Toast from "react-native-toast-message";
import { Product } from "../../domains/products/types";
import { ProductCard } from "../../domains/products/components/ProductCard";
import { ProductFormModal } from "../../domains/products/components/ProductFormModal";
import { useSync } from "../../domains/sync/SyncContext";
import { generateUniqueUUID } from "../../utils/uuid";

export default function Products() {
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "critico" | "com_codigo">("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { backendUrl, connectionStatus, setDeletedProductIds } = useSync();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.barcode && product.barcode.includes(search));

    if (filterType === "critico") {
      return matchesSearch && product.stock <= product.criticalStock;
    }
    if (filterType === "com_codigo") {
      return matchesSearch && !!product.barcode && product.barcode.trim() !== "";
    }
    return matchesSearch;
  });

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (product: Product) => {
    const performDelete = async () => {
      // 1. Remover localmente
      const updatedProducts = products.filter((p) => p.id !== product.id);
      setProducts(updatedProducts);

      // 2. Se estava sincronizado, tratar backend
      if (product.synced) {
        if (connectionStatus === "online") {
          try {
            const deleteRes = await fetch(`${backendUrl}/produtos/${product.id}`, {
              method: "DELETE"
            });
            if (deleteRes.ok) {
              Toast.show({
                type: 'success',
                text1: 'Sucesso',
                text2: 'Produto excluído com sucesso!'
              });
              return;
            } else if (deleteRes.status === 400) {
              const errData = await deleteRes.json();
              Toast.show({
                type: 'error',
                text1: 'Não foi possível excluir',
                text2: errData.detail || 'Produto associado a pedidos no servidor.'
              });
              // Reverter a exclusão local para manter consistência
              setProducts([...products]);
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
        // Se falhou por rede ou estava offline, enfileirar exclusão
        setDeletedProductIds((prev) => [...prev, product.id]);
      }

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Produto excluído com sucesso!'
      });
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        "Excluir Produto",
        `Tem certeza que deseja excluir o produto "${product.name}"?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: performDelete }
        ]
      );
    }
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
        id: generateUniqueUUID(products.map((p) => p.id)),
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
      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nome ou código..."
        filters={[
          { key: "todos", label: "Todos" },
          { key: "critico", label: "Estoque Crítico" },
          { key: "com_codigo", label: "Com Código" }
        ]}
        activeFilter={filterType}
        onFilterChange={setFilterType}
      />

      <FlatList
        data={filteredProducts}
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
          <ProductCard product={product} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
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
