import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useAuth } from '../../domains/users/AuthContext';
import { useSync } from '../../domains/sync/SyncContext';
import { CaixaSession, CaixaTransaction } from '../../domains/sessions/types';
import { Order } from '../../domains/orders/types';
import { createMMKV } from 'react-native-mmkv';
import { DollarSign, Wallet, Printer, Landmark, ShoppingBag, CheckCircle, FileText, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

const storage = createMMKV();

export default function CaixaScreen() {
  const { currentUser } = useAuth();
  const { orders, setOrders, products, setProducts } = useSync();
  const [session, setSession] = useState<CaixaSession | null>(null);
  
  // Modals e Inputs
  const [openingBalance, setOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Carregar sessão ativa do MMKV
  useEffect(() => {
    const activeSessionStr = storage.getString('pdv_active_caixa_session');
    if (activeSessionStr) {
      setSession(JSON.parse(activeSessionStr));
    }
  }, []);

  const handleOpenCaixa = () => {
    const val = parseFloat(openingBalance);
    if (isNaN(val) || val < 0) {
      Toast.show({
        type: 'error',
        text1: 'Abertura de Caixa',
        text2: 'Saldo inicial inválido.'
      });
      return;
    }

    const newSession: CaixaSession = {
      id: `session-${Date.now()}`,
      openedBy: currentUser?.username || 'unknown',
      openedAt: new Date().toISOString(),
      initialCash: val,
      status: 'open',
      transactions: []
    };

    setSession(newSession);
    storage.set('pdv_active_caixa_session', JSON.stringify(newSession));
    setOpeningBalance('');
    Toast.show({
      type: 'success',
      text1: 'Caixa Aberto',
      text2: `Abertura efetuada com R$ ${val.toFixed(2)}`
    });
  };

  const handleCloseCaixa = () => {
    if (!session) return;
    const finalVal = parseFloat(closingBalance);
    if (isNaN(finalVal) || finalVal < 0) {
      Toast.show({
        type: 'error',
        text1: 'Fechamento de Caixa',
        text2: 'Saldo final inválido.'
      });
      return;
    }

    const closedSession: CaixaSession = {
      ...session,
      closedAt: new Date().toISOString(),
      finalCash: finalVal,
      status: 'closed'
    };

    // Salvar na lista de histórico de sessões do MMKV
    const pastSessionsStr = storage.getString('pdv_past_caixa_sessions') || '[]';
    const pastSessions: CaixaSession[] = JSON.parse(pastSessionsStr);
    pastSessions.unshift(closedSession);
    storage.set('pdv_past_caixa_sessions', JSON.stringify(pastSessions));

    // Limpar caixa ativo
    setSession(null);
    if (typeof storage.remove === 'function') {
      storage.remove('pdv_active_caixa_session');
    } else if (typeof (storage as any).delete === 'function') {
      (storage as any).delete('pdv_active_caixa_session');
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('pdv_active_caixa_session');
    }
    setClosingBalance('');
    Toast.show({
      type: 'success',
      text1: 'Caixa Fechado',
      text2: `Diferença calculada com sucesso!`
    });
  };

  const handleConfirmPayment = (order: Order) => {
    if (!session) {
      Toast.show({
        type: 'warning',
        text1: 'Caixa Fechado',
        text2: 'Abra o caixa antes de receber pagamentos.'
      });
      return;
    }

    // Processar pagamento: mudar status do pedido
    const updatedOrders = orders.map(o => {
      if (o.id === order.id) {
        return { ...o, status: 'concluido' as const, synced: false };
      }
      return o;
    });
    setOrders(updatedOrders);

    // Baixa de estoque nos produtos correspondentes
    const updatedProducts = products.map(p => {
      const cartItem = order.items.find(item => item.productId === p.id);
      if (cartItem) {
        const newStock = Math.max(0, p.stock - cartItem.quantity);
        return { ...p, stock: newStock, synced: false };
      }
      return p;
    });
    setProducts(updatedProducts);

    // Adicionar transação ao CaixaSession ativo
    const newTransaction: CaixaTransaction = {
      orderId: order.id,
      value: order.total,
      timestamp: new Date().toISOString()
    };

    const updatedSession: CaixaSession = {
      ...session,
      transactions: [...session.transactions, newTransaction]
    };
    setSession(updatedSession);
    storage.set('pdv_active_caixa_session', JSON.stringify(updatedSession));

    Toast.show({
      type: 'success',
      text1: 'Pagamento Concluído',
      text2: `Pedido de ${order.clientName} finalizado!`
    });

    // Abrir nota fiscal automaticamente
    setSelectedOrderForInvoice({ ...order, status: 'concluido' });
    setShowInvoiceModal(true);
  };

  const pendingOrders = orders.filter(o => o.status === 'pendente');
  const sessionTotalRevenue = session ? session.transactions.reduce((sum, t) => sum + t.value, 0) : 0;
  const expectedCash = session ? session.initialCash + sessionTotalRevenue : 0;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 20 }}>
      {/* 1. Estado da Sessão de Caixa */}
      {!session ? (
        <View className="bg-card border border-border rounded-2xl p-5 gap-4">
          <View className="flex-row items-center gap-3">
            <View className="bg-destructive/10 p-3 rounded-full">
              <Landmark color="#ef4444" size={24} />
            </View>
            <View>
              <Text className="text-lg font-bold text-foreground">Caixa Fechado</Text>
              <Text className="text-muted-foreground text-xs">Abra uma nova sessão de caixa para operar</Text>
            </View>
          </View>
          
          <View className="gap-2">
            <Text className="text-xs font-semibold text-muted-foreground">Fundo de Troco Inicial (R$)</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={openingBalance}
                onChangeText={setOpeningBalance}
                placeholder="Ex: 150.00"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-sm flex-1"
              />
              <TouchableOpacity
                onPress={handleOpenCaixa}
                activeOpacity={0.8}
                className="bg-primary rounded-xl px-5 justify-center items-center"
              >
                <Text className="text-white font-bold text-sm">Abrir Caixa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        <View className="bg-card border border-emerald-500/30 rounded-2xl p-5 gap-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="bg-emerald-500/10 p-3 rounded-full">
                <Wallet color="#10b981" size={24} />
              </View>
              <View>
                <Text className="text-lg font-bold text-foreground">Caixa Aberto</Text>
                <Text className="text-muted-foreground text-xs">Operador: @{session.openedBy}</Text>
              </View>
            </View>
            <Text className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold">
              Ativo
            </Text>
          </View>

          {/* Resumo do Caixa */}
          <View className="flex-row justify-between bg-muted/40 p-4 rounded-xl border border-border/40 gap-2">
            <View className="items-center flex-1">
              <Text className="text-[10px] uppercase font-bold text-muted-foreground">Inicial</Text>
              <Text className="text-base font-bold text-foreground">R$ {session.initialCash.toFixed(2)}</Text>
            </View>
            <View className="w-[1px] bg-border/60" />
            <View className="items-center flex-1">
              <Text className="text-[10px] uppercase font-bold text-muted-foreground">Vendas</Text>
              <Text className="text-base font-bold text-emerald-500">R$ {sessionTotalRevenue.toFixed(2)}</Text>
            </View>
            <View className="w-[1px] bg-border/60" />
            <View className="items-center flex-1">
              <Text className="text-[10px] uppercase font-bold text-muted-foreground">Esperado</Text>
              <Text className="text-base font-bold text-primary">R$ {expectedCash.toFixed(2)}</Text>
            </View>
          </View>

          {/* Fechamento */}
          <View className="gap-2 border-t border-border/60 pt-3">
            <Text className="text-xs font-semibold text-muted-foreground">Valor Real em Dinheiro no Caixa (R$)</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={closingBalance}
                onChangeText={setClosingBalance}
                placeholder="Ex: 480.00"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-sm flex-1"
              />
              <TouchableOpacity
                onPress={handleCloseCaixa}
                activeOpacity={0.8}
                className="bg-destructive/10 border border-destructive/20 rounded-xl px-5 justify-center items-center"
              >
                <Text className="text-destructive font-bold text-sm">Fechar Caixa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 2. Pedidos Pendentes para Processar */}
      <View className="gap-3">
        <Text className="text-base font-bold text-foreground tracking-tight">Pedidos Pendentes ({pendingOrders.length})</Text>
        
        {pendingOrders.length === 0 ? (
          <View className="bg-card rounded-2xl py-12 items-center justify-center border border-border/80">
            <ShoppingBag color="#9ca3af" size={32} className="opacity-55 mb-2" />
            <Text className="text-muted-foreground text-sm font-semibold">Nenhum pedido pendente</Text>
            <Text className="text-muted-foreground/60 text-xs mt-1">Vendedores podem criar pedidos na aba de vendas</Text>
          </View>
        ) : (
          <View className="gap-3">
            {pendingOrders.map(order => (
              <View key={order.id} className="bg-card rounded-2xl p-4 border border-border/80 gap-3">
                <View className="flex-row justify-between items-start">
                  <View className="gap-0.5">
                    <Text className="text-sm font-bold text-foreground">{order.clientName}</Text>
                    <Text className="text-[11px] text-muted-foreground">Vendedor: {order.salespersonName}</Text>
                  </View>
                  <Text className="text-base font-extrabold text-foreground">R$ {order.total.toFixed(2)}</Text>
                </View>

                {/* Itens do carrinho */}
                <View className="bg-muted/40 p-2.5 rounded-lg border border-border/30 gap-1">
                  {order.items.map((item, idx) => (
                    <View key={idx} className="flex-row justify-between text-xs">
                      <Text className="text-muted-foreground text-xs flex-1 mr-2" numberOfLines={1}>
                        {item.quantity}x {item.productName}
                      </Text>
                      <Text className="text-foreground text-xs">R$ {(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  ))}
                  {order.discount > 0 && (
                    <View className="flex-row justify-between border-t border-border/30 pt-1 mt-1 text-xs">
                      <Text className="text-amber-500 text-xs">Desconto</Text>
                      <Text className="text-amber-500 text-xs">- R$ {order.discount.toFixed(2)}</Text>
                    </View>
                  )}
                  {order.shippingCost > 0 && (
                    <View className="flex-row justify-between text-xs">
                      <Text className="text-primary text-xs">Frete</Text>
                      <Text className="text-primary text-xs">+ R$ {order.shippingCost.toFixed(2)}</Text>
                    </View>
                  )}
                </View>

                {/* Confirmar e NF-e */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleConfirmPayment(order)}
                    activeOpacity={0.8}
                    className="flex-1 bg-emerald-500 rounded-xl py-2.5 flex-row items-center justify-center gap-1.5"
                  >
                    <CheckCircle color="white" size={16} />
                    <Text className="text-white font-bold text-xs">Receber e Concluir</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedOrderForInvoice(order);
                      setShowInvoiceModal(true);
                    }}
                    activeOpacity={0.7}
                    className="bg-muted border border-border rounded-xl px-3 items-center justify-center"
                  >
                    <Printer color="#4b5563" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 3. MODAL DE NOTA FISCAL SIMULADA */}
      <Modal
        visible={showInvoiceModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setShowInvoiceModal(false);
          setSelectedOrderForInvoice(null);
        }}
      >
        <View className="flex-1 bg-black/75 justify-center items-center p-6">
          <View className="bg-white rounded-3xl w-full max-w-[420px] max-h-[85%] overflow-hidden border border-gray-200">
            {/* Header */}
            <View className="bg-gray-100 flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
              <View className="flex-row items-center gap-2">
                <FileText color="#1f2937" size={20} />
                <Text className="text-base font-bold text-gray-800">Nota Fiscal Simulada</Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  setShowInvoiceModal(false);
                  setSelectedOrderForInvoice(null);
                }}
                className="bg-gray-200 p-1.5 rounded-full"
              >
                <X color="#374151" size={16} />
              </TouchableOpacity>
            </View>

            {/* Receipt Body */}
            {selectedOrderForInvoice && (
              <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
                {/* Cabeçalho da Empresa */}
                <View className="items-center border-b border-dashed border-gray-300 pb-4">
                  <Text className="text-base font-extrabold text-gray-900">ERP PDV BRASIL LTDA</Text>
                  <Text className="text-[11px] text-gray-500">CNPJ: 12.345.678/0001-99</Text>
                  <Text className="text-[11px] text-gray-500">Av. Paulista, 1000 - São Paulo/SP</Text>
                  <Text className="text-[10px] text-gray-400 mt-2">DOCUMENTO AUXILIAR DE NOTA FISCAL (NFC-e)</Text>
                </View>

                {/* Dados da Venda */}
                <View className="gap-1 border-b border-dashed border-gray-300 pb-3 text-xs">
                  <Text className="text-gray-600 text-xs">
                    Pedido ID: <Text className="font-bold text-gray-800">{selectedOrderForInvoice.id.slice(0,8)}...</Text>
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    Data: <Text className="font-bold text-gray-800">{new Date(selectedOrderForInvoice.date).toLocaleString()}</Text>
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    Cliente: <Text className="font-bold text-gray-800">{selectedOrderForInvoice.clientName}</Text>
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    Vendedor: <Text className="font-bold text-gray-800">{selectedOrderForInvoice.salespersonName}</Text>
                  </Text>
                  <Text className="text-gray-600 text-xs">
                    Status: <Text className={`font-bold ${selectedOrderForInvoice.status === 'concluido' ? 'text-green-600' : 'text-amber-500'}`}>{selectedOrderForInvoice.status.toUpperCase()}</Text>
                  </Text>
                </View>

                {/* Tabela de Itens */}
                <View className="gap-2">
                  <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Itens do Pedido</Text>
                  {selectedOrderForInvoice.items.map((item, idx) => (
                    <View key={idx} className="flex-row justify-between text-xs py-0.5">
                      <Text className="text-gray-700 text-xs flex-1 mr-4" numberOfLines={1}>
                        {idx + 1}. {item.productName} (x{item.quantity})
                      </Text>
                      <Text className="text-gray-900 font-medium text-xs">R$ {(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                {/* Subtotais */}
                <View className="border-t border-dashed border-gray-300 pt-3 gap-1.5">
                  {selectedOrderForInvoice.discount > 0 && (
                    <View className="flex-row justify-between text-xs">
                      <Text className="text-amber-600 text-xs">Desconto Aplicado</Text>
                      <Text className="text-amber-600 text-xs">- R$ {selectedOrderForInvoice.discount.toFixed(2)}</Text>
                    </View>
                  )}
                  {selectedOrderForInvoice.shippingCost > 0 && (
                    <View className="flex-row justify-between text-xs">
                      <Text className="text-gray-600 text-xs">Valor do Frete</Text>
                      <Text className="text-gray-900 text-xs">+ R$ {selectedOrderForInvoice.shippingCost.toFixed(2)}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between items-center border-t border-gray-200 pt-2 mt-1">
                    <Text className="text-sm font-extrabold text-gray-800">VALOR TOTAL</Text>
                    <Text className="text-lg font-black text-gray-900">R$ {selectedOrderForInvoice.total.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Rodapé Fiscal */}
                <View className="items-center gap-1 border-t border-gray-200 pt-4 mt-2">
                  <Text className="text-[10px] text-gray-400 text-center">Tributos incidentes lei 12.741/12 (aprox R$ {(selectedOrderForInvoice.total * 0.18).toFixed(2)})</Text>
                  <Text className="text-[11px] text-green-600 font-bold mt-2">✓ ASSINADA DIGITALMENTE PELO EMISSOR</Text>
                  <Text className="text-[9px] text-gray-400 font-mono mt-1 text-center">CHAVE DE ACESSO: NFCe-{selectedOrderForInvoice.id.slice(0, 16).replace(/-/g, '')}</Text>
                </View>
              </ScrollView>
            )}

            {/* Botão de Simulação de Impressão */}
            <View className="bg-gray-100 p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={() => {
                  Toast.show({
                    type: 'success',
                    text1: 'Impressora Térmica',
                    text2: 'Simulando envio para a impressora...'
                  });
                  setShowInvoiceModal(false);
                }}
                className="bg-gray-800 rounded-xl py-3 flex-row items-center justify-center gap-2"
              >
                <Printer color="white" size={18} />
                <Text className="text-white font-bold text-sm">Imprimir Via do Cliente</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
