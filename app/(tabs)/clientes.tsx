import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity 
} from "react-native";
import { Plus, Search, User } from "lucide-react-native";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import Toast from "react-native-toast-message";
import { Client } from "../../domains/clients/types";
import { ClientCard } from "../../domains/clients/components/ClientCard";
import { ClientFormModal } from "../../domains/clients/components/ClientFormModal";

export default function Clients() {
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleSubmit = (clientData: Omit<Client, 'id'>) => {
    if (editingClient) {
      // Update existing client
      const updatedClients = clients.map((c) =>
        c.id === editingClient.id
          ? { ...c, ...clientData }
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
        id: Date.now().toString(),
        ...clientData
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
      <View className="flex-row items-center bg-card border border-border/80 rounded-2xl px-4 py-3 mb-4 shadow-sm">
        <Search className="text-muted-foreground mr-2" size={18} />
        <TextInput
          placeholder="Buscar por nome..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-foreground text-sm py-0.5"
        />
      </View>

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
          <ClientCard client={client} onEdit={handleEditClient} />
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
    </View>
  );
}
