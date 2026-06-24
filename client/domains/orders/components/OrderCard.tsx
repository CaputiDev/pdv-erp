import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check, Trash2, ChevronDown, ChevronUp, Calendar } from "lucide-react-native";
import { Order } from "../types";

interface OrderCardProps {
  order: Order;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export function OrderCard({ order, onComplete, onDelete }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = () => {
    try {
      const dateObj = new Date(order.date);
      return dateObj.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return order.date;
    }
  };

  return (
    <View className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm mb-3">
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-2">
          <Text className="text-base font-bold text-foreground leading-5">
            {order.clientName}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Calendar className="text-muted-foreground" size={12} />
            <Text className="text-xs text-muted-foreground">{formattedDate()}</Text>
          </View>
        </View>

        {/* Badge */}
        <View className={`px-2.5 py-1 rounded-full ${
          order.status === "concluido" ? "bg-emerald-500/10" : "bg-amber-500/10"
        }`}>
          <Text className={`text-xs font-bold ${
            order.status === "concluido" ? "text-emerald-600" : "text-amber-600"
          }`}>
            {order.status === "concluido" ? "Concluído" : "Pendente"}
          </Text>
        </View>
      </View>

      {/* Summary Info */}
      <View className="flex-row justify-between items-center pt-2 border-t border-border/40">
        <View>
          <Text className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total do Pedido</Text>
          <Text className="text-lg font-extrabold text-emerald-600">R$ {order.total.toFixed(2)}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          {order.status === "pendente" && (
            <TouchableOpacity
              onPress={() => onComplete(order.id)}
              activeOpacity={0.7}
              className="p-2.5 bg-emerald-500/15 rounded-xl flex-row items-center gap-1"
            >
              <Check className="text-emerald-600" size={16} />
              <Text className="text-xs font-bold text-emerald-600">Concluir</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => onDelete(order.id)}
            activeOpacity={0.7}
            className="p-2.5 bg-destructive/10 rounded-xl"
          >
            <Trash2 className="text-destructive" size={16} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
            className="p-2.5 bg-muted/40 rounded-xl"
          >
            {expanded ? (
              <ChevronUp className="text-foreground" size={16} />
            ) : (
              <ChevronDown className="text-foreground" size={16} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible Details */}
      {expanded && (
        <View className="mt-4 pt-3 border-t border-border/40 gap-2.5">
          <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Produtos do Pedido ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <View key={idx} className="flex-row justify-between items-center bg-muted/20 p-3 rounded-2xl border border-border/30">
              <View className="flex-1 pr-2">
                <Text className="text-sm font-bold text-foreground leading-4">{item.productName}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  R$ {item.price.toFixed(2)} × {item.quantity}
                </Text>
              </View>
              <Text className="text-sm font-extrabold text-foreground">
                R$ {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
