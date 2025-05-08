export interface Sale {
  id: string;
  items: string;
  mrp: number;
  discount: number;
  totalAmount: number;
  date: Date;
  modeOfPayment?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: Date;
  modeOfPayment?: string;
} 