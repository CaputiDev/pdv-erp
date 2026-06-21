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
import Toast from "react-native-toast-message";

interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  cpf: string;
}

const formatCPF = (text: string) => {
  const digits = text.replace(/\D/g, "");
  let formatted = digits;
  if (digits.length > 3) {
    formatted = `${digits.substring(0, 3)}.${digits.substring(3)}`;
  }
  if (digits.length > 6) {
    formatted = `${formatted.substring(0, 7)}.${digits.substring(6)}`;
  }
  if (digits.length > 9) {
    formatted = `${formatted.substring(0, 11)}-${digits.substring(9, 11)}`;
  }
  return formatted.substring(0, 14);
};

const formatPhone = (text: string) => {
  const digits = text.replace(/\D/g, "");
  let formatted = digits;
  if (digits.length > 0) {
    formatted = `(${digits}`;
  }
  if (digits.length > 2) {
    formatted = `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  }
  if (digits.length > 7) {
    formatted = `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7, 11)}`;
  }
  return formatted.substring(0, 15);
};

const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let checkDigit1 = 11 - (sum % 11);
  if (checkDigit1 >= 10) checkDigit1 = 0;
  if (parseInt(cleanCPF.charAt(9)) !== checkDigit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let checkDigit2 = 11 - (sum % 11);
  if (checkDigit2 >= 10) checkDigit2 = 0;
  if (parseInt(cleanCPF.charAt(10)) !== checkDigit2) return false;
  
  return true;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function Clients() {
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    cpf: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
  });

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "", phone: "", email: "", address: "", cpf: "" });
    setErrors({ name: "", cpf: "", phone: "", email: "" });
  };

  const handleSubmit = () => {
    const cleanName = formData.name.trim();
    const cleanPhone = formData.phone.trim();
    const cleanCPF = formData.cpf.trim();
    const cleanEmail = formData.email.trim();

    let hasError = false;
    const newErrors = { name: "", cpf: "", phone: "", email: "" };

    // Name Validation
    if (!cleanName) {
      newErrors.name = "Nome é obrigatório";
      hasError = true;
    }

    // CPF Validation
    if (!cleanCPF) {
      newErrors.cpf = "CPF é obrigatório";
      hasError = true;
    } else {
      const cpfDigits = cleanCPF.replace(/\D/g, "");
      if (!validateCPF(cpfDigits)) {
        newErrors.cpf = "CPF inválido";
        hasError = true;
      } else {
        const exists = clients.some(
          (client) => client.cpf && client.cpf.replace(/\D/g, "") === cpfDigits
        );
        if (exists) {
          newErrors.cpf = "CPF já cadastrado";
          hasError = true;
        }
      }
    }

    // Phone Validation
    if (!cleanPhone) {
      newErrors.phone = "Telefone é obrigatório";
      hasError = true;
    } else {
      const phoneDigits = cleanPhone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        newErrors.phone = "Telefone inválido (mínimo 10 dígitos)";
        hasError = true;
      }
    }

    // Email Validation
    if (cleanEmail) {
      if (!validateEmail(cleanEmail)) {
        newErrors.email = "E-mail inválido";
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      address: formData.address.trim(),
      cpf: cleanCPF,
    };

    setClients([...clients, newClient]);
    setFormData({ name: "", phone: "", email: "", address: "", cpf: "" });
    setErrors({ name: "", cpf: "", phone: "", email: "" });
    setShowModal(false);

    Toast.show({
      type: 'success',
      text1: 'Sucesso',
      text2: 'Cliente cadastrado com sucesso!'
    });
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
          <View className="bg-card rounded-2xl p-5 border border-border/80 shadow-sm mb-3">
            <View className="flex-row items-start gap-4">
              <View className="bg-primary/10 p-3 rounded-xl">
                <User className="text-primary" size={20} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-base font-bold text-foreground truncate">{client.name}</Text>
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
        )}
      />

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full shadow-lg items-center justify-center"
      >
        <Plus color="white" size={28} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 justify-end bg-black/60">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View className="bg-card rounded-t-[32px] p-6 max-h-[85vh] border-t border-border shadow-2xl">
              {/* Drag Handle Indicator */}
              <View className="w-12 h-1 bg-muted rounded-full self-center mb-5 opacity-60" />

              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-lg font-bold text-foreground">Novo Cliente</Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  activeOpacity={0.7}
                  className="p-1.5 bg-muted/40 rounded-full"
                >
                  <X className="text-foreground" size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                <View className="gap-4">
                  {/* Name field */}
                  <View>
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-sm font-semibold text-foreground">Nome *</Text>
                      {!!errors.name && (
                        <Text className="text-xs font-bold text-destructive">{errors.name}</Text>
                      )}
                    </View>
                    <TextInput
                      value={formData.name}
                      onChangeText={(text) => {
                        setFormData({ ...formData, name: text });
                        if (errors.name) setErrors({ ...errors, name: "" });
                      }}
                      placeholder="Nome completo"
                      placeholderTextColor="#94a3b8"
                      className={`px-4 py-3 bg-muted/30 text-foreground border rounded-xl text-sm ${
                        errors.name ? "border-destructive/80" : "border-border/80"
                      }`}
                    />
                  </View>

                  {/* CPF field */}
                  <View>
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-sm font-semibold text-foreground">CPF *</Text>
                      {!!errors.cpf && (
                        <Text className="text-xs font-bold text-destructive">{errors.cpf}</Text>
                      )}
                    </View>
                    <TextInput
                      value={formData.cpf}
                      onChangeText={(text) => {
                        setFormData({ ...formData, cpf: formatCPF(text) });
                        if (errors.cpf) setErrors({ ...errors, cpf: "" });
                      }}
                      placeholder="000.000.000-00"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      className={`px-4 py-3 bg-muted/30 text-foreground border rounded-xl text-sm font-mono ${
                        errors.cpf ? "border-destructive/80" : "border-border/80"
                      }`}
                    />
                  </View>

                  {/* Phone field */}
                  <View>
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-sm font-semibold text-foreground">Telefone *</Text>
                      {!!errors.phone && (
                        <Text className="text-xs font-bold text-destructive">{errors.phone}</Text>
                      )}
                    </View>
                    <TextInput
                      value={formData.phone}
                      onChangeText={(text) => {
                        setFormData({ ...formData, phone: formatPhone(text) });
                        if (errors.phone) setErrors({ ...errors, phone: "" });
                      }}
                      placeholder="(00) 00000-0000"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      className={`px-4 py-3 bg-muted/30 text-foreground border rounded-xl text-sm ${
                        errors.phone ? "border-destructive/80" : "border-border/80"
                      }`}
                    />
                  </View>

                  {/* Email field */}
                  <View>
                    <View className="flex-row justify-between items-center mb-1.5">
                      <Text className="text-sm font-semibold text-foreground">Email</Text>
                      {!!errors.email && (
                        <Text className="text-xs font-bold text-destructive">{errors.email}</Text>
                      )}
                    </View>
                    <TextInput
                      value={formData.email}
                      onChangeText={(text) => {
                        setFormData({ ...formData, email: text });
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      placeholder="email@exemplo.com"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className={`px-4 py-3 bg-muted/30 text-foreground border rounded-xl text-sm ${
                        errors.email ? "border-destructive/80" : "border-border/80"
                      }`}
                    />
                  </View>

                  {/* Address field */}
                  <View>
                    <Text className="text-sm font-semibold mb-1.5 text-foreground">Endereço</Text>
                    <TextInput
                      value={formData.address}
                      onChangeText={(text) => setFormData({ ...formData, address: text })}
                      placeholder="Endereço completo"
                      placeholderTextColor="#94a3b8"
                      multiline={true}
                      numberOfLines={3}
                      className="px-4 py-3 bg-muted/30 text-foreground border border-border/80 rounded-xl text-sm min-h-[80px] textAlignVertical-top"
                    />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={handleSubmit}
                activeOpacity={0.7}
                className="w-full py-4 rounded-xl items-center justify-center bg-primary"
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
