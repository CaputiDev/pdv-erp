import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

// Removi as props onFinalize e disabled, já que o botão não estará mais aqui
interface CheckoutFooterProps {
  status: "pendente" | "concluido";
  onChangeStatus: (status: "pendente" | "concluido") => void;
  total: number;
}

export function CheckoutFooter({
  status,
  onChangeStatus,
  total,
}: CheckoutFooterProps) {
  const formattedTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(total);

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-border/80 shadow-2xl px-4 py-3">
      {/* Container principal flex-row em vez de column */}
      <View className="max-w-md mx-auto w-full flex-row items-center justify-between gap-4">
        
        {/* Switch Status selector */}
        <View className="flex-1">
          <View className="flex-row bg-muted/40 border border-border/80 rounded-xl p-1">
            {(["pendente", "concluido"] as const).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => onChangeStatus(s)}
                activeOpacity={0.7}
                className={`flex-1 py-1.5 rounded-lg items-center justify-center ${
                  status === s ? "bg-primary shadow-sm" : ""
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    status === s ? "text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s === "pendente" ? "Pendente" : "Concluído"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Total display */}
        <View className="items-end">
          <Text className="text-[9px] text-muted-foreground font-semibold uppercase">Total</Text>
          <Text className="text-base font-extrabold text-emerald-600 leading-5">
            {formattedTotal}
          </Text>
        </View>
        
      </View>
    </View>
  );
}