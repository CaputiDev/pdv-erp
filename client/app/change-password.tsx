import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../domains/users/AuthContext';
import { useRouter } from 'expo-router';
import { ShieldAlert, KeyRound, LogOut, User as UserIcon } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function ChangePassword() {
  const { changePassword, logout, currentUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState(currentUser?.username || '');
  const router = useRouter();

  const handleChangePassword = () => {
    if (currentUser?.role === 'admin') {
      if (!newUsername.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Campo Obrigatório',
          text2: 'O nome de usuário é obrigatório para o administrador.'
        });
        return;
      }
      if (newUsername.trim().toLowerCase() === 'admin') {
        Toast.show({
          type: 'error',
          text1: 'Segurança',
          text2: 'Por segurança, o nome de usuário do admin não pode ser "admin".'
        });
        return;
      }
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
        text2: 'Preencha todos os campos.'
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Senha Fraca',
        text2: 'A nova senha deve ter no mínimo 6 caracteres.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Senhas Divergentes',
        text2: 'A confirmação de senha não coincide.'
      });
      return;
    }

    const success = changePassword(
      newPassword.trim(),
      currentUser?.role === 'admin' ? newUsername.trim() : undefined
    );
    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Credenciais Atualizadas',
        text2: 'Suas credenciais foram alteradas com sucesso!'
      });
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar as novas credenciais.'
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-background"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-8">
            <View className="bg-amber-500/10 p-5 rounded-3xl mb-4">
              <ShieldAlert color="#f59e0b" size={40} />
            </View>
            <Text className="text-2xl font-extrabold text-foreground tracking-tight text-center">
              Senha Temporária Detectada
            </Text>
            <Text className="text-muted-foreground text-sm mt-2 text-center max-w-[85%]">
              Olá, <Text className="font-semibold text-foreground">{currentUser?.name}</Text>. Por motivos de segurança, você precisa cadastrar uma nova senha pessoal antes de acessar o sistema.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 gap-4">
            {currentUser?.role === 'admin' && (
              <View className="gap-1.5">
                <Text className="text-sm font-semibold text-muted-foreground">Novo Nome de Usuário (Admin)</Text>
                <View className="flex-row items-center bg-card rounded-xl border border-border/80 px-4 py-3">
                  <UserIcon color="#6b7280" size={20} className="mr-3" />
                  <TextInput
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholder="Novo usuário (diferente de 'admin')"
                    placeholderTextColor="#9ca3af"
                    className="flex-1 text-foreground text-sm"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-muted-foreground">Nova Senha</Text>
              <View className="flex-row items-center bg-card rounded-xl border border-border/80 px-4 py-3">
                <KeyRound color="#6b7280" size={20} className="mr-3" />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Mínimo de 6 caracteres"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  className="flex-1 text-foreground text-sm"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-muted-foreground">Confirmar Nova Senha</Text>
              <View className="flex-row items-center bg-card rounded-xl border border-border/80 px-4 py-3">
                <KeyRound color="#6b7280" size={20} className="mr-3" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repita a nova senha"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  className="flex-1 text-foreground text-sm"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleChangePassword}
              activeOpacity={0.8}
              className="bg-primary rounded-xl py-3.5 items-center mt-4"
            >
              <Text className="text-white font-bold text-base">Salvar Nova Senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={logout}
              activeOpacity={0.7}
              className="flex-row items-center justify-center gap-2 py-3 mt-2"
            >
              <LogOut color="#ef4444" size={16} />
              <Text className="text-destructive font-bold text-sm">Voltar para Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
