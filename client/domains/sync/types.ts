import { Client } from '../clients/types';
import { Product } from '../products/types';
import { Order } from '../orders/types';

export interface SyncContextType {
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
  verifyConnection: () => Promise<"online" | "offline">;
  handleSync: (showToast?: boolean) => Promise<void>;
  isSyncCardExpanded: boolean;
  setIsSyncCardExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  clients: Client[];
  setClients: (value: Client[] | ((val: Client[]) => Client[])) => void;
  products: Product[];
  setProducts: (value: Product[] | ((val: Product[]) => Product[])) => void;
  orders: Order[];
  setOrders: (value: Order[] | ((val: Order[]) => Order[])) => void;
}
