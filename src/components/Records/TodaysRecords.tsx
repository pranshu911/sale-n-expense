import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sale, Expense } from '../../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TodaysRecords.css';

const TodaysRecords: React.FC = () => {
  const { 
    getTodaySales, 
    getTodayExpenses, 
    deleteSale, 
    deleteExpense,
    loading,
    error,
    refreshData,
    getRecordsForDate,
    selectedDate,
    setSelectedDate
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

  const handleDateChange = (date: Date | null, event?: React.SyntheticEvent<any, Event> | undefined) => {
    if (date) {
      getRecordsForDate(date);
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <div className="records-container loading">
        <h2>Records</h2>
        <div className="loading-spinner">Loading records...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="records-container error">
        <h2>Records</h2>
        <div className="error-message">{error}</div>
        <button onClick={handleRefresh} className="refresh-btn">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="records-container">
      <div className="records-header">
        <h2>{isToday(selectedDate) ? "Today's Records" : "Records"}</h2>
        
        <div className="date-picker-container">
          <div className="date-picker-label">
            <span className="date-label">Select Date:</span>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="MMMM d, yyyy"
              className="date-picker"
              maxDate={new Date()}
              placeholderText="Select a date"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              todayButton="Today"
            />
          </div>
          {!isToday(selectedDate) && (
            <div className="selected-date">
              Showing records for: <span>{formatFullDate(selectedDate)}</span>
            </div>
          )}
        </div>
      </div>
      
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
              <p className="no-records">No sales recorded for this date.</p>
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
              <p className="no-records">No expenses recorded for this date.</p>
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
      
      <div className="records-footer">
        <div className="records-actions">
          <button 
            onClick={() => handleDateChange(new Date())} 
            className="today-btn"
            disabled={isToday(selectedDate)}
          >
            Show Today
          </button>
          <button onClick={handleRefresh} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodaysRecords; 