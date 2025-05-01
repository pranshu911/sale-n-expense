import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sale, Expense } from '../../types';
import './TodaysRecords.css';

const TodaysRecords: React.FC = () => {
  const { 
    getTodaySales, 
    getTodayExpenses, 
    deleteSale, 
    deleteExpense,
    loading,
    error,
    refreshData
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const todaySales = getTodaySales();
  const todayExpenses = getTodayExpenses();
  
  const handleDelete = async (id: string, type: 'sales' | 'expenses') => {
    setIsDeleting(id);
    try {
      if (type === 'sales') {
        await deleteSale(id);
      } else {
        await deleteExpense(id);
      }
    } catch (err) {
      console.error(`Error deleting ${type} record:`, err);
    } finally {
      setIsDeleting(null);
    }
  };
  
  const handleRefresh = async () => {
    await refreshData();
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return (
      <div className="records-container loading">
        <h2>Today's Records</h2>
        <div className="loading-spinner">Loading records...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="records-container error">
        <h2>Today's Records</h2>
        <div className="error-message">{error}</div>
        <button onClick={handleRefresh} className="refresh-btn">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="records-container">
      <h2>Today's Records</h2>
      
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales ({todaySales.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses ({todayExpenses.length})
        </button>
      </div>
      
      <div className="records-content">
        {activeTab === 'sales' ? (
          <div className="sales-records">
            {todaySales.length === 0 ? (
              <p className="no-records">No sales recorded today.</p>
            ) : (
              <div className="table-responsive">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Items</th>
                      <th>MRP (₹)</th>
                      <th>Discount (₹)</th>
                      <th>Total (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaySales.map((sale: Sale) => (
                      <tr key={sale.id}>
                        <td>{formatDate(sale.date)}</td>
                        <td>{sale.items}</td>
                        <td>{sale.mrp.toFixed(2)}</td>
                        <td>{sale.discount.toFixed(2)}</td>
                        <td>{sale.totalAmount.toFixed(2)}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(sale.id, 'sales')}
                            disabled={isDeleting === sale.id}
                          >
                            {isDeleting === sale.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="expenses-records">
            {todayExpenses.length === 0 ? (
              <p className="no-records">No expenses recorded today.</p>
            ) : (
              <div className="table-responsive">
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Name</th>
                      <th>Amount (₹)</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayExpenses.map((expense: Expense) => (
                      <tr key={expense.id}>
                        <td>{formatDate(expense.date)}</td>
                        <td>{expense.name}</td>
                        <td>{expense.amount.toFixed(2)}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(expense.id, 'expenses')}
                            disabled={isDeleting === expense.id}
                          >
                            {isDeleting === expense.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      
      <button onClick={handleRefresh} className="refresh-btn">Refresh</button>
    </div>
  );
};

export default TodaysRecords; 