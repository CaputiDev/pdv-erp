import { useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  Alert,
  Platform
} from "react-native";
import { Plus, User } from "lucide-react-native";
import { SearchAndFilters } from "../../components/SearchAndFilters";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import Toast from "react-native-toast-message";
import { Client } from "../../domains/clients/types";
import { ClientCard } from "../../domains/clients/components/ClientCard";
import { ClientFormModal } from "../../domains/clients/components/ClientFormModal";
import { ClientDetailsModal } from "../../domains/clients/components/ClientDetailsModal";
import { useSync } from "../../domains/sync/SyncContext";
import { generateUniqueUUID } from "../../utils/uuid";

export default function Clients() {
  const { clients, setClients } = useSync();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "telefone" | "email" | "endereco">("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedDetailClient, setSelectedDetailClient] = useState<Client | null>(null);

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      (client.cpf && client.cpf.replace(/\D/g, "").includes(search.replace(/\D/g, ""))) ||
      (client.phone && client.phone.replace(/\D/g, "").includes(search.replace(/\D/g, "")));

    if (filterType === "telefone") {
      return matchesSearch && !!client.phone;
    }
    if (filterType === "email") {
      return matchesSearch && !!client.email;
    }
    if (filterType === "endereco") {
      return matchesSearch && !!client.address;
    }
    return matchesSearch;
  });

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleSubmit = (clientData: Omit<Client, 'id' | 'creditLimit' | 'creditScore'>) => {
    if (editingClient) {
      // Update existing client
      const updatedClients = clients.map((c) =>
        c.id === editingClient.id
          ? { ...c, ...clientData, synced: false }
          : c
      );
      setClients(updatedClients);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Cliente atualizado com sucesso!'
      });
    } else {
      // Create new client
      const newClient: Client = {
        id: generateUniqueUUID(clients.map((c) => c.id)),
        ...clientData,
        creditLimit: 0,
        creditScore: 0,
        synced: false
      };
      setClients([...clients, newClient]);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Cliente cadastrado com sucesso!'
      });
    }
    setEditingClient(null);
    setShowModal(false);
  };

  return (
    <View className="flex-1 bg-background p-4 relative">
      <SearchAndFilters
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nome, CPF ou telefone..."
        filters={[
          { key: "todos", label: "Todos" },
          { key: "telefone", label: "Telefone" },
          { key: "email", label: "E-mail" },
          { key: "endereco", label: "Endereço" }
        ]}
        activeFilter={filterType}
        onFilterChange={setFilterType}
      />

      <FlatList
        data={filteredClients}
        keyExtractor={(client) => client.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-24">
            <View className="bg-muted/50 p-5 rounded-full mb-4">
              <User className="text-muted-foreground/60" size={32} />
            </View>
            <Text className="text-muted-foreground text-sm font-semibold">Nenhum cliente encontrado</Text>
            <Text className="text-muted-foreground/60 text-xs mt-1">Cadastre novos clientes clicando no botão +</Text>
          </View>
        }
        renderItem={({ item: client }) => (
          <ClientCard client={client} onPress={() => setSelectedDetailClient(client)} />
        )}
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>

      <ClientFormModal
        visible={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        editingClient={editingClient}
        clients={clients}
      />

      <ClientDetailsModal
        visible={selectedDetailClient !== null}
        onClose={() => setSelectedDetailClient(null)}
        client={selectedDetailClient}
        onEdit={() => {
          if (selectedDetailClient) {
            handleEditClient(selectedDetailClient);
          }
        }}
      />
    </View>
  );
}
