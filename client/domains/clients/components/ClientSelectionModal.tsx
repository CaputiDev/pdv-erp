import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import { Search, XCircle, SearchX } from "lucide-react-native";
import { BaseModal } from "../../../components/BaseModal";
import { Client } from "../types";

interface ClientSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  clients: Client[];
  onSelect: (id: string) => void;
}

export function ClientSelectionModal({ visible, onClose, clients, onSelect }: ClientSelectionModalProps) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearch("");
    onClose();
  };

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  return (
    <BaseModal visible={visible} onClose={handleClose} title="Selecionar Cliente">
      
      {/* Search Input Melhorado */}
      <View className="flex-row items-center bg-muted/40 border border-border/80 rounded-2xl px-4 py-3 mb-4">
        <Search size={18} className="text-muted-foreground mr-2" />
        <TextInput
          placeholder="Buscar por nome..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-foreground text-sm font-medium"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7} className="p-1">
            <XCircle size={18} className="text-muted-foreground" />
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de Clientes */}
      <FlatList
        data={filtered}
        keyExtractor={(client) => client.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        // Empty State Melhorado
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <SearchX size={40} className="text-muted-foreground/50 mb-3" />
            <Text className="text-sm font-bold text-foreground">
              {search.length > 0 ? "Nenhum resultado" : "Nenhum cliente"}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1 text-center">
              {search.length > 0 
                ? `Não encontramos "${search}"` 
                : "Não há clientes cadastrados."}
            </Text>
          </View>
        }
        // Itens da Lista Melhorados (Cards)
        renderItem={({ item: client }) => (
          <TouchableOpacity
            onPress={() => handleSelect(client.id)}
            activeOpacity={0.7}
            className="flex-row items-center p-3 mb-2 bg-card border border-border/50 rounded-2xl"
          >
            <View className="flex-1 pr-2">
              <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                {client.name}
              </Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                <Text className="font-medium text-foreground">{client.cpf || "Não informado"}</Text>
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </BaseModal>
  );
}
