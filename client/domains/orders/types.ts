export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: CartItem[];
  total: number;
  discount: number;       // Novo: desconto aplicado
  shippingCost: number;   // Novo: frete inserido
  status: "pendente" | "concluido";
  salespersonId: string;  // Novo: ID do vendedor
  salespersonName: string;// Novo: Nome do vendedor
  date: string;
  synced?: boolean;
}
