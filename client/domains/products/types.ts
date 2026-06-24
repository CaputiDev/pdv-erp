export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  criticalStock: number;
  synced?: boolean;
}
