import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Sale, Expense } from '../types';
import { 
  addSale as addSaleToFirestore, 
  addExpense as addExpenseToFirestore,
  getRecords,
  deleteRecord
} from '../firebase';

interface StoreContextType {
  sales: Sale[];
  expenses: Expense[];
  addSale: (sale: Omit<Sale, 'id' | 'date'>) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getTodaySales: () => Sale[];
  getTodayExpenses: () => Expense[];
  getTodaySalesTotal: () => number;
  getTodayExpensesTotal: () => number;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's sales and expenses on component mount
  useEffect(() => {
    refreshData();
  }, []);

  // Function to fetch today's data from Firestore
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch today's sales
      const salesData = await getRecords('sales');
      setSales(salesData);

      // Fetch today's expenses
      const expensesData = await getRecords('expenses');
      setExpenses(expensesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSale = async (sale: Omit<Sale, 'id' | 'date'>) => {
    try {
      await addSaleToFirestore(sale);
      // Refresh data to get the updated list
      await refreshData();
    } catch (err: any) {
      console.error('Error adding sale:', err);
      let errorMessage = 'Failed to add sale. Please try again.';
      
      // Enhance error message if we have more details
      if (err.message) {
        errorMessage = `Failed to add sale: ${err.message}`;
      }
      
      if (err.code) {
        errorMessage += ` (Code: ${err.code})`;
      }
      
      setError(errorMessage);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
    try {
      await addExpenseToFirestore(expense);
      // Refresh data to get the updated list
      await refreshData();
    } catch (err: any) {
      console.error('Error adding expense:', err);
      let errorMessage = 'Failed to add expense. Please try again.';
      
      // Enhance error message if we have more details
      if (err.message) {
        errorMessage = `Failed to add expense: ${err.message}`;
      }
      
      if (err.code) {
        errorMessage += ` (Code: ${err.code})`;
      }
      
      setError(errorMessage);
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await deleteRecord('sales', id);
      // Update local state
      setSales(prevSales => prevSales.filter(sale => sale.id !== id));
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError('Failed to delete sale. Please try again.');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteRecord('expenses', id);
      // Update local state
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense. Please try again.');
    }
  };

  const getTodaySales = (): Sale[] => {
    return sales;
  };

  const getTodayExpenses = (): Expense[] => {
    return expenses;
  };

  const getTodaySalesTotal = (): number => {
    return getTodaySales().reduce((total, sale) => total + sale.totalAmount, 0);
  };

  const getTodayExpensesTotal = (): number => {
    return getTodayExpenses().reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <StoreContext.Provider
      value={{
        sales,
        expenses,
        addSale,
        addExpense,
        deleteSale,
        deleteExpense,
        getTodaySales,
        getTodayExpenses,
        getTodaySalesTotal,
        getTodayExpensesTotal,
        loading,
        error,
        refreshData
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}; 