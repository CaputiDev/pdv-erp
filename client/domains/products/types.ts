export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  barcode: string;
  criticalStock: number;
  retiradoNoEstoque: boolean; // Novo: true = retira no estoque / false = leva na hora
  shippingCost: number;       // Novo: custo de frete 
  categoryId?: string;        // Novo: ID da categoria do produto
  synced?: boolean;
}
