import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Plus, ChevronDown } from "lucide-react-native";
import { Product } from "../../products/types";

interface AddProductSectionProps {
  selectedProduct?: Product;
  onPressSelect: () => void;
  quantity: number;
  onChangeQuantity: (quantity: number) => void;
  onAdd: () => void;
}

export function AddProductSection({
  selectedProduct,
  onPressSelect,
  quantity,
  onChangeQuantity,
  onAdd
}: AddProductSectionProps) {
  return (
    <View className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm gap-4">
      <Text className="text-base font-bold text-foreground">Adicionar Produtos</Text>
      <TouchableOpacity
        onPress={onPressSelect}
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
          onChangeText={(text) => onChangeQuantity(parseInt(text) || 1)}
          className="w-20 px-4 py-3.5 bg-muted/30 text-foreground border border-border/80 rounded-2xl text-center text-sm font-bold"
        />
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.7}
          className="flex-1 bg-primary py-3.5 rounded-2xl flex-row items-center justify-center gap-2"
        >
          <Plus color="white" size={18} />
          <Text className="text-primary-foreground font-bold text-sm">Adicionar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
