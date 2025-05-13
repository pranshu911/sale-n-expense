import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useTheme } from '../../context/ThemeContext';
import ToggleSwitch from '../UI/ToggleSwitch';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { 
    getTodaySalesTotal, 
    getTodayExpensesTotal, 
    loading
  } = useStore();

  const totalSales = getTodaySalesTotal();
  const totalExpenses = getTodayExpensesTotal();
  const netTotal = totalSales - totalExpenses;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="dashboard-controls">
          <ToggleSwitch />
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">Loading...</div>
      ) : (
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Sales</h3>
            <p className="amount sales-amount">₹{totalSales.toFixed(2)}</p>
          </div>

          <div className="summary-card">
            <h3>Total Expenses</h3>
            <p className="amount expenses-amount">₹{totalExpenses.toFixed(2)}</p>
          </div>

          <div className="summary-card">
            <h3>Net Amount</h3>
            <p className={`amount ${netTotal >= 0 ? 'profit-amount' : 'loss-amount'}`}>
              ₹{netTotal.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 