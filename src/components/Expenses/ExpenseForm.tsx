import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useStore } from '../../context/StoreContext';
import './ExpenseForm.css';

const ExpenseForm: React.FC = () => {
  const { addExpense, error } = useStore();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleModeOfPaymentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModeOfPayment(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !amount || isNaN(parseFloat(amount))) {
      alert('Please fill all required fields with valid values');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add the expense to Firestore
      await addExpense({
        name,
        amount: parseFloat(amount),
        modeOfPayment
      });
      
      // Reset form
      setName('');
      setAmount('');
      setModeOfPayment('Cash');
    } catch (err) {
      console.error('Error submitting expense:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="expense-form-container">
      <h2>New Expense</h2>
      {error && <div className="error-message">{error}</div>}
      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={handleNameChange}
            placeholder="Rent, Utilities, etc."
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="modeOfPayment">Mode of Payment</label>
          <select
            id="modeOfPayment"
            value={modeOfPayment}
            onChange={handleModeOfPaymentChange}
            disabled={isSubmitting}
          >
            <option value="Cash">Cash</option>
            <option value="CC">CC</option>
            <option value="GPay">GPay</option>
            <option value="Paytm">Paytm</option>
            <option value="PhonePe">PhonePe</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm; 