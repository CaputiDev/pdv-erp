export type Role = 'admin' | 'caixa' | 'vendedor' | 'financeiro' | 'estoque' | 'gestor_geral' | 'gestor_rh';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  passwordHash: string;
  isTempPassword: boolean;
  salary: number;
  tags: { tag: string; date: string }[];
  promotions: { oldRole: string; newRole: string; date: string }[];
}
