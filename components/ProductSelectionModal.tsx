import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import { BaseModal } from "./BaseModal";

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  products: Product[];
  onSelect: (id: string) => void;
}

export function ProductSelectionModal({ visible, onClose, products, onSelect }: ProductSelectionModalProps) {
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearch("");
    onClose();
  };

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  return (
    <BaseModal visible={visible} onClose={handleClose} title="Selecionar Produto">
      {/* Inline search filter */}
      <View className="flex-row items-center bg-muted/30 border border-border/80 rounded-xl px-3 py-2 mb-3">
        <TextInput
          placeholder="Buscar por nome..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-foreground text-sm py-0.5"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(product) => product.id}
        ListEmptyComponent={<Text className="text-muted-foreground text-center py-6 text-sm">Nenhum produto cadastrado</Text>}
        renderItem={({ item: product }) => (
          <TouchableOpacity
            onPress={() => handleSelect(product.id)}
            className="py-3 border-b border-border/60 flex-row justify-between items-center"
          >
            <Text className="text-sm font-semibold text-foreground flex-1 pr-2">{product.name}</Text>
            <Text className="text-xs font-bold text-emerald-600">R$ {product.price.toFixed(2)}</Text>
          </TouchableOpacity>
        )}
      />
    </BaseModal>
  );
}
