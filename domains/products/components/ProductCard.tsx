import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Package, AlertTriangle, Edit } from "lucide-react-native";
import { Product } from "../types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
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
              onPress={() => onEdit(product)}
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
}
