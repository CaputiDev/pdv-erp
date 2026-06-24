export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  cpf: string;
  creditLimit: number; // Novo: limite de crediário
  creditScore: number; // Novo: score de crédito
  synced?: boolean;
}
