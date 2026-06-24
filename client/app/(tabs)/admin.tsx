import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../domains/users/AuthContext';
import { Role } from '../../domains/users/types';
import { User, Plus, ShieldCheck, DollarSign, Briefcase, Trash2 } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function AdminPanel() {
  const { users, createUser, currentUser, logout, deleteUser } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<Role>('vendedor');
  const [salary, setSalary] = useState('');
  const [tempPassResult, setTempPassResult] = useState<{ name: string; tempPass: string } | null>(null);

  const rolesList: { key: Role; label: string }[] = [
    { key: 'admin', label: 'Administrador' },
    { key: 'caixa', label: 'Caixa' },
    { key: 'vendedor', label: 'Vendedor' },
    { key: 'financeiro', label: 'Financeiro' },
    { key: 'estoque', label: 'Estoquista' },
    { key: 'gestor_geral', label: 'Gestor Geral' },
    { key: 'gestor_rh', label: 'Gestor RH' },
  ];

  const handleCreateUser = () => {
    if (!name.trim() || !username.trim() || !salary.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, preencha todos os campos!'
      });
      return;
    }

    const salNum = parseFloat(salary);
    if (isNaN(salNum) || salNum <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'O salário deve ser um número positivo!'
      });
      return;
    }

    const result = createUser(name.trim(), username.trim().toLowerCase(), role, salNum);
    if (result) {
      setTempPassResult({
        name: result.user.name,
        tempPass: result.tempPass
      });
      setName('');
      setUsername('');
      setSalary('');
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Funcionário cadastrado com sucesso!'
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 20 }}>
      {/* Header Info */}
      <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex-row items-center justify-between">
        <View>
          <Text className="text-foreground text-base font-bold">Admin: {currentUser?.name}</Text>
          <Text className="text-muted-foreground text-xs">Painel de Controle e Acessos</Text>
        </View>
        <TouchableOpacity 
          onPress={logout}
          className="bg-destructive/10 px-3 py-1.5 rounded-lg"
          activeOpacity={0.7}
        >
          <Text className="text-destructive text-xs font-bold">Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Novo Funcionário */}
      <View className="bg-card rounded-2xl p-5 border border-border/80 gap-4">
        <Text className="text-lg font-bold text-foreground">Cadastrar Novo Funcionário</Text>
        
        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-muted-foreground">Nome Completo</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: João Silva"
            placeholderTextColor="#9ca3af"
            className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-sm"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-muted-foreground">Nome de Usuário (Login)</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Ex: joao.silva"
            placeholderTextColor="#9ca3af"
            className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-sm"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-muted-foreground">Salário</Text>
          <TextInput
            value={salary}
            onChangeText={setSalary}
            placeholder="Ex: 2500"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-sm"
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-xs font-semibold text-muted-foreground">Função / Cargo</Text>
          <View className="flex-row flex-wrap gap-2 mt-1">
            {rolesList.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setRole(item.key)}
                activeOpacity={0.8}
                className={`px-3 py-2 rounded-xl border ${
                  role === item.key 
                    ? 'bg-primary border-primary' 
                    : 'bg-muted border-border'
                }`}
              >
                <Text className={`text-xs font-semibold ${
                  role === item.key ? 'text-white' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleCreateUser}
          activeOpacity={0.8}
          className="bg-primary rounded-xl py-3 items-center flex-row justify-center gap-2 mt-2"
        >
          <Plus color="white" size={16} />
          <Text className="text-white font-bold text-sm">Criar Funcionário</Text>
        </TouchableOpacity>

        {tempPassResult && (
          <View className="mt-4 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
            <Text className="text-emerald-500 font-bold text-xs">CONTA CRIADA COM SUCESSO!</Text>
            <Text className="text-foreground text-sm mt-1">
              Funcionário: <Text className="font-bold">{tempPassResult.name}</Text>
            </Text>
            <Text className="text-foreground text-sm mt-1.5">
              Senha Temporária de Acesso: <Text className="font-mono bg-card px-2 py-0.5 rounded border border-border font-bold text-base text-emerald-500">{tempPassResult.tempPass}</Text>
            </Text>
            <Text className="text-muted-foreground text-xs mt-2 italic">
              Solicite ao usuário que mude a senha no primeiro acesso.
            </Text>
          </View>
        )}
      </View>

      {/* Lista de Funcionários */}
      <View className="bg-card rounded-2xl p-5 border border-border/80 gap-3">
        <Text className="text-lg font-bold text-foreground">Lista de Funcionários ({users.length})</Text>
        
        <View className="gap-2">
          {users.map((item) => (
            <View 
              key={item.id}
              className="bg-muted/50 p-4 rounded-xl border border-border/40 flex-row justify-between items-center"
            >
              <View className="gap-1 flex-1 mr-2">
                <View className="flex-row items-center gap-1.5">
                  <User color="#6b7280" size={14} />
                  <Text className="text-foreground font-bold text-sm">{item.name}</Text>
                  {item.isTempPassword && (
                    <Text className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
                      Temp Pass
                    </Text>
                  )}
                </View>
                <Text className="text-muted-foreground text-xs">@{item.username}</Text>
                
                <View className="flex-row items-center gap-3 mt-1.5">
                  <View className="flex-row items-center gap-1">
                    <Briefcase color="#9ca3af" size={12} />
                    <Text className="text-muted-foreground text-[11px] font-medium uppercase">{item.role}</Text>
                  </View>
                  <View className="flex-row items-center gap-0.5">
                    <DollarSign color="#9ca3af" size={12} />
                    <Text className="text-muted-foreground text-[11px] font-medium">R$ {item.salary.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              {item.id !== currentUser?.id ? (
                <TouchableOpacity 
                  onPress={() => deleteUser(item.id)}
                  className="bg-destructive/10 p-2.5 rounded-xl border border-destructive/20"
                  activeOpacity={0.7}
                >
                  <Trash2 color="#ef4444" size={16} />
                </TouchableOpacity>
              ) : (
                <View className="bg-card p-2.5 rounded-xl border border-border/40">
                  <ShieldCheck color="#10b981" size={16} />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
