import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import { Plus, Search, User, Phone, Mail, MapPin, X } from "lucide-react-native";
import { useLocalStorage } from "../../hooks/useLocalStorage";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
}

export default function Clients() {
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    
    const newClient: Client = {
      id: Date.now().toString(),
      ...formData,
    };
    setClients([...clients, newClient]);
    setFormData({ name: "", phone: "", email: "", address: "" });
    setShowModal(false);
  };

  return (
    <View className="flex-1 bg-background p-4 relative">
      <View className="flex-row items-center bg-card border border-border rounded-xl px-3 py-2.5 mb-4 shadow-sm">
        <Search className="text-muted-foreground mr-2" size={20} />
        <TextInput
          placeholder="Buscar por nome..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-foreground text-sm py-1"
        />
      </View>

      <FlatList
        data={filteredClients}
        keyExtractor={(client) => client.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="bg-muted/30 p-4 rounded-full mb-3">
              <User className="text-muted-foreground opacity-50" size={32} />
            </View>
            <Text className="text-muted-foreground text-sm font-medium">Nenhum cliente encontrado</Text>
          </View>
        }
        renderItem={({ item: client }) => (
          <View className="bg-card rounded-xl p-4 border border-border shadow-sm mb-3">
            <View className="flex-row items-start gap-3">
              <View className="bg-primary/10 p-2.5 rounded-full">
                <User className="text-primary" size={20} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-base font-bold text-foreground truncate">{client.name}</Text>
                <View className="gap-1.5 mt-2">
                  {!!client.phone && (
                    <View className="flex-row items-center gap-2">
                      <Phone className="text-muted-foreground" size={14} />
                      <Text className="text-xs text-muted-foreground">{client.phone}</Text>
                    </View>
                  )}
                  {!!client.email && (
                    <View className="flex-row items-center gap-2">
                      <Mail className="text-muted-foreground" size={14} />
                      <Text className="text-xs text-muted-foreground truncate">{client.email}</Text>
                    </View>
                  )}
                  {!!client.address && (
                    <View className="flex-row items-center gap-2">
                      <MapPin className="text-muted-foreground" size={14} />
                      <Text className="text-xs text-muted-foreground truncate">{client.address}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="bg-card rounded-t-3xl p-6 max-h-[85vh] border-t border-border shadow-2xl">
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-lg font-bold text-foreground">Novo Cliente</Text>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="p-1.5 bg-muted/40 rounded-full"
                >
                  <X className="text-foreground" size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                <View className="gap-4">
                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Nome *</Text>
                    <TextInput
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      placeholder="Nome completo"
                      placeholderTextColor="#94a3b8"
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Telefone</Text>
                    <TextInput
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                      placeholder="(00) 00000-0000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Email</Text>
                    <TextInput
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      placeholder="email@exemplo.com"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm"
                    />
                  </View>

                  <View>
                    <Text className="text-sm font-medium mb-1.5 text-foreground">Endereço</Text>
                    <TextInput
                      value={formData.address}
                      onChangeText={(text) => setFormData({ ...formData, address: text })}
                      placeholder="Endereço completo"
                      placeholderTextColor="#94a3b8"
                      multiline={true}
                      numberOfLines={3}
                      className="px-4 py-3 bg-muted/20 text-foreground border border-border rounded-xl text-sm min-h-[80px] textAlignVertical-top"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!formData.name.trim()}
                activeOpacity={0.8}
                className={`w-full py-4 rounded-xl items-center justify-center ${
                  formData.name.trim() ? "bg-primary" : "bg-muted/80 opacity-50"
                }`}
              >
                <Text className="text-primary-foreground font-semibold text-base">Cadastrar Cliente</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
