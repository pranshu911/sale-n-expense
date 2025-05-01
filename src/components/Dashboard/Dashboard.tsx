import React from 'react';
import { useStore } from '../../context/StoreContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { 
    getTodaySalesTotal, 
    getTodayExpensesTotal, 
    loading,
    error,
    refreshData
  } = useStore();

  const todaySalesTotal = getTodaySalesTotal();
  const todayExpensesTotal = getTodayExpensesTotal();
  const netAmount = todaySalesTotal - todayExpensesTotal;

  const handleRefresh = async () => {
    await refreshData();
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <h2>Today's Summary</h2>
        <div className="loading-spinner">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <h2>Today's Summary</h2>
        <div className="error-message">{error}</div>
        <button onClick={handleRefresh} className="refresh-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h2>Today's Summary</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card sales">
          <h3>Total Sales</h3>
          <div className="amount">₹{todaySalesTotal.toFixed(2)}</div>
        </div>
        <div className="dashboard-card expenses">
          <h3>Total Expenses</h3>
          <div className="amount">₹{todayExpensesTotal.toFixed(2)}</div>
        </div>
        <div className={`dashboard-card net ${netAmount >= 0 ? 'profit' : 'loss'}`}>
          <h3>Net Amount</h3>
          <div className="amount">₹{netAmount.toFixed(2)}</div>
        </div>
      </div>
      <button onClick={handleRefresh} className="refresh-btn">Refresh</button>
    </div>
  );
};

export default Dashboard; 