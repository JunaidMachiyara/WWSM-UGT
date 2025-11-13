
import React, { useState } from 'react';
import { useAppContext } from '../../../context/AppContext';

const FreightForwarderSetup: React.FC = () => {
  const { freightForwarders, addFreightForwarder } = useAppContext();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    addFreightForwarder({ name, contact });
    setName('');
    setContact('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white dark:bg-medium p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Freight Forwarder</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ffName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Forwarder Name</label>
            <input type="text" id="ffName" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary" required />
          </div>
          <div>
            <label htmlFor="ffContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Info</label>
            <input type="text" id="ffContact" value={contact} onChange={e => setContact(e.target.value)} className="mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary" required />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">Add Forwarder</button>
        </form>
      </div>
      <div className="lg:col-span-2 bg-white dark:bg-medium p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Existing Forwarders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-medium divide-y divide-gray-200 dark:divide-gray-700">
              {freightForwarders.map(ff => (
                <tr key={ff.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{ff.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ff.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FreightForwarderSetup;
