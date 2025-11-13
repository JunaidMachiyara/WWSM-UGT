
import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { SaleItem } from '../../../context/AppContext';
import { TransactionType } from '../../../types';

interface InvoiceItem extends SaleItem {
  stock: number;
  minSalePrice?: number;
}

const Sales: React.FC = () => {
  const { shopId, products, recordSale, customers, transactions } = useAppContext();
  
  const [items, setItems] = useState<InvoiceItem[]>([{ productId: '', quantity: 1, salePrice: 0, stock: 0, minSalePrice: 0 }]);
  const [customerId, setCustomerId] = useState('');
  const [cashPaid, setCashPaid] = useState(0);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [successMessage, setSuccessMessage] = useState('');
  
  const shopCustomers = customers.filter(c => c.shopId === shopId);

  const getStockLevel = (productId: string): number => {
    if (!productId || !shopId) return 0;
    
    const shopTransactions = transactions.filter(t => t.shopId === shopId);

    const imports = shopTransactions
      .filter(t => t.productId === productId && t.type === TransactionType.IMPORT)
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
    
    const sales = shopTransactions
      .filter(t => t.productId === productId && (t.type === TransactionType.CASH_SALE || t.type === TransactionType.CREDIT_SALE))
      .reduce((sum, t) => sum + (t.quantity || 0), 0);

    return imports - sales;
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'productId') {
        const newProductId = value as string;
        item.productId = newProductId;
        item.stock = getStockLevel(newProductId);
        const product = products.find(p => p.id === newProductId);
        item.minSalePrice = product?.minSalePrice;
    } else if (field === 'quantity' || field === 'salePrice') {
        (item as any)[field] = Number(value) < 0 ? 0 : Number(value);
    }
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { productId: '', quantity: 1, salePrice: 0, stock: 0, minSalePrice: 0 }]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const resetForm = () => {
    setItems([{ productId: '', quantity: 1, salePrice: 0, stock: 0, minSalePrice: 0 }]);
    setCustomerId('');
    setCashPaid(0);
    setSaleDate(new Date().toISOString().split('T')[0]);
  };

  const totalAmount = items.reduce((sum, item) => sum + ((item.salePrice || 0) * (item.quantity || 1)), 0);
  const creditAmount = totalAmount - (cashPaid || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const stockErrorItem = items.find(i => i.quantity > i.stock);
    if (stockErrorItem) {
        const product = products.find(p => p.id === stockErrorItem.productId);
        alert(`Sale quantity for "${product?.name}" (${stockErrorItem.quantity}) exceeds available stock (${stockErrorItem.stock}).`);
        return;
    }

    if (!shopId || !customerId || !saleDate || items.some(i => !i.productId || i.quantity <= 0 || i.salePrice <= 0)) {
      alert('Please select a customer, date, and fill all item details correctly (quantity and price must be greater than zero).');
      return;
    }
    if (cashPaid < 0) {
      alert('Cash paid amount cannot be negative.');
      return;
    }
     if (cashPaid > totalAmount) {
      alert(`Cash paid cannot exceed the total amount of $${totalAmount.toFixed(2)}.`);
      return;
    }

    // To avoid timezone issues where new Date('YYYY-MM-DD') might result in the previous day in some timezones.
    const dateForTransaction = new Date(saleDate + 'T00:00:00');

    recordSale({
      shopId,
      customerId,
      items,
      cashPaid: cashPaid || 0,
      date: dateForTransaction,
    });

    setSuccessMessage('Sale recorded successfully!');
    resetForm();
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Record New Invoice</h2>
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer</label>
                <select id="customer" value={customerId} onChange={e => setCustomerId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:outline-none focus:ring-primary" required>
                    <option value="">Select a customer</option>
                    {shopCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700">Invoice Date</label>
                <input type="date" id="saleDate" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:outline-none focus:ring-primary" required />
            </div>
        </div>


        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Items</h3>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border-t border-gray-200 pt-4 first:pt-0 first:border-none">
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:outline-none focus:ring-primary" required>
                    <option value="">Select a product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">In Stock</label>
                  <div className="mt-1 p-2 h-[42px] flex items-center">
                    {item.productId ? (
                        <span className="font-semibold text-gray-700">{item.stock}</span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:outline-none focus:ring-primary" min="1" required />
                  {item.quantity > item.stock && item.stock >= 0 && item.productId && (
                      <p className="text-xs text-red-500 mt-1">Exceeds stock!</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Sale Price/Unit</label>
                  <input type="number" placeholder="Price" value={item.salePrice} onChange={e => handleItemChange(index, 'salePrice', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:outline-none focus:ring-primary" min="0.01" step="0.01" required />
                  {item.salePrice > 0 && item.minSalePrice && item.salePrice < item.minSalePrice && (
                      <p className="text-xs text-yellow-500 mt-1">Below min price (${item.minSalePrice.toFixed(2)})</p>
                  )}
                </div>
                <div className="md:col-span-1 text-right">
                    <label className="block text-sm font-medium text-gray-700">Total</label>
                    <p className="mt-1 p-2 font-semibold">${((item.quantity || 1) * (item.salePrice || 0)).toFixed(2)}</p>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-transparent hidden md:block">&nbsp;</label>
                  <button type="button" onClick={() => removeItemRow(index)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg disabled:opacity-50" disabled={items.length <= 1}>X</button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItemRow} className="mt-4 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg">+ Add Item</button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h3>
            <div className="space-y-4">
                <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-gray-800">Total Invoice Amount:</span>
                    <span className="text-primary">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <label htmlFor="cashPaid" className="text-gray-700 font-medium">Amount Paid (Cash):</label>
                    <input type="number" id="cashPaid" value={cashPaid} onChange={e => setCashPaid(parseFloat(e.target.value) || 0)} className="w-1/3 text-right border border-gray-300 rounded-md shadow-sm p-2 bg-white text-gray-900 focus:outline-none focus:ring-primary" min="0" step="0.01" />
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                     <span className="text-gray-600">Amount on Credit:</span>
                    <span className="text-red-500">${creditAmount > 0 ? creditAmount.toFixed(2) : '0.00'}</span>
                </div>
            </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition duration-300">
            Record Sale
          </button>
        </div>
      </form>
    </div>
  );
};

export default Sales;