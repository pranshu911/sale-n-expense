import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Sale, Expense } from '../../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TodaysRecords.css';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordType: 'sales' | 'expenses';
  record: Sale | Expense;
  onUpdate: (data: any) => void;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, recordType, record, onUpdate }) => {
  const isSale = recordType === 'sales';
  const [formData, setFormData] = useState<any>(
    isSale 
      ? { 
          items: (record as Sale).items,
          mrp: (record as Sale).mrp,
          discount: (record as Sale).discount,
          discountPercentage: ((record as Sale).mrp > 0 ? ((record as Sale).discount / (record as Sale).mrp * 100) : 0).toFixed(2),
          totalAmount: (record as Sale).totalAmount,
          modeOfPayment: (record as Sale).modeOfPayment || 'Cash'
        }
      : {
          name: (record as Expense).name,
          amount: (record as Expense).amount,
          modeOfPayment: (record as Expense).modeOfPayment || 'Cash'
        }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mrp' || name === 'discount' || name === 'totalAmount' || name === 'amount' || name === 'discountPercentage') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if ((value === '0' || value === '0.00') && 
        (name === 'mrp' || name === 'discount' || name === 'totalAmount' || name === 'amount' || name === 'discountPercentage')) {
      setFormData({ ...formData, [name]: '' });
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculateTotal = () => {
    if (isSale) {
      const mrp = parseFloat(formData.mrp) || 0;
      const discount = parseFloat(formData.discount) || 0;
      return mrp - discount;
    }
    return formData.totalAmount;
  };

  const handleMrpOrDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setFormData((prev: any) => {
      const newData = { ...prev, [name]: numValue };
      
      if (name === 'mrp') {
        // When MRP changes, update discount amount based on percentage and recalculate total
        const discountAmount = (numValue * (prev.discountPercentage || 0)) / 100;
        newData.discount = discountAmount;
        newData.totalAmount = numValue - discountAmount;
      } else if (name === 'discount') {
        // When discount amount changes, update percentage and recalculate total
        newData.discountPercentage = prev.mrp ? (numValue / prev.mrp * 100) : 0;
        newData.totalAmount = prev.mrp - numValue;
      } else if (name === 'discountPercentage') {
        // When discount percentage changes, update discount amount and recalculate total
        const discountAmount = prev.mrp * (numValue / 100);
        newData.discount = discountAmount;
        newData.totalAmount = prev.mrp - discountAmount;
      }
      
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Update {isSale ? 'Sale' : 'Expense'}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {isSale ? (
            <>
              <div className="form-group">
                <label htmlFor="items">Items</label>
                <input
                  type="text"
                  id="items"
                  name="items"
                  value={formData.items}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="mrp">MRP (₹)</label>
                <input
                  type="number"
                  id="mrp"
                  name="mrp"
                  min="0"
                  step="0.01"
                  value={formData.mrp}
                  onChange={handleMrpOrDiscountChange}
                  onFocus={handleInputFocus}
                  required
                />
              </div>
              <div className="discount-container">
                <div className="form-group">
                  <label htmlFor="discount">Discount (₹)</label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    min="0"
                    step="0.01"
                    value={formData.discount}
                    onChange={handleMrpOrDiscountChange}
                    onFocus={handleInputFocus}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="discountPercentage">Discount (%)</label>
                  <input
                    type="number"
                    id="discountPercentage"
                    name="discountPercentage"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.discountPercentage}
                    onChange={handleMrpOrDiscountChange}
                    onFocus={handleInputFocus}
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
                  name="totalAmount"
                  min="0"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="modeOfPayment">Mode of Payment</label>
                <select
                  id="modeOfPayment"
                  name="modeOfPayment"
                  value={formData.modeOfPayment}
                  onChange={handleSelectChange}
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
            </>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="modeOfPayment">Mode of Payment</label>
                <select
                  id="modeOfPayment"
                  name="modeOfPayment"
                  value={formData.modeOfPayment}
                  onChange={handleSelectChange}
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
            </>
          )}
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="update-btn">Update</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TodaysRecords: React.FC = () => {
  const { 
    getTodaySales, 
    getTodayExpenses, 
    deleteSale, 
    deleteExpense,
    updateSale,
    updateExpense,
    loading,
    error,
    refreshData,
    getRecordsForDate,
    selectedDate,
    setSelectedDate
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Sale | Expense | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
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

  const handleUpdate = (id: string, type: 'sales' | 'expenses') => {
    const record = type === 'sales' 
      ? todaySales.find(sale => sale.id === id)
      : todayExpenses.find(expense => expense.id === id);
    
    if (record) {
      setSelectedRecord(record);
      setActiveTab(type);
      setShowUpdateModal(true);
    }
  };

  const handleUpdateSubmit = async (data: any) => {
    if (!selectedRecord) return;
    
    const id = selectedRecord.id;
    setIsUpdating(id);
    
    try {
      if (activeTab === 'sales') {
        await updateSale(id, data);
      } else {
        await updateExpense(id, data);
      }
      setShowUpdateModal(false);
    } catch (err) {
      console.error(`Error updating ${activeTab} record:`, err);
    } finally {
      setIsUpdating(null);
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
  
  const handleExportToExcel = async () => {
    // If there are no sales and no expenses, don't export
    if (todaySales.length === 0 && todayExpenses.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sale-n-Expense';
      workbook.lastModifiedBy = 'Sale-n-Expense';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Format the date for the filename
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Add Sales worksheet
      const salesWorksheet = workbook.addWorksheet('Sales', {
        properties: {
          tabColor: { argb: '4F81BD' }
        },
        headerFooter: {
          firstHeader: "Sales Records"
        }
      });

      // Define Sales columns
      salesWorksheet.columns = [
        { header: 'Time', key: 'time', width: 15 },
        { header: 'Items', key: 'items', width: 40 },
        { header: 'MRP (₹)', key: 'mrp', width: 15 },
        { header: 'Discount (₹)', key: 'discount', width: 15 },
        { header: 'Discount (%)', key: 'discountPercentage', width: 15 },
        { header: 'Total (₹)', key: 'total', width: 15 },
        { header: 'Mode of Payment', key: 'mode', width: 20 }
      ];

      // Style the header row
      salesWorksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
      salesWorksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4F81BD' } };
      salesWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Add Sales data
      if (todaySales.length > 0) {
        todaySales.forEach(sale => {
          salesWorksheet.addRow({
            time: formatDate(sale.date),
            items: sale.items,
            mrp: sale.mrp,
            discount: sale.discount,
            discountPercentage: sale.mrp > 0 ? ((sale.discount / sale.mrp) * 100).toFixed(2) + '%' : '0.00%',
            total: sale.totalAmount,
            mode: sale.modeOfPayment || 'Cash'
          });
        });
      } else {
        // Add a "No data" row if there are no sales
        const noDataRow = salesWorksheet.addRow(['No sales recorded for this date.']);
        noDataRow.getCell(1).font = { italic: true };
        salesWorksheet.mergeCells(`A${noDataRow.number}:G${noDataRow.number}`);
        noDataRow.alignment = { horizontal: 'center' };
      }

      // Add totals for Sales
      if (todaySales.length > 0) {
        const totalRow = salesWorksheet.addRow({
          items: 'TOTAL',
          mrp: todaySales.reduce((sum, sale) => sum + sale.mrp, 0),
          discount: todaySales.reduce((sum, sale) => sum + sale.discount, 0),
          discountPercentage: '', // No percentage for total row
          total: todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0)
        });
        totalRow.font = { bold: true };
        totalRow.getCell('items').alignment = { horizontal: 'right' };
        totalRow.eachCell({ includeEmpty: false }, (cell) => {
          if (cell.type === ExcelJS.ValueType.Number) {
            cell.numFmt = '₹#,##0.00';
          }
        });
      }

      // Format number cells in the sales worksheet
      salesWorksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {  // Skip header row
          const numericCells = ['mrp', 'discount', 'total'];
          numericCells.forEach(key => {
            const cell = row.getCell(key);
            if (cell.type === ExcelJS.ValueType.Number) {
              cell.numFmt = '₹#,##0.00';
            }
          });
        }
      });

      // Add Expenses worksheet
      const expensesWorksheet = workbook.addWorksheet('Expenses', {
        properties: {
          tabColor: { argb: 'C0504D' }
        },
        headerFooter: {
          firstHeader: "Expenses Records"
        }
      });

      // Define Expenses columns
      expensesWorksheet.columns = [
        { header: 'Time', key: 'time', width: 15 },
        { header: 'Name', key: 'name', width: 40 },
        { header: 'Amount (₹)', key: 'amount', width: 20 },
        { header: 'Mode of Payment', key: 'mode', width: 20 }
      ];

      // Style the header row
      expensesWorksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFF' } };
      expensesWorksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C0504D' } };
      expensesWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

      // Add Expenses data
      if (todayExpenses.length > 0) {
        todayExpenses.forEach(expense => {
          expensesWorksheet.addRow({
            time: formatDate(expense.date),
            name: expense.name,
            amount: expense.amount,
            mode: expense.modeOfPayment || 'Cash'
          });
        });
      } else {
        // Add a "No data" row if there are no expenses
        const noDataRow = expensesWorksheet.addRow(['No expenses recorded for this date.']);
        noDataRow.getCell(1).font = { italic: true };
        expensesWorksheet.mergeCells(`A${noDataRow.number}:D${noDataRow.number}`);
        noDataRow.alignment = { horizontal: 'center' };
      }

      // Add total for Expenses
      if (todayExpenses.length > 0) {
        const totalRow = expensesWorksheet.addRow({
          name: 'TOTAL',
          amount: todayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
        });
        totalRow.font = { bold: true };
        totalRow.getCell('name').alignment = { horizontal: 'right' };
        totalRow.getCell('amount').numFmt = '₹#,##0.00';
      }

      // Format number cells in the expenses worksheet
      expensesWorksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {  // Skip header row
          const cell = row.getCell('amount');
          if (cell.type === ExcelJS.ValueType.Number) {
            cell.numFmt = '₹#,##0.00';
          }
        }
      });

      // Add title and date information to both worksheets
      [salesWorksheet, expensesWorksheet].forEach(worksheet => {
        // Insert two rows at the top
        worksheet.spliceRows(1, 0, [], []);
        
        // Add title in the first row
        worksheet.getCell('A1').value = isToday(selectedDate) ? "Today's Records" : `Records for ${formatFullDate(selectedDate)}`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.mergeCells('A1:' + String.fromCharCode(64 + worksheet.columnCount) + '1');
        worksheet.getCell('A1').alignment = { horizontal: 'center' };
        
        // Add date in the second row
        worksheet.getCell('A2').value = `Generated on: ${new Date().toLocaleString()}`;
        worksheet.getCell('A2').font = { size: 10, italic: true };
        worksheet.mergeCells('A2:' + String.fromCharCode(64 + worksheet.columnCount) + '2');
        worksheet.getCell('A2').alignment = { horizontal: 'center' };
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Save the file using file-saver
      const fileName = `Records_${dateStr}.xlsx`;
      saveAs(new Blob([buffer]), fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
        
        <button 
          className={`export-btn ${(todaySales.length === 0 && todayExpenses.length === 0) ? 'disabled' : ''}`}
          onClick={handleExportToExcel}
          disabled={isExporting || (todaySales.length === 0 && todayExpenses.length === 0)}
          title={todaySales.length === 0 && todayExpenses.length === 0 ? 'No data to export' : 'Export to Excel'}
        >
          {isExporting ? 'Exporting...' : 'Export to Excel'}
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
                      <th>Discount (%)</th>
                      <th>Total (₹)</th>
                      <th>Mode</th>
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
                        <td>{sale.mrp > 0 ? ((sale.discount / sale.mrp) * 100).toFixed(2) : '0.00'}%</td>
                        <td>{sale.totalAmount.toFixed(2)}</td>
                        <td>{sale.modeOfPayment || 'Cash'}</td>
                        <td className="action-buttons">
                          <button
                            className="update-btn"
                            onClick={() => handleUpdate(sale.id, 'sales')}
                            disabled={isUpdating === sale.id}
                          >
                            {isUpdating === sale.id ? 'Updating...' : 'Update'}
                          </button>
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
                      <th>Mode</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayExpenses.map((expense: Expense) => (
                      <tr key={expense.id}>
                        <td>{formatDate(expense.date)}</td>
                        <td>{expense.name}</td>
                        <td>{expense.amount.toFixed(2)}</td>
                        <td>{expense.modeOfPayment || 'Cash'}</td>
                        <td className="action-buttons">
                          <button
                            className="update-btn"
                            onClick={() => handleUpdate(expense.id, 'expenses')}
                            disabled={isUpdating === expense.id}
                          >
                            {isUpdating === expense.id ? 'Updating...' : 'Update'}
                          </button>
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

      {showUpdateModal && selectedRecord && (
        <UpdateModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          recordType={activeTab}
          record={selectedRecord}
          onUpdate={handleUpdateSubmit}
        />
      )}
    </div>
  );
};

export default TodaysRecords; 