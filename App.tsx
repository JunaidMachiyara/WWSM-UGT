
import React from 'react';
import { useAppContext } from './context/AppContext';
import HODashboard from './screens/HeadOffice/HODashboard';
import ShopDashboard from './screens/Shop/ShopDashboard';
import { UserRole } from './types';

const App: React.FC = () => {
  const { role, setRole, shopId, setShopId, shops } = useAppContext();

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-medium p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center text-primary dark:text-light mb-6">WWSM_UGT</h1>
          <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-300 mb-8">Select Your Role</h2>
          <div className="space-y-4">
            <button
              onClick={() => setRole(UserRole.HEAD_OFFICE)}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Head Office Admin
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white dark:bg-medium text-sm text-gray-500 dark:text-gray-400">or</span>
              </div>
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  setShopId(e.target.value);
                  setRole(UserRole.SHOP_OPERATOR);
                }
              }}
              defaultValue=""
              className="w-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            >
              <option value="" disabled>Select a Retail Shop</option>
              {shops.map(shop => (
                <option key={shop.id} value={shop.id}>{shop.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {role === UserRole.HEAD_OFFICE ? <HODashboard /> : <ShopDashboard />}
    </>
  );
};

export default App;
