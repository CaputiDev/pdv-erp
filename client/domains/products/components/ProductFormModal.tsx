import React, { useState, useEffect } from "react";
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import { X } from "lucide-react-native";
import { Product } from "../types";

interface ProductFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (productData: { name: string; price: number; stock: number; barcode: string; criticalStock: number }) => void;
  editingProduct: Product | null;
}

export function ProductFormModal({ 
  visible, 
  onClose, 
  onSubmit, 
  editingProduct 
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    barcode: "",
    criticalStock: "5",
  });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        price: editingProduct.price.toString(),
        stock: editingProduct.stock.toString(),
        barcode: editingProduct.barcode || "",
        criticalStock: editingProduct.criticalStock.toString(),
      });
    } else {
      setFormData({ name: "", price: "", stock: "", barcode: "", criticalStock: "5" });
    }
  }, [editingProduct, visible]);

  const handleClose = () => {
    setFormData({ name: "", price: "", stock: "", barcode: "", criticalStock: "5" });
    onClose();
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.price || !formData.stock) return;

    onSubmit({
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      barcode: formData.barcode.trim(),
      criticalStock: parseInt(formData.criticalStock || "5"),
    });
  };

  const isInvalid = !formData.name.trim() || !formData.price || !formData.stock;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View className="bg-card rounded-t-[32px] p-6 max-h-[85vh] border-t border-border shadow-2xl">
            {/* Drag Handle Indicator */}
            <View className="w-12 h-1 bg-muted rounded-full self-center mb-5 opacity-60" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-foreground">
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
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
              disabled={isInvalid}
              activeOpacity={0.7}
              className={`w-full py-4 rounded-xl items-center justify-center ${
                !isInvalid ? "bg-primary" : "bg-muted/80 opacity-50"
              }`}
            >
              <Text className="text-primary-foreground font-semibold text-base">
                {editingProduct ? "Salvar Alterações" : "Cadastrar Produto"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
