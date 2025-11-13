
import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { TransactionType } from '../../../types';

const Ledgers: React.FC = () => {
    const { customers, transactions, shopId } = useAppContext();
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

    const shopCustomers = customers.filter(c => c.shopId === shopId);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCustomerId(e.target.value);
    };

    let processedTransactions: (any & { balance: number })[] = [];
    let runningBalance = 0;
    
    if (selectedCustomerId) {
        const customerTransactions = transactions
            .filter(t => t.customerId === selectedCustomerId && t.shopId === shopId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const salesByInvoice = customerTransactions
            .filter(t => t.type === TransactionType.CASH_SALE || t.type === TransactionType.CREDIT_SALE)
            .reduce((acc, t) => {
                const invoiceId = t.invoiceId || `sale-${t.id}`;
                if (!acc[invoiceId]) {
                    acc[invoiceId] = {
                        date: t.date,
                        invoiceId: t.invoiceId,
                        description: `Invoice #${t.invoiceId}`,
                        debit: 0,
                        credit: 0,
                    };
                }
                acc[invoiceId].debit += (t.amount * (t.quantity || 1));
                return acc;
            }, {} as Record<string, any>);

        const receipts = customerTransactions
            .filter(t => t.type === TransactionType.SALES_RECEIPT)
            .map(t => ({
                date: t.date,
                invoiceId: t.invoiceId,
                description: `Payment Received (Invoice #${t.invoiceId})`,
                debit: 0,
                credit: t.amount,
            }));

        const allEntries = [...Object.values(salesByInvoice), ...receipts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        processedTransactions = allEntries.map(entry => {
            runningBalance += entry.debit - entry.credit;
            return { ...entry, balance: runningBalance };
        });
    }

    const currentCustomer = customers.find(c => c.id === selectedCustomerId);

    return (
        <div className="bg-white dark:bg-medium p-8 rounded-lg shadow-lg max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Customer Ledgers</h2>
            <div className="mb-6">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Customer</label>
                <select id="customer" value={selectedCustomerId} onChange={handleCustomerChange} className="mt-1 block w-full md:w-1/2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary">
                    <option value="">-- Select a customer --</option>
                    {shopCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>

            {selectedCustomerId && (
                <div>
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Statement for: <span className="text-primary">{currentCustomer?.name}</span>
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Debit ($)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credit ($)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance ($)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-medium divide-y divide-gray-200 dark:divide-gray-700">
                                {processedTransactions.length > 0 ? processedTransactions.map((entry, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(entry.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.description}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">{entry.debit > 0 ? entry.debit.toFixed(2) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">{entry.credit > 0 ? entry.credit.toFixed(2) : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">{entry.balance.toFixed(2)}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">No transactions found for this customer.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-right mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-lg font-bold text-gray-800 dark:text-white">Final Balance: </span>
                        <span className={`text-lg font-bold ${runningBalance >= 0 ? 'text-primary dark:text-blue-400' : 'text-red-500'}`}>${runningBalance.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ledgers;
