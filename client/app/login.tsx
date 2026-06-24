import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../domains/users/AuthContext';
import { useRouter } from 'expo-router';
import { KeyRound, User } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campos Obrigatórios',
        text2: 'Preencha usuário e senha.'
      });
      return;
    }

    const success = login(username.trim(), password);
    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Bem-vindo!',
        text2: 'Login realizado com sucesso!'
      });
      // O useEffect no _layout redirecionará adequadamente, 
      // mas vamos forçar a navegação imediata para acelerar o feedback.
      // Buscamos novamente a sessão pelo AuthContext atualizado ou deixamos o layout cuidar.
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Erro de Autenticação',
        text2: 'Usuário ou senha incorretos.'
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
          {/* Logo / Header */}
          <View className="items-center mb-10">
            <View className="bg-primary/10 p-5 rounded-3xl mb-4">
              <KeyRound color="#4f46e5" size={40} />
            </View>
            <Text className="text-3xl font-extrabold text-foreground tracking-tight">PDV ERP</Text>
            <Text className="text-muted-foreground text-sm mt-1.5 text-center">
              Acesse sua conta para gerenciar vendas, estoque e finanças.
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4 gap-4">
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-muted-foreground">Nome de Usuário</Text>
              <View className="flex-row items-center bg-card rounded-xl border border-border/80 px-4 py-3">
                <User color="#6b7280" size={20} className="mr-3" />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="usuario"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 text-foreground text-sm"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-muted-foreground">Senha</Text>
              <View className="flex-row items-center bg-card rounded-xl border border-border/80 px-4 py-3">
                <KeyRound color="#6b7280" size={20} className="mr-3" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="senhasecreta"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  className="flex-1 text-foreground text-sm"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              activeOpacity={0.8}
              className="bg-primary rounded-xl py-3.5 items-center mt-4"
            >
              <Text className="text-white font-bold text-base">Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
