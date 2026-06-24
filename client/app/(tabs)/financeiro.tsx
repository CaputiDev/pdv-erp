import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSync } from '../../domains/sync/SyncContext';
import { Client } from '../../domains/clients/types';
import { Landmark, Users, TrendingUp, Award, Target, Save, CheckCircle } from 'lucide-react-native';
import { createMMKV } from 'react-native-mmkv';
import Toast from 'react-native-toast-message';

const storage = createMMKV();

export default function FinanceiroScreen() {
  const { clients, setClients, orders } = useSync();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Inputs
  const [creditLimit, setCreditLimit] = useState('');
  const [creditScore, setCreditScore] = useState('');
  
  // Metas de Venda
  const [salesGoal, setSalesGoal] = useState(() => {
    return storage.getString('pdv_sales_goal') || '10000';
  });
  const [goalInput, setGoalInput] = useState('');

  const handleUpdateCredit = (client: Client) => {
    const limit = parseFloat(creditLimit);
    const score = parseInt(creditScore);

    if (isNaN(limit) || limit < 0 || isNaN(score) || score < 0 || score > 1000) {
      Toast.show({
        type: 'error',
        text1: 'Análise de Crédito',
        text2: 'Valores de Score (0-1000) ou Limite inválidos.'
      });
      return;
    }

    const updated = clients.map(c => {
      if (c.id === client.id) {
        return { ...c, creditLimit: limit, creditScore: score, synced: false };
      }
      return c;
    });

    setClients(updated);
    setSelectedClient(null);
    setCreditLimit('');
    setCreditScore('');
    Toast.show({
      type: 'success',
      text1: 'Crédito Atualizado',
      text2: `Limite de R$ ${limit.toFixed(2)} definido para ${client.name}.`
    });
  };

  const handleSaveGoal = () => {
    const goalVal = parseFloat(goalInput);
    if (isNaN(goalVal) || goalVal <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Meta de Faturamento',
        text2: 'Digite um valor de meta válido.'
      });
      return;
    }

    storage.set('pdv_sales_goal', goalVal.toString());
    setSalesGoal(goalVal.toString());
    setGoalInput('');
    Toast.show({
      type: 'success',
      text1: 'Meta Definida',
      text2: `Nova meta corporativa: R$ ${goalVal.toFixed(2)}`
    });
  };

  // Cálculos Financeiros
  const completedOrders = orders.filter(o => o.status === 'concluido');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const goalNum = parseFloat(salesGoal) || 10000;
  const goalProgress = Math.min(100, (totalRevenue / goalNum) * 100);

  // Desempenho por vendedor
  const salespersonStats: { [key: string]: { name: string; total: number; count: number } } = {};
  completedOrders.forEach(o => {
    if (o.salespersonId) {
      if (!salespersonStats[o.salespersonId]) {
        salespersonStats[o.salespersonId] = {
          name: o.salespersonName || 'Vendedor',
          total: 0,
          count: 0
        };
      }
      salespersonStats[o.salespersonId].total += o.total;
      salespersonStats[o.salespersonId].count += 1;
    }
  });

  const salespersonList = Object.values(salespersonStats).sort((a, b) => b.total - a.total);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 20 }}>
      
      {/* 1. Resumo de Faturamento e Metas */}
      <View className="bg-card border border-border rounded-2xl p-5 gap-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="bg-primary/10 p-3 rounded-full">
              <Target color="#4f46e5" size={24} />
            </View>
            <View>
              <Text className="text-lg font-bold text-foreground">Metas e Faturamento</Text>
              <Text className="text-muted-foreground text-xs">Acompanhamento de receita concluída</Text>
            </View>
          </View>
        </View>

        {/* Faturamento e Progresso */}
        <View className="gap-2">
          <View className="flex-row justify-between text-xs font-semibold text-muted-foreground">
            <Text className="text-xs">Faturamento: R$ {totalRevenue.toFixed(2)}</Text>
            <Text className="text-xs">Meta: R$ {goalNum.toFixed(2)}</Text>
          </View>
          
          {/* Progress Bar */}
          <View className="h-3 bg-muted rounded-full overflow-hidden">
            <View 
              style={{ width: `${goalProgress}%` }} 
              className="h-full bg-primary rounded-full" 
            />
          </View>
          <Text className="text-[11px] text-right text-muted-foreground">{goalProgress.toFixed(1)}% alcançado</Text>
        </View>

        {/* Alterar Meta */}
        <View className="flex-row gap-2 border-t border-border/40 pt-3">
          <TextInput
            value={goalInput}
            onChangeText={setGoalInput}
            placeholder={`Alterar meta (Atual: R$ ${goalNum})`}
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            className="bg-muted px-4 py-2 rounded-xl border border-border text-foreground text-xs flex-grow h-10"
          />
          <TouchableOpacity
            onPress={handleSaveGoal}
            activeOpacity={0.8}
            className="bg-primary rounded-xl px-4 justify-center items-center h-10"
          >
            <Text className="text-white font-bold text-xs">Definir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Análise de Crédito de Clientes */}
      <View className="bg-card rounded-2xl p-5 border border-border/80 gap-3">
        <Text className="text-base font-bold text-foreground">Análise de Crédito dos Clientes</Text>

        {selectedClient ? (
          <View className="bg-muted/40 border border-primary/20 p-4 rounded-xl gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm font-bold text-foreground">Ajustando crédito: {selectedClient.name}</Text>
              <TouchableOpacity onPress={() => setSelectedClient(null)}>
                <Text className="text-xs text-primary font-bold">Cancelar</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1 gap-1.5">
                <Text className="text-[10px] text-muted-foreground uppercase font-bold">Limite de Crediário (R$)</Text>
                <TextInput
                  value={creditLimit}
                  onChangeText={setCreditLimit}
                  placeholder={`Atual: R$ ${selectedClient.creditLimit?.toFixed(2) || '0.00'}`}
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="bg-card px-3 py-2 rounded-lg border border-border text-foreground text-xs h-10"
                />
              </View>

              <View className="flex-1 gap-1.5">
                <Text className="text-[10px] text-muted-foreground uppercase font-bold">Score (0-1000)</Text>
                <TextInput
                  value={creditScore}
                  onChangeText={setCreditScore}
                  placeholder={`Atual: ${selectedClient.creditScore || '0'}`}
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="bg-card px-3 py-2 rounded-lg border border-border text-foreground text-xs h-10"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => handleUpdateCredit(selectedClient)}
              activeOpacity={0.8}
              className="bg-emerald-500 rounded-xl py-2.5 items-center flex-row justify-center gap-1.5 mt-1"
            >
              <CheckCircle color="white" size={14} />
              <Text className="text-white font-bold text-xs">Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-2 max-h-[220px] overflow-scroll">
            {clients.map(client => (
              <TouchableOpacity
                key={client.id}
                onPress={() => {
                  setSelectedClient(client);
                  setCreditLimit('');
                  setCreditScore('');
                }}
                className="flex-row justify-between items-center bg-muted/30 border border-border/40 p-3 rounded-xl"
              >
                <View className="gap-0.5">
                  <Text className="text-sm font-bold text-foreground">{client.name}</Text>
                  <Text className="text-[10px] text-muted-foreground">CPF: {client.cpf || 'Não cadastrado'}</Text>
                </View>

                <View className="items-end gap-1">
                  <Text className="text-[9px] text-muted-foreground font-semibold uppercase">Score / Limite</Text>
                  <Text className="text-xs font-bold text-foreground">
                    {client.creditScore || 0} pts - R$ {(client.creditLimit || 0).toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 3. Desempenho dos Vendedores */}
      <View className="bg-card rounded-2xl p-5 border border-border/80 gap-3">
        <View className="flex-row items-center gap-2 mb-1">
          <Award color="#4f46e5" size={20} />
          <Text className="text-base font-bold text-foreground">Performance de Vendedores</Text>
        </View>

        {salespersonList.length === 0 ? (
          <View className="py-6 items-center justify-center">
            <Users color="#9ca3af" size={24} className="opacity-55 mb-2" />
            <Text className="text-muted-foreground text-xs">Nenhuma venda concluída registrada.</Text>
          </View>
        ) : (
          <View className="gap-2">
            {salespersonList.map((salesperson, idx) => (
              <View 
                key={idx}
                className="flex-row items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/30"
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-primary/10 w-7 h-7 rounded-full items-center justify-center">
                    <Text className="text-primary text-xs font-bold">{idx + 1}º</Text>
                  </View>
                  <View>
                    <Text className="text-sm font-bold text-foreground">{salesperson.name}</Text>
                    <Text className="text-[10px] text-muted-foreground">{salesperson.count} vendas concluídas</Text>
                  </View>
                </View>

                <Text className="text-sm font-extrabold text-foreground">
                  R$ {salesperson.total.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

    </ScrollView>
  );
}
