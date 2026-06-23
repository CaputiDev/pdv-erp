import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertTriangle, Edit } from "lucide-react-native";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  const isLowStock = product.stock <= product.criticalStock;

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(product.price);

  return (
    <View className="bg-card rounded-2xl p-4 border border-border/80 shadow-sm mb-3 flex-row items-center justify-between">
      <View className="flex-1 min-w-0 pr-4">
        <View className="flex-row items-center gap-2 flex-wrap mb-1">
          <Text className="text-sm font-bold text-foreground truncate">{product.name}</Text>
        </View>

        {/* Price & Stock info inline */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, width: "100%" }}>
          <View style={{ flex: 3, alignItems: "flex-start", justifyContent: "center" }}>
            <Text className="text-sm font-extrabold text-emerald-600 text-left">{formattedPrice}</Text>
          </View>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Text className={`text-xs font-bold text-center ${isLowStock ? "text-destructive" : "text-muted-foreground/80"}`}>
              {product.stock} un.
            </Text>
            {isLowStock && (
              <AlertTriangle className="text-destructive" size={12} />
            )}
          </View>
        </View>

        {!!product.barcode && (
          <Text className="text-[10px] text-muted-foreground/60 font-mono mt-2">
            Cód: {product.barcode}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={() => onEdit(product)}
        activeOpacity={0.7}
        className="p-2.5 bg-muted/40 rounded-xl"
      >
        <Edit className="text-muted-foreground" size={16} />
      </TouchableOpacity>
    </View>
  );
}
