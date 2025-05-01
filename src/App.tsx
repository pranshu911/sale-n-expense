import React from 'react';
import './App.css';
import { StoreProvider } from './context/StoreContext';
import Dashboard from './components/Dashboard/Dashboard';
import SaleForm from './components/Sales/SaleForm';
import ExpenseForm from './components/Expenses/ExpenseForm';
import TodaysRecords from './components/Records/TodaysRecords';

function App() {
  return (
    <StoreProvider>
      <div className="App">
        <header className="App-header">
          <h1>Retail Store Manager</h1>
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
          <p>&copy; {new Date().getFullYear()} Retail Store Manager</p>
        </footer>
      </div>
    </StoreProvider>
  );
}

export default App;
