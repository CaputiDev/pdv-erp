import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  SafeAreaView 
} from "react-native";
import { ShoppingCart, User, ArrowRight, ArrowLeft } from "lucide-react-native";
import { useOrdersManager } from "../../domains/orders/hooks/useOrdersManager";
import { ClientSelector } from "../../domains/orders/components/ClientSelector";
import { AddProductSection } from "../../domains/orders/components/AddProductSection";
import { CartList } from "../../domains/orders/components/CartList";
import { CheckoutFooter } from "../../domains/orders/components/CheckoutFooter";
import { OrderCard } from "../../domains/orders/components/OrderCard";
import { ClientSelectionModal } from "../../domains/clients/components/ClientSelectionModal";
import { ProductSelectionModal } from "../../domains/products/components/ProductSelectionModal";
import { SearchAndFilters } from "../../components/SearchAndFilters";

export default function Orders() {
  const {
    clients,
    products,
    filteredOrders,
    activeTab,
    setActiveTab,
    step,
    setStep,
    selectedClientId,
    setSelectedClientId,
    selectedClient,
    selectedProduct,
    setSelectedProductId,
    cart,
    quantity,
    setQuantity,
    status,
    setStatus,
    showClientModal,
    setShowClientModal,
    showProductModal,
    setShowProductModal,
    total,
    historySearch,
    setHistorySearch,
    historyFilter,
    setHistoryFilter,
    addToCart,
    removeFromCart,
    updateQuantity,
    finalizeOrder,
    completeOrder,
    deleteOrder,
    cancelOrder
  } = useOrdersManager();

  return (
    <View className="flex-1 bg-background">
      {/* TAB SWITCHER OR ACTIVE ORDER HEADER */}
      {activeTab === "novo" && selectedClientId ? (
        <View className="flex-row items-center justify-between mx-5 mt-4 pb-2 border-b border-border/40">
          <View className="flex-1 mr-4">
            <Text className="text-[10px] font-black uppercase text-muted-foreground">Pedido em Andamento</Text>
            <Text className="text-sm font-extrabold text-foreground" numberOfLines={1}>
              {selectedClient?.name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={cancelOrder}
            activeOpacity={0.7}
            className="px-3 py-1.5 rounded-xl bg-destructive/10 border border-destructive/20"
          >
            <Text className="text-xs font-bold text-destructive">Cancelar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row mx-4 mt-4 bg-muted/40 p-1 rounded-2xl border border-border/80">
          {(["novo", "historico"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
              className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === tab ? "bg-card shadow-sm" : ""}`}
            >
              <Text className={`text-sm font-bold ${activeTab === tab ? "text-foreground" : "text-muted-foreground"}`}>
                {tab === "novo" ? "Novo Pedido" : "Histórico"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeTab === "novo" && (
        <View className="flex-row items-center justify-between px-6 py-4 bg-muted/20 border-b border-border/50">
          {(["cliente", "produtos", "revisao"] as const).map((s, index) => {
            const label = s === "cliente" ? "Cliente" : s === "produtos" ? "Produtos" : "Revisão";
            const isActive = step === s;
            const isCompleted = 
              (s === "cliente" && (step === "produtos" || step === "revisao")) ||
              (s === "produtos" && step === "revisao");

            return (
              <React.Fragment key={s}>
                {index > 0 && (
                  <View className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-primary" : "bg-border/60"}`} />
                )}
                <View className="flex-row items-center gap-1.5">
                  <View className={`w-6 h-6 rounded-full items-center justify-center ${
                    isActive ? "bg-primary" : isCompleted ? "bg-primary/80" : "bg-muted-foreground/30"
                  }`}>
                    <Text className="text-[10px] font-black text-white">{index + 1}</Text>
                  </View>
                  <Text className={`text-xs font-bold ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {label}
                  </Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      )}

      {activeTab === "novo" ? (
        <>
          {step === "cliente" && (
            <View className="flex-1 px-4 py-6 justify-between">
              <View className="gap-6">
                <View>
                  <Text className="text-xl font-extrabold text-foreground">Cliente do Pedido</Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    Selecione o cliente que será atendido neste novo pedido.
                  </Text>
                </View>

                {selectedClient ? (
                  <View className="bg-card border border-primary/20 rounded-3xl p-6 shadow-sm gap-4">
                    <View className="flex-row items-center gap-3">
                      <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                        <User className="text-primary" size={24} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-extrabold text-foreground">{selectedClient.name}</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">Cliente Selecionado</Text>
                      </View>
                    </View>

                    <View className="border-t border-border/60 pt-4 gap-2">
                      {!!selectedClient.cpf && (
                        <Text className="text-sm text-muted-foreground">
                          CPF: <Text className="font-bold text-foreground">{selectedClient.cpf}</Text>
                        </Text>
                      )}
                      {!!selectedClient.phone && (
                        <Text className="text-sm text-muted-foreground">
                          Telefone: <Text className="font-bold text-foreground">{selectedClient.phone}</Text>
                        </Text>
                      )}
                      {!!selectedClient.email && (
                        <Text className="text-sm text-muted-foreground">
                          E-mail: <Text className="font-bold text-foreground">{selectedClient.email}</Text>
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => setShowClientModal(true)}
                      activeOpacity={0.7}
                      className="mt-2 py-3.5 border border-border/85 rounded-2xl items-center justify-center"
                    >
                      <Text className="text-sm font-bold text-foreground">Alterar Cliente</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowClientModal(true)}
                    activeOpacity={0.7}
                    className="w-full py-20 bg-card border-2 border-dashed border-border rounded-3xl items-center justify-center gap-3 shadow-sm"
                  >
                    <View className="w-14 h-14 rounded-full bg-muted/60 items-center justify-center">
                      <User className="text-muted-foreground/60" size={28} />
                    </View>
                    <Text className="text-base font-bold text-foreground">Selecione o Cliente</Text>
                    <Text className="text-xs text-muted-foreground/80">Toque aqui para listar os clientes cadastrados</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setStep("produtos")}
                disabled={!selectedClientId}
                activeOpacity={0.7}
                className={`w-full py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg ${
                  selectedClientId 
                    ? "bg-primary shadow-primary/20" 
                    : "bg-muted opacity-50"
                }`}
              >
                <Text className={`text-base font-black ${
                  selectedClientId ? "text-primary-foreground" : "text-muted-foreground/60"
                }`}>
                  Prosseguir para Produtos
                </Text>
                <ArrowRight size={18} className={selectedClientId ? "text-primary-foreground" : "text-muted-foreground/60"} />
              </TouchableOpacity>
            </View>
          )}

          {step === "produtos" && (
            <View className="flex-1 justify-between">
              <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 20 }}>
                <View>
                  <Text className="text-xl font-extrabold text-foreground">Adicionar Produtos</Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    Adicione produtos ao pedido e gerencie a quantidade.
                  </Text>
                </View>

                {/* ADD PRODUCT SECTION */}
                <AddProductSection 
                  selectedProduct={selectedProduct}
                  onPressSelect={() => setShowProductModal(true)}
                  quantity={quantity}
                  onChangeQuantity={setQuantity}
                  onAdd={addToCart}
                />

                {/* SHOPPING CART */}
                <CartList 
                  cart={cart}
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                />
              </ScrollView>

              {/* Rodapé de Navegação */}
              <View className="border-t border-border/50 bg-card">
                {cart.length > 0 && (
                  <View className="px-5 py-3.5 flex-row justify-between items-center border-b border-border/40">
                    <Text className="text-xs font-black uppercase text-muted-foreground">Total do Carrinho</Text>
                    <Text className="text-base font-extrabold text-emerald-600">R$ {total.toFixed(2)}</Text>
                  </View>
                )}
                
                <View className="px-4 py-4 flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setStep("cliente")}
                    activeOpacity={0.7}
                    className="flex-1 py-4 border border-border/80 rounded-2xl flex-row items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} className="text-foreground" />
                    <Text className="text-base font-black text-foreground">Voltar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setStep("revisao")}
                    disabled={cart.length === 0}
                    activeOpacity={0.7}
                    className={`flex-1 py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg ${
                      cart.length > 0 
                        ? "bg-primary shadow-primary/20" 
                        : "bg-muted opacity-50"
                    }`}
                  >
                    <Text className={`text-base font-black ${
                      cart.length > 0 ? "text-primary-foreground" : "text-muted-foreground/60"
                    }`}>
                      Revisar Pedido
                    </Text>
                    <ArrowRight size={18} className={cart.length > 0 ? "text-primary-foreground" : "text-muted-foreground/60"} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {step === "revisao" && (
            <View className="flex-1 justify-between">
              <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 150, gap: 20 }}>
                <View>
                  <Text className="text-xl font-extrabold text-foreground">Visão Geral do Pedido</Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    Revise os detalhes e finalize o pedido para simular o pagamento.
                  </Text>
                </View>

                {/* Resumo do Cliente */}
                <View className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm gap-2">
                  <Text className="text-xs font-black uppercase text-muted-foreground">Cliente</Text>
                  <Text className="text-base font-bold text-foreground">{selectedClient?.name}</Text>
                  {selectedClient?.cpf && (
                    <Text className="text-xs text-muted-foreground mt-0.5">CPF: {selectedClient.cpf}</Text>
                  )}
                  {selectedClient?.phone && (
                    <Text className="text-xs text-muted-foreground mt-0.5">Telefone: {selectedClient.phone}</Text>
                  )}
                </View>

                {/* Resumo dos Itens */}
                <View className="bg-card border border-border/80 rounded-3xl p-5 shadow-sm gap-4">
                  <Text className="text-xs font-black uppercase text-muted-foreground">Produtos Selecionados</Text>
                  
                  <View className="gap-3">
                    {cart.map((item) => (
                      <View key={item.productId} className="flex-row justify-between items-center pb-3 border-b border-border/40">
                        <View className="flex-1 pr-2">
                          <Text className="text-sm font-bold text-foreground" numberOfLines={1}>{item.productName}</Text>
                          <Text className="text-xs text-muted-foreground mt-0.5">
                            {item.quantity}x R$ {item.price.toFixed(2)}
                          </Text>
                        </View>
                        <Text className="text-sm font-extrabold text-foreground">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View className="flex-row justify-between items-center pt-2">
                    <Text className="text-sm font-black text-foreground">Total Geral</Text>
                    <Text className="text-lg font-black text-emerald-600">R$ {total.toFixed(2)}</Text>
                  </View>
                </View>

                {/* Botão de Cancelar/Voltar alternativo */}
                <TouchableOpacity
                  onPress={() => setStep("produtos")}
                  activeOpacity={0.7}
                  className="py-4 border border-border/80 rounded-2xl flex-row items-center justify-center gap-2 mb-20"
                >
                  <ArrowLeft size={18} className="text-foreground" />
                  <Text className="text-base font-black text-foreground">Ajustar Produtos</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </>
      ) : (
        /* ORDER HISTORY LIST */
        <View className="flex-1 px-4 pt-4">
          <SearchAndFilters
            search={historySearch}
            onSearchChange={setHistorySearch}
            placeholder="Buscar por cliente..."
            filters={[
              { key: "todos", label: "Todos" },
              { key: "pendente", label: "Pendente" },
              { key: "concluido", label: "Concluído" }
            ]}
            activeFilter={historyFilter}
            onFilterChange={setHistoryFilter}
          />
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-20 bg-card border border-border/80 rounded-3xl shadow-sm">
                <ShoppingCart className="text-muted-foreground/60 mb-3" size={32} />
                <Text className="text-muted-foreground text-sm font-semibold">Nenhum pedido no histórico</Text>
              </View>
            }
            renderItem={({ item }) => (
              <OrderCard
                order={item}
                onComplete={completeOrder}
                onDelete={deleteOrder}
              />
            )}
          />
        </View>
      )}

      {/* FOOTER CHECKOUT */}
      {activeTab === "novo" && step === "revisao" && (
        <CheckoutFooter 
          status={status}
          onChangeStatus={setStatus}
          total={total}
          onFinalize={finalizeOrder}
          disabled={cart.length === 0 || !selectedClientId}
        />
      )}

      {/* SELECTION MODALS */}
      <ClientSelectionModal
        visible={showClientModal}
        onClose={() => setShowClientModal(false)}
        clients={clients}
        onSelect={(id) => setSelectedClientId(id)}
      />

      <ProductSelectionModal
        visible={showProductModal}
        onClose={() => setShowProductModal(false)}
        products={products}
        onSelect={(id) => setSelectedProductId(id)}
      />
    </View>
  );
}
