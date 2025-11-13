import React, { useState } from 'react';
import Layout from '../../components/Layout';
import ShopSidebar from './ShopSidebar';
import Dashboard from './views/Dashboard';
import Sales from './views/Sales';
import Expenses from './views/Expenses';
import Inventory from './views/Inventory';
import IncomeStatement from './views/IncomeStatement';
import Ledgers from './views/Ledgers';
import ReceiptVoucher from './views/ReceiptVoucher';
import ReceiveStock from './views/ReceiveStock';

export type ShopView = 'dashboard' | 'sales' | 'expenses' | 'inventory' | 'reports-income' | 'reports-ledgers' | 'receiptVoucher' | 'receiveStock';

const ShopDashboard: React.FC = () => {
  const [view, setView] = useState<ShopView>('dashboard');

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'receiveStock':
        return <ReceiveStock />;
      case 'sales':
        return <Sales />;
      case 'receiptVoucher':
        return <ReceiptVoucher />;
      case 'expenses':
        return <Expenses />;
      case 'inventory':
        return <Inventory />;
      case 'reports-income':
        return <IncomeStatement />;
      case 'reports-ledgers':
        return <Ledgers />;
      default:
        return <Dashboard />;
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'dashboard': return 'Shop Dashboard';
      case 'receiveStock': return 'Receive Stock from HO';
      case 'sales': return 'Sales & Receivables';
      case 'receiptVoucher': return 'Receipt Voucher';
      case 'expenses': return 'Expenses & Payables';
      case 'inventory': return 'Inventory Management';
      case 'reports-income': return 'Income Statement';
      case 'reports-ledgers': return 'Customer Ledgers';
      default: return 'Dashboard';
    }
  };

  return (
    <Layout sidebar={<ShopSidebar activeView={view} setView={setView} />} title={getTitle()}>
      {renderView()}
    </Layout>
  );
};

export default ShopDashboard;