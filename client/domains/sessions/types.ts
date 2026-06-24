export interface CaixaTransaction {
  orderId: string;
  value: number;
  timestamp: string;
}

export interface CaixaSession {
  id: string;
  openedBy: string; // User username or user id
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  finalCash?: number;
  status: 'open' | 'closed';
  transactions: CaixaTransaction[];
}
