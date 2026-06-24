import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Client } from "../types";

interface ClientCardProps {
  client: Client;
  onPress: () => void;
}

export function ClientCard({ client, onPress }: ClientCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-card rounded-2xl p-4 border border-border/80 shadow-sm mb-3 flex-row items-center justify-between"
    >
      <View className="flex-1 min-w-0 pr-4">
        <Text className="text-sm font-bold text-foreground truncate">{client.name}</Text>
        {!!client.cpf && (
          <Text className="text-xs text-muted-foreground mt-1 font-semibold"> {client.cpf}</Text>
        )}
      </View>
      <ChevronRight className="text-muted-foreground/60" size={16} />
    </TouchableOpacity>
  );
}
