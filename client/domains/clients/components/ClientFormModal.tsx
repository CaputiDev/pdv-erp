import React, { useState, useEffect } from "react";
import { 
  Modal, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from "react-native";
import { X } from "lucide-react-native";
import { Client } from "../types";
import { formatCPF, formatPhone, validateCPF, validateEmail } from "../utils/validation";

interface ClientFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (clientData: { name: string; phone: string; email: string; address: string; cpf: string }) => void;
  editingClient: Client | null;
  clients: Client[];
}

export function ClientFormModal({ 
  visible, 
  onClose, 
  onSubmit, 
  editingClient, 
  clients 
}: ClientFormModalProps) {
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

  useEffect(() => {
    if (editingClient) {
      setFormData({
        name: editingClient.name,
        phone: editingClient.phone,
        email: editingClient.email,
        address: editingClient.address,
        cpf: editingClient.cpf,
      });
    } else {
      setFormData({ name: "", phone: "", email: "", address: "", cpf: "" });
    }
    setErrors({ name: "", cpf: "", phone: "", email: "" });
  }, [editingClient, visible]);

  const handleClose = () => {
    setFormData({ name: "", phone: "", email: "", address: "", cpf: "" });
    setErrors({ name: "", cpf: "", phone: "", email: "" });
    onClose();
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
          (client) => 
            (!editingClient || client.id !== editingClient.id) &&
            client.cpf && 
            client.cpf.replace(/\D/g, "") === cpfDigits
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

    onSubmit({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      address: formData.address.trim(),
      cpf: cleanCPF,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <View className="bg-card rounded-t-[32px] p-6 max-h-[85vh] border-t border-border shadow-2xl">
            {/* Drag Handle Indicator */}
            <View className="w-12 h-1 bg-muted rounded-full self-center mb-5 opacity-60" />

            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-foreground">
                {editingClient ? "Editar Cliente" : "Novo Cliente"}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
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
              <Text className="text-primary-foreground font-semibold text-base">
                {editingClient ? "Salvar Alterações" : "Cadastrar Cliente"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
