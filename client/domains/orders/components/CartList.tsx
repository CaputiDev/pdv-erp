import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react-native";
import { CartItem } from "../types";

interface CartListProps {
  cart: CartItem[];
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
}

export function CartList({ cart, onRemove, onUpdateQuantity }: CartListProps) {
  return (
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
            <View key={item.productId} className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="flex-1 text-base font-bold text-foreground pr-2 leading-5">{item.productName}</Text>
                <TouchableOpacity
                  onPress={() => onRemove(item.productId)}
                  activeOpacity={0.7}
                  className="p-2 bg-destructive/10 rounded-xl"
                >
                  <Trash2 className="text-destructive" size={16} />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-1 bg-muted/40 rounded-xl p-1">
                  <TouchableOpacity
                    onPress={() => onUpdateQuantity(item.productId, -1)}
                    activeOpacity={0.7}
                    className="p-1.5 bg-card rounded-lg shadow-sm"
                  >
                    <Minus className="text-foreground" size={12} />
                  </TouchableOpacity>
                  <Text className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => onUpdateQuantity(item.productId, 1)}
                    activeOpacity={0.7}
                    className="p-1.5 bg-card rounded-lg shadow-sm"
                  >
                    <Plus className="text-foreground" size={12} />
                  </TouchableOpacity>
                </View>

                <View className="items-end">
                  <Text className="text-[10px] text-muted-foreground font-medium">R$ {item.price.toFixed(2)} × {item.quantity}</Text>
                  <Text className="text-base font-extrabold text-emerald-600 mt-0.5">R$ {(item.price * item.quantity).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
