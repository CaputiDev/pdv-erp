import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  ScrollView, 
  SafeAreaView 
} from "react-native";
import { ShoppingCart } from "lucide-react-native";
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
    deleteOrder
  } = useOrdersManager();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* TAB SWITCHER */}
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

      {activeTab === "novo" ? (
        <>
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 220, gap: 20 }}>
            {/* CLIENT SELECTOR */}
            <ClientSelector 
              selectedClient={selectedClient} 
              onPress={() => setShowClientModal(true)} 
            />

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

          {/* FOOTER CHECKOUT */}
          <CheckoutFooter 
            status={status}
            onChangeStatus={setStatus}
            total={total}
            onFinalize={finalizeOrder}
            disabled={cart.length === 0 || !selectedClientId}
          />
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
    </SafeAreaView>
  );
}
