import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useStore } from '../../context/StoreContext';
import './SaleForm.css';

const SaleForm: React.FC = () => {
  const { addSale, error } = useStore();
  const [items, setItems] = useState('');
  const [mrp, setMrp] = useState('');
  const [discount, setDiscount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleItemsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItems(e.target.value);
  };

  const handleMrpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMrp(value);
    
    // Calculate total amount when MRP or discount changes
    const mrpValue = parseFloat(value) || 0;
    const discountValue = parseFloat(discount) || 0;
    const calculatedTotal = Math.max(0, mrpValue - discountValue);
    setTotalAmount(calculatedTotal.toFixed(2));
  };

  const handleDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscount(value);
    
    // Calculate total amount when MRP or discount changes
    const mrpValue = parseFloat(mrp) || 0;
    const discountValue = parseFloat(value) || 0;
    const calculatedTotal = Math.max(0, mrpValue - discountValue);
    setTotalAmount(calculatedTotal.toFixed(2));
  };

  const handleTotalAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalAmount(e.target.value);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!items || !mrp || isNaN(parseFloat(mrp)) || isNaN(parseFloat(totalAmount))) {
      alert('Please fill all required fields with valid values');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Add the sale to Firestore
      await addSale({
        items,
        mrp: parseFloat(mrp),
        discount: parseFloat(discount) || 0,
        totalAmount: parseFloat(totalAmount)
      });
      
      // Reset form
      setItems('');
      setMrp('');
      setDiscount('');
      setTotalAmount('');
    } catch (err) {
      console.error('Error submitting sale:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sale-form-container">
      <h2>New Sale</h2>
      {error && <div className="error-message">{error}</div>}
      <form className="sale-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="items">Items</label>
          <input
            type="text"
            id="items"
            value={items}
            onChange={handleItemsChange}
            placeholder="T-shirt, Jeans, etc."
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="mrp">MRP (₹)</label>
          <input
            type="number"
            id="mrp"
            value={mrp}
            onChange={handleMrpChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="discount">Discount (₹)</label>
          <input
            type="number"
            id="discount"
            value={discount}
            onChange={handleDiscountChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="totalAmount">Total Amount (₹)</label>
          <input
            type="number"
            id="totalAmount"
            value={totalAmount}
            onChange={handleTotalAmountChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Sale'}
        </button>
      </form>
    </div>
  );
};

export default SaleForm; 