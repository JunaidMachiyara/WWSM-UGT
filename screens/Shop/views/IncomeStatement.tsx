
import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { TransactionType } from '../../../types';

const IncomeStatement: React.FC = () => {
    const { transactions, shopId, products } = useAppContext();
    const shopTransactions = transactions.filter(t => t.shopId === shopId);

    const totalSales = shopTransactions.filter(t => t.type === TransactionType.CASH_SALE || t.type === TransactionType.CREDIT_SALE).reduce((sum, t) => sum + t.amount * (t.quantity || 1), 0);
    const totalExpenses = shopTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

    const salesTransactions = shopTransactions.filter(t => t.type === TransactionType.CASH_SALE || t.type === TransactionType.CREDIT_SALE);
    let totalCostOfGoods = 0;

    salesTransactions.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if(product) {
            totalCostOfGoods += product.hoCost * (sale.quantity || 1);
        }
    });

    const grossProfit = totalSales - totalCostOfGoods;
    const netProfit = grossProfit - totalExpenses;

  return (
    <div className="bg-white dark:bg-medium p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Income Statement</h2>
      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <div className="flow-root">
          <dl className="-my-4 text-sm divide-y divide-gray-200 dark:divide-gray-700">
            <div className="py-4 sm:flex sm:items-center sm:justify-between">
              <dt className="font-medium text-gray-900 dark:text-white">Total Revenue (Sales)</dt>
              <dd className="mt-1 font-medium text-green-600 dark:text-green-400 sm:mt-0">{`$${totalSales.toFixed(2)}`}</dd>
            </div>
            <div className="py-4 sm:flex sm:items-center sm:justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Cost of Goods Sold (COGS)</dt>
              <dd className="mt-1 font-medium text-red-600 dark:text-red-400 sm:mt-0">{`($${totalCostOfGoods.toFixed(2)})`}</dd>
            </div>
            <div className="py-4 sm:flex sm:items-center sm:justify-between font-bold">
              <dt className="text-gray-900 dark:text-white">Gross Profit</dt>
              <dd className="mt-1 text-gray-900 dark:text-white sm:mt-0">{`$${grossProfit.toFixed(2)}`}</dd>
            </div>
             <div className="py-4 sm:flex sm:items-center sm:justify-between">
              <dt className="text-gray-600 dark:text-gray-400">Operating Expenses</dt>
              <dd className="mt-1 font-medium text-red-600 dark:text-red-400 sm:mt-0">{`($${totalExpenses.toFixed(2)})`}</dd>
            </div>
            <div className="py-4 sm:flex sm:items-center sm:justify-between text-lg font-bold">
              <dt className="text-primary dark:text-blue-400">Net Profit</dt>
              <dd className="mt-1 text-primary dark:text-blue-400 sm:mt-0">{`$${netProfit.toFixed(2)}`}</dd>
            </div>
          </dl>
        </div>
      </div>
       <p className="text-center mt-6 text-xs text-gray-500 dark:text-gray-400">This is a simplified real-time income statement based on recorded transactions.</p>
    </div>
  );
};

export default IncomeStatement;
