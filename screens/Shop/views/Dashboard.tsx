
import React from 'react';
import { useAppContext } from '../../../context/AppContext';
import { Transaction, TransactionType } from '../../../types';
import DashboardCard from '../../../components/DashboardCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const ExpenseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
const ProfitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

const Dashboard: React.FC = () => {
  const { transactions, shopId, products } = useAppContext();
  const shopTransactions = transactions.filter(t => t.shopId === shopId);

  // FIX: Calculate total sales by multiplying amount by quantity.
  const totalSales = shopTransactions.filter(t => t.type === TransactionType.CASH_SALE || t.type === TransactionType.CREDIT_SALE).reduce((sum, t) => sum + (t.amount * (t.quantity || 1)), 0);
  const totalExpenses = shopTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

  const salesTransactions = shopTransactions.filter(t => t.type === TransactionType.CASH_SALE || t.type === TransactionType.CREDIT_SALE);
  let totalCostOfGoods = 0;
  // FIX: Use product's hoCost for accurate cost of goods calculation.
  salesTransactions.forEach(sale => {
      const product = products.find(p => p.id === sale.productId);
      if(product) {
          totalCostOfGoods += product.hoCost * (sale.quantity || 1);
      }
  });

  const netProfit = totalSales - totalCostOfGoods - totalExpenses;

  // Data for chart
  // FIX: Calculate total sales value for each product.
  const salesByProduct = salesTransactions.reduce((acc, curr) => {
    const productName = products.find(p => p.id === curr.productId)?.name || 'Unknown';
    acc[productName] = (acc[productName] || 0) + (curr.amount * (curr.quantity || 1));
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(salesByProduct).map(key => ({
    name: key,
    sales: salesByProduct[key],
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Sales" value={`$${totalSales.toLocaleString()}`} icon={<SalesIcon />} color="bg-blue-500" />
        <DashboardCard title="Total Expenses" value={`$${totalExpenses.toLocaleString()}`} icon={<ExpenseIcon />} color="bg-red-500" />
        <DashboardCard title="Net Profit" value={`$${netProfit.toLocaleString()}`} icon={<ProfitIcon />} color="bg-green-500" />
      </div>

      <div className="bg-white dark:bg-medium p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Sales by Product</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)"/>
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '0.5rem' }} labelStyle={{ color: '#F3F4F6' }}/>
              <Bar dataKey="sales" fill="#8884d8" name="Sales ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
