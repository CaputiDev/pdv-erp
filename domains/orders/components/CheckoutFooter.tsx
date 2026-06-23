import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Check } from "lucide-react-native";

interface CheckoutFooterProps {
  status: "pendente" | "concluido";
  onChangeStatus: (status: "pendente" | "concluido") => void;
  total: number;
  onFinalize: () => void;
  disabled: boolean;
}

export function CheckoutFooter({
  status,
  onChangeStatus,
  total,
  onFinalize,
  disabled
}: CheckoutFooterProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border/80 shadow-2xl p-5">
      <View className="max-w-md mx-auto gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-semibold text-foreground">Status do Pedido:</Text>
          <View className="flex-row bg-muted/30 border border-border/80 rounded-2xl p-1">
            {(["pendente", "concluido"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => onChangeStatus(s)}
                activeOpacity={0.7}
                className={`px-4 py-2 rounded-xl shadow-sm ${status === s ? "bg-primary" : ""}`}
              >
                <Text className={`text-xs font-bold ${status === s ? "text-primary-foreground" : "text-muted-foreground"}`}>
                  {s === "pendente" ? "Pendente" : "Concluído"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="flex-row items-center justify-between my-1">
          <Text className="text-base font-bold text-foreground">Total:</Text>
          <Text className="text-2xl font-extrabold text-emerald-600">R$ {total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          onPress={onFinalize}
          disabled={disabled}
          activeOpacity={0.7}
          className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 ${
            !disabled ? "bg-primary shadow-lg" : "bg-muted/80 opacity-50"
          }`}
        >
          <Check color="white" size={20} />
          <Text className="text-primary-foreground font-bold text-base">Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
