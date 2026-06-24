import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Client } from '../clients/types';
import { Product } from '../products/types';
import { Order } from '../orders/types';

interface SyncContextType {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  lastSync: string | null;
  setLastSync: (time: string | null) => void;
  connectionStatus: "checking" | "online" | "offline";
  isSyncing: boolean;
  totalPending: number;
  pendingClients: Client[];
  pendingProducts: Product[];
  pendingOrders: Order[];
  verifyConnection: () => Promise<void>;
  handleSync: () => Promise<void>;
  isSyncCardExpanded: boolean;
  setIsSyncCardExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  clients: Client[];
  setClients: (value: Client[] | ((val: Client[]) => Client[])) => void;
  products: Product[];
  setProducts: (value: Product[] | ((val: Product[]) => Product[])) => void;
  orders: Order[];
  setOrders: (value: Order[] | ((val: Order[]) => Order[])) => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useLocalStorage<Order[]>("orders", []);
  const [clients, setClients] = useLocalStorage<Client[]>("clients", []);
  const [products, setProducts] = useLocalStorage<Product[]>("products", []);

  const defaultBackendUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
  const [backendUrl, setBackendUrl] = useLocalStorage<string>("backend_url", defaultBackendUrl);
  const [lastSync, setLastSync] = useLocalStorage<string | null>("last_sync", null);

  const [connectionStatus, setConnectionStatus] = useState<"checking" | "online" | "offline">("checking");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncCardExpanded, setIsSyncCardExpanded] = useState(false); // Estado para controlar a expansão do card

  const pendingClients = clients.filter(c => !c.synced);
  const pendingProducts = products.filter(p => !p.synced);
  const pendingOrders = orders.filter(o => !o.synced);
  const totalPending = pendingClients.length + pendingProducts.length + pendingOrders.length;

  const checkConnection = async (url: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(`${url}/`, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(id);
      if (response.ok) {
        const data = await response.json();
        return data.status === "online";
      }
    } catch (e) {
      clearTimeout(id);
    }
    return false;
  };

  const verifyConnection = async () => {
    setConnectionStatus("checking");
    const isOnline = await checkConnection(backendUrl);
    setConnectionStatus(isOnline ? "online" : "offline");
  };

  useEffect(() => {
    verifyConnection();
  }, [backendUrl]);

  // Verificar conexão em segundo plano a cada 20 segundos
  useEffect(() => {
    const interval = setInterval(async () => {
      const isOnline = await checkConnection(backendUrl);
      setConnectionStatus(isOnline ? "online" : "offline");
    }, 20000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const isOnline = await checkConnection(backendUrl);
      if (!isOnline) {
        setConnectionStatus("offline");
        Toast.show({
          type: "error",
          text1: "Erro de Conexão",
          text2: "Servidor indisponível. Verifique a URL do backend.",
          position: "bottom"
        });
        setIsSyncing(false);
        return;
      }
      setConnectionStatus("online");

      const payload = {
        clients: pendingClients.map(({ synced, ...rest }) => rest),
        products: pendingProducts.map(({ synced, ...rest }) => rest),
        orders: pendingOrders.map(({ synced, ...rest }) => rest),
      };

      const response = await fetch(`${backendUrl}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Erro na rota /sync");
      }

      const syncResult = await response.json();
      const { synced_clients, synced_products, synced_orders } = syncResult;

      const updatedClients = clients.map(c => 
        synced_clients.includes(c.id) ? { ...c, synced: true } : c
      );
      const updatedProducts = products.map(p => 
        synced_products.includes(p.id) ? { ...p, synced: true } : p
      );
      const updatedOrders = orders.map(o => 
        synced_orders.includes(o.id) ? { ...o, synced: true } : o
      );

      // Sincronizar catálogos (Download & Merge)
      const clientsRes = await fetch(`${backendUrl}/clientes`);
      let latestClients = updatedClients;
      if (clientsRes.ok) {
        const serverClients: Client[] = await clientsRes.json();
        const serverClientsMarked = serverClients.map(c => ({ ...c, synced: true }));
        latestClients = [
          ...serverClientsMarked,
          ...updatedClients.filter(c => !c.synced && !serverClientsMarked.some(sc => sc.id === c.id))
        ];
      }

      const productsRes = await fetch(`${backendUrl}/produtos`);
      let latestProducts = updatedProducts;
      if (productsRes.ok) {
        const serverProducts: Product[] = await productsRes.json();
        const serverProductsMarked = serverProducts.map(p => ({ ...p, synced: true }));
        latestProducts = [
          ...serverProductsMarked,
          ...updatedProducts.filter(p => !p.synced && !serverProductsMarked.some(sp => sp.id === p.id))
        ];
      }

      setClients(latestClients);
      setProducts(latestProducts);
      setOrders(updatedOrders);

      const nowStr = new Date().toLocaleString("pt-BR");
      setLastSync(nowStr);

      Toast.show({
        type: "success",
        text1: "Sincronização Concluída",
        text2: "Dados sincronizados e atualizados com sucesso!",
        position: "bottom"
      });
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      Toast.show({
        type: "error",
        text1: "Falha na Sincronização",
        text2: "Erro ao comunicar com o servidor.",
        position: "bottom"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Limpeza de dados de teste antigos ("string") que possam estar no Local Storage local
  useEffect(() => {
    let clientsChanged = false;
    let productsChanged = false;
    let ordersChanged = false;

    const cleanedClients = clients.filter(c => {
      if (c.id === "string") {
        clientsChanged = true;
        return false;
      }
      return true;
    });

    const cleanedProducts = products.filter(p => {
      if (p.id === "string") {
        productsChanged = true;
        return false;
      }
      return true;
    });

    const cleanedOrders = orders.filter(o => {
      if (o.id === "string" || o.clientId === "string" || o.items.some(i => i.productId === "string")) {
        ordersChanged = true;
        return false;
      }
      return true;
    });

    if (clientsChanged) setClients(cleanedClients);
    if (productsChanged) setProducts(cleanedProducts);
    if (ordersChanged) setOrders(cleanedOrders);
  }, [clients, products, orders]);

  useEffect(() => {
    if (connectionStatus === "online" && !isSyncing) {
      const hasPendingSync = clients.some(c => !c.synced) || products.some(p => !p.synced) || orders.some(o => !o.synced);
      if (hasPendingSync) {
        handleSync();
      }
    }
  }, [clients, products, orders, connectionStatus, isSyncing]);

  return (
    <SyncContext.Provider value={{
      backendUrl, setBackendUrl,
      lastSync, setLastSync,
      connectionStatus,
      isSyncing,
      totalPending,
      pendingClients,
      pendingProducts,
      pendingOrders,
      verifyConnection,
      handleSync,
      isSyncCardExpanded, setIsSyncCardExpanded,
      clients, setClients,
      products, setProducts,
      orders, setOrders
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync deve ser usado dentro do SyncProvider");
  return context;
}
