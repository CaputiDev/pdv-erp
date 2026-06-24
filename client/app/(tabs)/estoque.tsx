import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSync } from '../../domains/sync/SyncContext';
import { Product } from '../../domains/products/types';
import { Package, Truck, ArrowUpRight, ArrowDownLeft, Save, AlertTriangle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function EstoqueScreen() {
  const { products, setProducts } = useSync();
  const [search, setSearch] = useState('');
  
  // Estados para edição rápida
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [shippingValue, setShippingValue] = useState('');

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  const handleAdjustStock = (product: Product, type: 'alta' | 'baixa') => {
    const qty = parseInt(stockAdjustment);
    if (isNaN(qty) || qty <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Ajuste de Estoque',
        text2: 'Digite uma quantidade inteira positiva.'
      });
      return;
    }

    const currentStock = product.stock;
    const finalStock = type === 'alta' ? currentStock + qty : Math.max(0, currentStock - qty);

    const updated = products.map(p => {
      if (p.id === product.id) {
        return { ...p, stock: finalStock, synced: false };
      }
      return p;
    });

    setProducts(updated);
    setStockAdjustment('');
    setSelectedProduct(null);
    Toast.show({
      type: 'success',
      text1: 'Estoque Atualizado',
      text2: `${product.name} agora possui ${finalStock} unidades.`
    });
  };

  const handleToggleRetirada = (product: Product) => {
    const updated = products.map(p => {
      if (p.id === product.id) {
        const nextRetirada = !p.retiradoNoEstoque;
        return { 
          ...p, 
          retiradoNoEstoque: nextRetirada, 
          // Se não retira no estoque (leva na hora), zera o frete
          shippingCost: nextRetirada ? p.shippingCost : 0,
          synced: false 
        };
      }
      return p;
    });

    setProducts(updated);
    Toast.show({
      type: 'success',
      text1: 'Atributo Atualizado',
      text2: product.retiradoNoEstoque 
        ? `${product.name} agora é levado na hora.` 
        : `${product.name} agora requer retirada física no estoque.`
    });
  };

  const handleUpdateShipping = (product: Product) => {
    const cost = parseFloat(shippingValue);
    if (isNaN(cost) || cost < 0) {
      Toast.show({
        type: 'error',
        text1: 'Configuração de Frete',
        text2: 'Valor de frete inválido.'
      });
      return;
    }

    const updated = products.map(p => {
      if (p.id === product.id) {
        return { ...p, shippingCost: cost, synced: false };
      }
      return p;
    });

    setProducts(updated);
    setShippingValue('');
    setSelectedProduct(null);
    Toast.show({
      type: 'success',
      text1: 'Frete Atualizado',
      text2: `Frete para ${product.name} definido para R$ ${cost.toFixed(2)}.`
    });
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 20 }}>
      
      {/* Busca */}
      <View className="bg-card rounded-2xl p-4 border border-border/80">
        <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Buscar Produto</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Código de barras ou nome do item..."
          placeholderTextColor="#9ca3af"
          className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-sm"
        />
      </View>

      {/* Editor do Produto Selecionado */}
      {selectedProduct && (
        <View className="bg-card border border-primary/20 rounded-2xl p-5 gap-4">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-bold text-foreground">{selectedProduct.name}</Text>
              <Text className="text-xs text-muted-foreground">Estoque Atual: {selectedProduct.stock} unidades</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setSelectedProduct(null)}
              className="bg-muted px-3 py-1 rounded-lg"
            >
              <Text className="text-muted-foreground text-xs font-bold">Cancelar</Text>
            </TouchableOpacity>
          </View>

          {/* 1. Ajuste Manual */}
          <View className="gap-2 border-t border-border/40 pt-3">
            <Text className="text-xs font-semibold text-muted-foreground">Dar Entrada/Saída Física</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={stockAdjustment}
                onChangeText={setStockAdjustment}
                placeholder="Qtd (Ex: 10)"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-sm flex-grow"
              />
              <TouchableOpacity
                onPress={() => handleAdjustStock(selectedProduct, 'alta')}
                activeOpacity={0.8}
                className="bg-emerald-500 rounded-xl px-4 flex-row items-center gap-1"
              >
                <ArrowUpRight color="white" size={14} />
                <Text className="text-white font-bold text-xs">Entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAdjustStock(selectedProduct, 'baixa')}
                activeOpacity={0.8}
                className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 flex-row items-center gap-1"
              >
                <ArrowDownLeft color="#ef4444" size={14} />
                <Text className="text-destructive font-bold text-xs">Saída</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Alterar Frete */}
          {selectedProduct.retiradoNoEstoque && (
            <View className="gap-2 border-t border-border/40 pt-3">
              <Text className="text-xs font-semibold text-muted-foreground">Valor de Frete Associado (R$)</Text>
              <View className="flex-row gap-2">
                <TextInput
                  value={shippingValue}
                  onChangeText={setShippingValue}
                  placeholder={`Atual: R$ ${selectedProduct.shippingCost.toFixed(2)}`}
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  className="bg-muted px-4 py-2.5 rounded-xl border border-border text-foreground text-sm flex-1"
                />
                <TouchableOpacity
                  onPress={() => handleUpdateShipping(selectedProduct)}
                  activeOpacity={0.8}
                  className="bg-primary rounded-xl px-4 justify-center items-center flex-row gap-1"
                >
                  <Save color="white" size={14} />
                  <Text className="text-white font-bold text-xs">Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Lista Geral de Estoque */}
      <View className="gap-3">
        <Text className="text-base font-bold text-foreground tracking-tight">Status de Inventário</Text>
        
        {filteredProducts.length === 0 ? (
          <View className="bg-card rounded-2xl py-12 items-center justify-center border border-border/80">
            <Package color="#9ca3af" size={32} className="opacity-55 mb-2" />
            <Text className="text-muted-foreground text-sm font-semibold">Nenhum produto correspondente</Text>
          </View>
        ) : (
          <View className="gap-3">
            {filteredProducts.map(item => {
              const isCritical = item.stock <= item.criticalStock;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setSelectedProduct(item);
                    setStockAdjustment('');
                    setShippingValue('');
                  }}
                  activeOpacity={0.7}
                  className={`bg-card rounded-2xl p-4 border flex-row justify-between items-center ${
                    selectedProduct?.id === item.id 
                      ? 'border-primary' 
                      : isCritical 
                        ? 'border-red-500/30 bg-red-500/5' 
                        : 'border-border/80'
                  }`}
                >
                  <View className="flex-1 mr-4 gap-1">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-sm font-bold text-foreground">{item.name}</Text>
                      {isCritical && (
                        <View className="bg-destructive/10 border border-destructive/20 flex-row items-center px-1.5 py-0.5 rounded gap-0.5">
                          <AlertTriangle color="#ef4444" size={10} />
                          <Text className="text-destructive text-[9px] font-bold">Crítico</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-muted-foreground text-[11px] font-mono">Cód: {item.barcode || 'N/A'}</Text>
                    
                    {/* Logística */}
                    <View className="flex-row gap-3 mt-1.5 items-center">
                      <TouchableOpacity 
                        onPress={() => handleToggleRetirada(item)}
                        className={`flex-row items-center gap-1 px-2 py-1 rounded-lg ${
                          item.retiradoNoEstoque 
                            ? 'bg-amber-500/10 border border-amber-500/20' 
                            : 'bg-emerald-500/10 border border-emerald-500/20'
                        }`}
                      >
                        <Package color={item.retiradoNoEstoque ? "#d97706" : "#059669"} size={12} />
                        <Text className={`text-[10px] font-bold ${
                          item.retiradoNoEstoque ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {item.retiradoNoEstoque ? 'Retira no Estoque' : 'Leva na Hora'}
                        </Text>
                      </TouchableOpacity>

                      {item.retiradoNoEstoque && (
                        <View className="flex-row items-center gap-1">
                          <Truck color="#6b7280" size={12} />
                          <Text className="text-muted-foreground text-[10px] font-bold">
                            Frete: R$ {item.shippingCost.toFixed(2)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View className="items-end gap-1">
                    <Text className="text-[10px] text-muted-foreground font-semibold uppercase">Estoque</Text>
                    <Text className={`text-base font-extrabold ${isCritical ? 'text-destructive' : 'text-foreground'}`}>
                      {item.stock} un
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
