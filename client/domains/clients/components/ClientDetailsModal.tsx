import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Phone, Mail, MapPin, Edit3, User } from "lucide-react-native";
import { BaseModal } from "../../../components/BaseModal";
import { Client } from "../types";

interface ClientDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: () => void;
}

export function ClientDetailsModal({ visible, onClose, client, onEdit }: ClientDetailsModalProps) {
  if (!client) return null;

  return (
    <BaseModal visible={visible} onClose={onClose} title="Detalhes do Cliente">
      <View className="py-2 gap-4">
        {/* Header/Name Section */}
        <View className="flex-row items-center gap-3 border-b border-border/45 pb-3">
          <View className="bg-primary/10 p-3 rounded-full">
            <User className="text-primary" size={24} />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-base font-bold text-foreground">{client.name}</Text>
            {!!client.cpf && (
              <Text className="text-xs font-semibold text-muted-foreground/80 mt-0.5">CPF: {client.cpf}</Text>
            )}
          </View>
        </View>

        {/* Details list */}
        <View className="gap-3 my-1">
          {!!client.phone ? (
            <View className="flex-row items-center gap-3">
              <View className="bg-muted/40 p-2 rounded-xl">
                <Phone className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-muted-foreground/60 font-semibold uppercase">Telefone</Text>
                <Text className="text-sm text-foreground font-medium">{client.phone}</Text>
              </View>
            </View>
          ) : (
            <Text className="text-xs text-muted-foreground/40 italic ml-1">Sem telefone cadastrado</Text>
          )}

          {!!client.email ? (
            <View className="flex-row items-center gap-3">
              <View className="bg-muted/40 p-2 rounded-xl">
                <Mail className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-muted-foreground/60 font-semibold uppercase">E-mail</Text>
                <Text className="text-sm text-foreground font-medium truncate">{client.email}</Text>
              </View>
            </View>
          ) : (
            <Text className="text-xs text-muted-foreground/40 italic ml-1">Sem e-mail cadastrado</Text>
          )}

          {!!client.address ? (
            <View className="flex-row items-center gap-3">
              <View className="bg-muted/40 p-2 rounded-xl">
                <MapPin className="text-muted-foreground" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-muted-foreground/60 font-semibold uppercase">Endereço</Text>
                <Text className="text-sm text-foreground font-medium">{client.address}</Text>
              </View>
            </View>
          ) : (
            <Text className="text-xs text-muted-foreground/40 italic ml-1">Sem endereço cadastrado</Text>
          )}
        </View>

        {/* Actions section */}
        <TouchableOpacity
          onPress={() => {
            onClose();
            onEdit();
          }}
          activeOpacity={0.7}
          className="flex-row items-center justify-center bg-primary py-3 rounded-2xl gap-2 mt-2 shadow-sm"
        >
          <Edit3 color="white" size={16} />
          <Text className="text-primary-foreground font-bold text-sm">Editar Cliente</Text>
        </TouchableOpacity>
      </View>
    </BaseModal>
  );
}
