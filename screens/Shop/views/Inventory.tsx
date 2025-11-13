
import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { TransactionType } from '../../../types';

const Inventory: React.FC = () => {
  const { transactions, shopId, products } = useAppContext();
  const shopTransactions = transactions.filter(t => t.shopId === shopId);

  const inventoryLevels = products.map(product => {
    const imports = shopTransactions
      .filter(t => t.productId === product.id && t.type === TransactionType.IMPORT)
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
    
    const sales = shopTransactions
      .filter(t => t.productId === product.id && (t.type === TransactionType.CASH_SALE || t.type === TransactionType.CREDIT_SALE))
      .reduce((sum, t) => sum + (t.quantity || 0), 0);

    return {
      ...product,
      stock: imports - sales
    };
  });

  return (
    <div className="bg-white dark:bg-medium p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Current Inventory Status</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock on Hand</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-medium divide-y divide-gray-200 dark:divide-gray-700">
            {inventoryLevels.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">{item.stock} units</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
