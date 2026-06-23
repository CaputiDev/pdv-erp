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
  disabled,
}: CheckoutFooterProps) {
  const formattedTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(total);

  return (
    <View 
      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
      className="bg-card border-t border-border/80 shadow-2xl px-4 pt-3 pb-6"
    >
      <View className="max-w-md mx-auto w-full gap-3">
        {/* Row com Status e Total */}
        <View className="flex-row items-center justify-between gap-4">
          
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

        {/* Botão de Finalizar */}
        <TouchableOpacity
          onPress={onFinalize}
          disabled={disabled}
          activeOpacity={0.7}
          className={`w-full py-3.5 rounded-2xl flex-row items-center justify-center gap-2 ${
            disabled 
              ? "bg-muted border border-border/50 opacity-60" 
              : "bg-primary shadow-md shadow-primary/20"
          }`}
        >
          <Check 
            size={18} 
            className={disabled ? "text-muted-foreground/60" : "text-primary-foreground"} 
          />
          <Text 
            className={`text-sm font-extrabold ${
              disabled ? "text-muted-foreground/60" : "text-primary-foreground"
            }`}
          >
            Finalizar Pedido
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}