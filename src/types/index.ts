// types/index.ts

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: number;
  name: string;
  icon: string;
  type: 'income' | 'expense';
}

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
  notes?: string;
  category: Category;
  // Adicione outras propriedades se necessário
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Senha é opcional no objeto de retorno
}

export interface AuthCredentials {
  email: string;
  password?: string;
}

export interface Wallet {
  id: number;
  name: string;
  goalAmount: number;
  currentAmount: number;
}

// Este é o tipo que o `receipts.service` precisa
export interface ScrapedItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}