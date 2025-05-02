import React from 'react';
import Dashboard from './Dashboard/Dashboard';
import SaleForm from './Sales/SaleForm';
import ExpenseForm from './Expenses/ExpenseForm';
import TodaysRecords from './Records/TodaysRecords';
import './Main.css';

const Main: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>The Guys</h1>
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