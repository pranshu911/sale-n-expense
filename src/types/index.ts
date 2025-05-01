export interface Sale {
  id: string;
  items: string;
  mrp: number;
  discount: number;
  totalAmount: number;
  date: Date;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: Date;
} 