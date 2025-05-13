import React from 'react';
import Dashboard from './Dashboard/Dashboard';
import SaleForm from './Sales/SaleForm';
import ExpenseForm from './Expenses/ExpenseForm';
import TodaysRecords from './Records/TodaysRecords';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Main.css';

const Main: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>The Guys</h1>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      
      <main className="App-main">
        <Dashboard />
        
        <div className="forms-container">
          <SaleForm />
          <ExpenseForm />
        </div>
        
        <TodaysRecords />
      </main>
      
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} The Guys</p>
      </footer>
    </div>
  );
};

export default Main; 