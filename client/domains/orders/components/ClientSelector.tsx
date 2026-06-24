import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { Client } from "../../clients/types";

interface ClientSelectorProps {
  selectedClient?: Client;
  onPress: () => void;
}

export function ClientSelector({ selectedClient, onPress }: ClientSelectorProps) {
  return (
    <View>
      <Text className="text-sm font-semibold mb-1.5 text-foreground">Cliente *</Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="px-4 py-3.5 bg-card border border-border/80 rounded-2xl flex-row justify-between items-center shadow-sm"
      >
        <Text className={`text-sm ${selectedClient ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
          {selectedClient ? selectedClient.name : "Selecione um cliente"}
        </Text>
        <ChevronDown className="text-muted-foreground" size={18} />
      </TouchableOpacity>
    </View>
  );
}
