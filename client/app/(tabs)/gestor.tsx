import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Share } from 'react-native';
import { useAuth } from '../../domains/users/AuthContext';
import { useSync } from '../../domains/sync/SyncContext';
import { Role } from '../../domains/users/types';
import { Incident } from '../../domains/incidents/types';
import { Heart, FileText, AlertOctagon, TrendingUp, Users, DollarSign, Award, Download, Check } from 'lucide-react-native';
import { createMMKV } from 'react-native-mmkv';
import Toast from 'react-native-toast-message';

const storage = createMMKV();

export default function GestorPanel() {
  const { users, promoteUser, praiseUser, currentUser } = useAuth();
  const { orders } = useSync();

  // Estados locais
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [showIncModal, setShowIncModal] = useState(false);
  
  // Form de Incidente
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [incDescription, setIncDescription] = useState('');
  const [witnessName, setWitnessName] = useState('');

  // Promover Funcionário
  const [selectedPromoteEmpId, setSelectedPromoteEmpId] = useState('');
  const [newRole, setNewRole] = useState<Role>('vendedor');

  // Elogiar Funcionário
  const [selectedPraiseEmpId, setSelectedPraiseEmpId] = useState('');
  const [praiseTag, setPraiseTag] = useState('');

  const tagsList = ['Funcionário do Mês', 'Boa Comunicação', 'Esforçado', 'Pontual', 'Excelente Liderança'];

  useEffect(() => {
    const stored = storage.getString('pdv_incidents') || '[]';
    setIncidents(JSON.parse(stored));
  }, []);

  const handleRegisterIncident = () => {
    const employee = users.find(u => u.id === selectedEmpId);
    if (!employee || !incDescription.trim() || !witnessName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Novo Incidente',
        text2: 'Preencha todos os dados e selecione o funcionário.'
      });
      return;
    }

    const newIncident: Incident = {
      id: `incident-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      description: incDescription.trim(),
      date: new Date().toISOString(),
      signedBy: [currentUser?.name || 'Gestor', witnessName.trim()],
      documentRef: `ATA-${Date.now()}`
    };

    const updated = [newIncident, ...incidents];
    setIncidents(updated);
    storage.set('pdv_incidents', JSON.stringify(updated));

    setIncDescription('');
    setWitnessName('');
    setSelectedEmpId('');
    Toast.show({
      type: 'success',
      text1: 'Incidente Registrado',
      text2: 'Ata digital gerada e assinada com sucesso!'
    });
  };

  const handlePraise = () => {
    const employee = users.find(u => u.id === selectedPraiseEmpId);
    if (!employee || !praiseTag) {
      Toast.show({
        type: 'error',
        text1: 'Elogio de Funcionário',
        text2: 'Selecione o funcionário e a tag.'
      });
      return;
    }

    // Verificar se já tem o tag esse mês (Simulação local)
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const hasTagThisMonth = employee.tags.some(t => 
      t.tag === 'Funcionário do Mês' && t.date.slice(0, 7) === currentMonthStr
    );

    if (praiseTag === 'Funcionário do Mês' && hasTagThisMonth) {
      Toast.show({
        type: 'warning',
        text1: 'Limite de Elogio',
        text2: 'O limite do prêmio "Funcionário do Mês" é de 1 por mês por pessoa.'
      });
      return;
    }

    praiseUser(employee.id, praiseTag);
    setSelectedPraiseEmpId('');
    setPraiseTag('');
    Toast.show({
      type: 'success',
      text1: 'Elogio Registrado',
      text2: `Tag de "${praiseTag}" atribuída a ${employee.name}.`
    });
  };

  const handlePromote = () => {
    const employee = users.find(u => u.id === selectedPromoteEmpId);
    if (!employee || !newRole) {
      Toast.show({
        type: 'error',
        text1: 'Promoção',
        text2: 'Selecione o funcionário e a nova função.'
      });
      return;
    }

    promoteUser(employee.id, newRole);
    setSelectedPromoteEmpId('');
    Toast.show({
      type: 'success',
      text1: 'Promoção Efetuada',
      text2: `${employee.name} agora ocupa a função de ${newRole}.`
    });
  };

  const handleExportIncident = async (incident: Incident) => {
    const documentContent = `
=== ATA DE REGISTRO DE INCIDENTE ===
Identificação do Incidente: ${incident.documentRef}
Data do Evento: ${new Date(incident.date).toLocaleDateString()}
Colaborador Envolvido: ${incident.employeeName} (ID: ${incident.employeeId})

Descrição detalhada da Ocorrência:
${incident.description}

Documento assinado eletronicamente por:
${incident.signedBy.map(name => `- ${name}`).join('\n')}

Assinado em: ${new Date(incident.date).toLocaleString()}
===================================
    `;

    try {
      await Share.share({
        message: documentContent,
        title: `Ata de Ocorrência - ${incident.documentRef}`
      });
    } catch (e) {
      Toast.show({
        type: 'error',
        text1: 'Compartilhamento',
        text2: 'Não foi possível exportar a ata.'
      });
    }
  };

  // Métricas agregadas
  const completedOrders = orders.filter(o => o.status === 'concluido');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalSalaries = users.reduce((sum, u) => sum + u.salary, 0);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 20 }}>
      
      {/* 1. Visão Geral Executiva (Gestor Geral) */}
      <View className="bg-card rounded-2xl p-5 border border-border/80 gap-3">
        <Text className="text-base font-bold text-foreground">Relatório Geral Executivo</Text>
        
        <View className="flex-row justify-between gap-3 mt-1">
          <View className="bg-muted/40 p-4 rounded-xl border border-border/30 flex-1 gap-1">
            <TrendingUp color="#3b82f6" size={16} />
            <Text className="text-[10px] text-muted-foreground uppercase font-bold">Faturamento Total</Text>
            <Text className="text-sm font-extrabold text-foreground">R$ {totalRevenue.toFixed(2)}</Text>
          </View>
          
          <View className="bg-muted/40 p-4 rounded-xl border border-border/30 flex-1 gap-1">
            <DollarSign color="#10b981" size={16} />
            <Text className="text-[10px] text-muted-foreground uppercase font-bold">Folha de Salários</Text>
            <Text className="text-sm font-extrabold text-foreground">R$ {totalSalaries.toFixed(2)}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mt-1.5 bg-primary/5 p-3 rounded-xl border border-primary/10">
          <Users color="#4f46e5" size={16} />
          <Text className="text-xs text-muted-foreground">
            Total de Colaboradores Cadastrados: <Text className="font-bold text-foreground">{users.length} funcionários</Text>
          </Text>
        </View>
      </View>

      {/* 2. Gestão de Pessoas: Elogios e Promoções (Gestor RH) */}
      {currentUser?.role === 'gestor_rh' || currentUser?.role === 'admin' || currentUser?.role === 'gestor_geral' ? (
        <>
          {/* Elogiar */}
          <View className="bg-card rounded-2xl p-5 border border-border/80 gap-3">
            <View className="flex-row items-center gap-2">
              <Award color="#f59e0b" size={18} />
              <Text className="text-base font-bold text-foreground">Reconhecer Colaborador (Elogios)</Text>
            </View>

            <View className="gap-2">
              <Text className="text-xs text-muted-foreground">Selecione o Colaborador:</Text>
              <View className="flex-row flex-wrap gap-2">
                {users.map(u => (
                  <TouchableOpacity
                    key={u.id}
                    onPress={() => setSelectedPraiseEmpId(u.id)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      selectedPraiseEmpId === u.id ? 'bg-primary border-primary' : 'bg-muted border-border/60'
                    }`}
                  >
                    <Text className={`text-xs ${selectedPraiseEmpId === u.id ? 'text-white font-bold' : 'text-foreground'}`}>
                      {u.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-2 border-t border-border/40 pt-2">
              <Text className="text-xs text-muted-foreground">Selecione o Elogio/Tag:</Text>
              <View className="flex-row flex-wrap gap-2">
                {tagsList.map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setPraiseTag(t)}
                    className={`px-2.5 py-1.5 rounded-lg border ${
                      praiseTag === t ? 'bg-amber-500 border-amber-500' : 'bg-muted border-border/60'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${praiseTag === t ? 'text-white' : 'text-foreground'}`}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handlePraise}
              className="bg-primary py-2.5 rounded-xl justify-center items-center mt-2 flex-row gap-1"
            >
              <Heart color="white" size={14} />
              <Text className="text-white font-bold text-xs">Atribuir Reconhecimento</Text>
            </TouchableOpacity>
          </View>

          {/* Promoções */}
          <View className="bg-card rounded-2xl p-5 border border-border/80 gap-3">
            <Text className="text-base font-bold text-foreground">Alterações de Cargo (Promoções)</Text>

            <View className="gap-2">
              <Text className="text-xs text-muted-foreground">Selecionar Colaborador:</Text>
              <View className="flex-row flex-wrap gap-2">
                {users.map(u => (
                  <TouchableOpacity
                    key={u.id}
                    onPress={() => setSelectedPromoteEmpId(u.id)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      selectedPromoteEmpId === u.id ? 'bg-primary border-primary' : 'bg-muted border-border/60'
                    }`}
                  >
                    <Text className={`text-xs ${selectedPromoteEmpId === u.id ? 'text-white font-bold' : 'text-foreground'}`}>
                      {u.name} (Atual: {u.role})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-2 border-t border-border/40 pt-2">
              <Text className="text-xs text-muted-foreground">Nova Função:</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {['caixa', 'vendedor', 'financeiro', 'estoque', 'gestor_geral', 'gestor_rh'].map(r => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setNewRole(r as Role)}
                    className={`px-3 py-1 rounded-lg border ${
                      newRole === r ? 'bg-primary border-primary' : 'bg-muted border-border/60'
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${newRole === r ? 'text-white' : 'text-foreground'}`}>
                      {r.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={handlePromote}
              className="bg-primary py-2.5 rounded-xl justify-center items-center mt-2 flex-row gap-1"
            >
              <Check color="white" size={14} />
              <Text className="text-white font-bold text-xs">Confirmar Promoção</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      {/* 3. Incidentes e Atas Digitais (Gestor/RH) */}
      <View className="bg-card rounded-2xl p-5 border border-border/80 gap-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <AlertOctagon color="#ef4444" size={20} />
            <Text className="text-base font-bold text-foreground">Incidentes e Atas</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowIncModal(!showIncModal)}
            className="bg-muted px-3 py-1.5 rounded-lg border border-border"
          >
            <Text className="text-foreground text-xs font-bold">
              {showIncModal ? 'Ver Lista' : 'Registrar Ocorrência'}
            </Text>
          </TouchableOpacity>
        </View>

        {!showIncModal ? (
          /* Lista */
          <View className="gap-3">
            {incidents.length === 0 ? (
              <View className="py-6 items-center justify-center">
                <FileText color="#9ca3af" size={24} className="opacity-55 mb-2" />
                <Text className="text-muted-foreground text-xs">Sem ocorrências ou atas registradas.</Text>
              </View>
            ) : (
              <View className="gap-3">
                {incidents.map(inc => (
                  <View 
                    key={inc.id}
                    className="bg-muted/40 p-4 rounded-xl border border-border/40 gap-2"
                  >
                    <View className="flex-row justify-between items-start">
                      <View>
                        <Text className="text-sm font-bold text-foreground">{inc.employeeName}</Text>
                        <Text className="text-[10px] text-muted-foreground">Documento: {inc.documentRef}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleExportIncident(inc)}
                        className="bg-primary/10 p-2 rounded-lg"
                      >
                        <Download color="#4f46e5" size={14} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text className="text-xs text-foreground mt-1 leading-relaxed">
                      {inc.description}
                    </Text>

                    <View className="border-t border-border/40 pt-2 mt-1">
                      <Text className="text-[10px] font-bold text-muted-foreground">Assinado Digitalmente por:</Text>
                      <Text className="text-[10px] text-foreground font-semibold">
                        {inc.signedBy.join(' e ')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* Form de Registro */
          <View className="gap-3">
            <View className="gap-1.5">
              <Text className="text-xs text-muted-foreground font-semibold">Selecione o Colaborador Envolvido:</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {users.map(u => (
                  <TouchableOpacity
                    key={u.id}
                    onPress={() => setSelectedEmpId(u.id)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      selectedEmpId === u.id ? 'bg-primary border-primary' : 'bg-muted border-border/60'
                    }`}
                  >
                    <Text className={`text-xs ${selectedEmpId === u.id ? 'text-white font-bold' : 'text-foreground'}`}>
                      {u.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="text-xs text-muted-foreground font-semibold">Descrição do Incidente</Text>
              <TextInput
                value={incDescription}
                onChangeText={setIncDescription}
                placeholder="Detalhes sobre a ocorrência, atraso ou infração..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                className="bg-muted px-4 py-3 rounded-xl border border-border text-foreground text-xs leading-relaxed"
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-xs text-muted-foreground font-semibold">Nome do Testemunha / Envolvido adicional</Text>
              <TextInput
                value={witnessName}
                onChangeText={setWitnessName}
                placeholder="Ex: Carlos (Supervisor)"
                placeholderTextColor="#9ca3af"
                className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-xs h-10"
              />
            </View>

            <TouchableOpacity
              onPress={handleRegisterIncident}
              className="bg-red-500 py-3 rounded-xl justify-center items-center flex-row gap-1.5 mt-2"
            >
              <FileText color="white" size={16} />
              <Text className="text-white font-bold text-xs">Registrar Ata e Assinar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
