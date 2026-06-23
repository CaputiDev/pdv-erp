import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
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
      {/* Inline search filter */}
      <View className="flex-row items-center bg-muted/30 border border-border/80 rounded-xl px-3 py-2 mb-3">
        <TextInput
          placeholder="Buscar por nome..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-foreground text-sm py-0.5"
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(client) => client.id}
        ListEmptyComponent={<Text className="text-muted-foreground text-center py-6 text-sm">Nenhum cliente cadastrado</Text>}
        renderItem={({ item: client }) => (
          <TouchableOpacity
            onPress={() => handleSelect(client.id)}
            className="py-3 border-b border-border/60"
          >
            <Text className="text-sm font-semibold text-foreground">{client.name}</Text>
          </TouchableOpacity>
        )}
      />
    </BaseModal>
  );
}
