import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useStore } from '../../context/StoreContext';
import './SaleForm.css';

const SaleForm: React.FC = () => {
  const { addSale, error } = useStore();
  const [items, setItems] = useState('');
  const [mrp, setMrp] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [modeOfPayment, setModeOfPayment] = useState('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle clearing input field on click if value is 0.00
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '0.00' || value === '0') {
      // Use the appropriate setter function based on the input field id
      switch (e.target.id) {
        case 'mrp':
          setMrp('');
          break;
        case 'discount':
          setDiscount('');
          break;
        case 'discountPercentage':
          setDiscountPercentage('');
          break;
        case 'totalAmount':
          setTotalAmount('');
          break;
        default:
          break;
      }
    }
  };

  const handleItemsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setItems(e.target.value);
  };

  const handleMrpChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMrp(value);
    
    // Calculate discount amount and total amount when MRP changes
    const mrpValue = parseFloat(value) || 0;
    const discountPercent = parseFloat(discountPercentage) || 0;
    
    // Calculate discount amount based on percentage
    const calculatedDiscount = (mrpValue * discountPercent) / 100;
    setDiscount(calculatedDiscount.toFixed(2));
    
    // Calculate total
    const calculatedTotal = Math.max(0, mrpValue - calculatedDiscount);
    setTotalAmount(calculatedTotal.toFixed(2));
  };

  const handleDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscount(value);
    
    // Calculate discount percentage and total amount
    const mrpValue = parseFloat(mrp) || 0;
    const discountValue = parseFloat(value) || 0;
    
    // Update discount percentage if MRP is not zero
    if (mrpValue > 0) {
      const calculatedPercentage = (discountValue / mrpValue) * 100;
      setDiscountPercentage(calculatedPercentage.toFixed(2));
    } else {
      setDiscountPercentage('0');
    }
    
    // Calculate total
    const calculatedTotal = Math.max(0, mrpValue - discountValue);
    setTotalAmount(calculatedTotal.toFixed(2));
  };

  const handleDiscountPercentageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiscountPercentage(value);
    
    // Calculate discount amount and total amount
    const mrpValue = parseFloat(mrp) || 0;
    const discountPercent = parseFloat(value) || 0;
    
    // Calculate discount amount based on percentage
    const calculatedDiscount = (mrpValue * discountPercent) / 100;
    setDiscount(calculatedDiscount.toFixed(2));
    
    // Calculate total
    const calculatedTotal = Math.max(0, mrpValue - calculatedDiscount);
    setTotalAmount(calculatedTotal.toFixed(2));
  };

  const handleTotalAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalAmount(e.target.value);
  };

  const handleModeOfPaymentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModeOfPayment(e.target.value);
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
        totalAmount: parseFloat(totalAmount),
        modeOfPayment
      });
      
      // Reset form
      setItems('');
      setMrp('');
      setDiscount('');
      setDiscountPercentage('');
      setTotalAmount('');
      setModeOfPayment('Cash');
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
            onFocus={handleInputFocus}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
          />
        </div>
        
        <div className="discount-container">
          <div className="form-group">
            <label htmlFor="discount">Discount (₹)</label>
            <input
              type="number"
              id="discount"
              value={discount}
              onChange={handleDiscountChange}
              onFocus={handleInputFocus}
              placeholder="0.00"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="discountPercentage">Discount (%)</label>
            <input
              type="number"
              id="discountPercentage"
              value={discountPercentage}
              onChange={handleDiscountPercentageChange}
              onFocus={handleInputFocus}
              placeholder="0.00"
              min="0"
              max="100"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="discount-instruction">
          <small>Enter either discount amount or percentage - the other will be calculated automatically</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="totalAmount">Total Amount (₹)</label>
          <input
            type="number"
            id="totalAmount"
            value={totalAmount}
            onChange={handleTotalAmountChange}
            onFocus={handleInputFocus}
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
          {isSubmitting ? 'Adding...' : 'Add Sale'}
        </button>
      </form>
    </div>
  );
};

export default SaleForm; 