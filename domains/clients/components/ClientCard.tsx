import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { User, Phone, Mail, MapPin, Edit } from "lucide-react-native";
import { Client } from "../types";

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
  return (
    <View className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm mb-3">
      <View className="flex-row items-start gap-4">
        <View className="bg-primary/10 p-3 rounded-xl">
          <User className="text-primary" size={20} />
        </View>
        <View className="flex-1 min-w-0">
          <View className="flex-row justify-between items-start">
            <Text className="text-base font-bold text-foreground flex-1 pr-2 truncate">{client.name}</Text>
            <TouchableOpacity
              onPress={() => onEdit(client)}
              activeOpacity={0.7}
              className="p-1.5 bg-muted/30 rounded-lg"
            >
              <Edit className="text-muted-foreground" size={14} />
            </TouchableOpacity>
          </View>
          {!!client.cpf && (
            <Text className="text-xs text-muted-foreground/80 mt-1 font-semibold">CPF: {client.cpf}</Text>
          )}
          <View className="gap-2 mt-3">
            {!!client.phone && (
              <View className="flex-row items-center gap-2">
                <Phone className="text-muted-foreground" size={13} />
                <Text className="text-xs text-muted-foreground/80 font-medium">{client.phone}</Text>
              </View>
            )}
            {!!client.email && (
              <View className="flex-row items-center gap-2">
                <Mail className="text-muted-foreground" size={13} />
                <Text className="text-xs text-muted-foreground/80 font-medium truncate">{client.email}</Text>
              </View>
            )}
            {!!client.address && (
              <View className="flex-row items-center gap-2">
                <MapPin className="text-muted-foreground" size={13} />
                <Text className="text-xs text-muted-foreground/80 font-medium truncate">{client.address}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
