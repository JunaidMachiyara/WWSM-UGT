import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { 
  UserRole, Shop, Product, User, Transaction, Customer, TransactionType,
  ClearingAgent, FreightForwarder, CustomExpenseType, ExpenseAccount,
  Shipment, ShipmentStatus, ShipmentItem
} from '../types';

export interface ExportItem {
  productId: string;
  quantity: number;
  landedCost: number;
}

export interface AddExportPayload {
  shopId: string;
  items: ExportItem[];
  freightForwarder: { id: string; amount: number };
  clearingAgent: { id: string; amount: number };
  customExpense: { typeId: string; amount: number };
  expectedDuty: number;
}

export interface SaleItem {
    productId: string;
    quantity: number;
    salePrice: number;
}

export interface RecordSalePayload {
    shopId: string;
    customerId: string;
    items: SaleItem[];
    cashPaid: number;
}

interface AppContextType {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  shopId: string | null;
  setShopId: (id: string | null) => void;
  shops: Shop[];
  addShop: (shop: Omit<Shop, 'id'>) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  transactions: Transaction[];
  recordSale: (payload: RecordSalePayload & { date: Date }) => void;
  recordPayment: (payload: { shopId: string; customerId: string; amount: number; date: Date; notes?: string }) => void;
  addExpense: (expense: { shopId: string, expenseAccountId: string, description: string, amount: number, date: Date }) => void;
  addExport: (data: AddExportPayload) => void;
  customers: Customer[];
  clearingAgents: ClearingAgent[];
  addClearingAgent: (agent: Omit<ClearingAgent, 'id'>) => void;
  freightForwarders: FreightForwarder[];
  addFreightForwarder: (forwarder: Omit<FreightForwarder, 'id'>) => void;
  customExpenseTypes: CustomExpenseType[];
  addCustomExpenseType: (expenseType: Omit<CustomExpenseType, 'id'>) => void;
  expenseAccounts: ExpenseAccount[];
  addExpenseAccount: (account: Omit<ExpenseAccount, 'id'>) => void;
  shipments: Shipment[];
  receiveShipment: (payload: { shipmentId: string; receivedItems: { productId: string; quantity: number }[] }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [shopId, setShopId] = useState<string | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [clearingAgents, setClearingAgents] = useState<ClearingAgent[]>([]);
  const [freightForwarders, setFreightForwarders] = useState<FreightForwarder[]>([]);
  const [customExpenseTypes, setCustomExpenseTypes] = useState<CustomExpenseType[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<ExpenseAccount[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    const collections: { name: string; setter: Function }[] = [
      { name: 'shops', setter: setShops },
      { name: 'products', setter: setProducts },
      { name: 'users', setter: setUsers },
      { name: 'customers', setter: setCustomers },
      { name: 'clearingAgents', setter: setClearingAgents },
      { name: 'freightForwarders', setter: setFreightForwarders },
      { name: 'customExpenseTypes', setter: setCustomExpenseTypes },
      { name: 'expenseAccounts', setter: setExpenseAccounts },
    ];
  
    const unsubscribes = collections.map(({ name, setter }) => {
      const q = query(collection(db, name));
      return onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setter(data);
      });
    });

    // Special handlers for collections with Timestamps
    const qTransactions = query(collection(db, "transactions"));
    const unsubTransactions = onSnapshot(qTransactions, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => {
            const docData = doc.data();
            return { 
                id: doc.id, 
                ...docData,
                date: (docData.date as Timestamp)?.toDate()
            };
        });
        setTransactions(data as Transaction[]);
    });

    const qShipments = query(collection(db, "shipments"));
    const unsubShipments = onSnapshot(qShipments, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => {
            const docData = doc.data();
            return { 
                id: doc.id, 
                ...docData,
                date: (docData.date as Timestamp)?.toDate()
            };
        });
        setShipments(data as Shipment[]);
    });
  
    return () => {
      unsubscribes.forEach(unsub => unsub());
      unsubTransactions();
      unsubShipments();
    };
  }, []);

  const addShop = async (shop: Omit<Shop, 'id'>) => {
    await addDoc(collection(db, 'shops'), shop);
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    await addDoc(collection(db, 'products'), product);
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    await addDoc(collection(db, 'users'), user);
  };

  const recordSale = async (sale: RecordSalePayload & { date: Date }) => {
    const batch = writeBatch(db);
    const saleDate = sale.date;
    const invoiceId = `inv-${saleDate.getTime()}`;
    const totalAmount = sale.items.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
    
    const isFullCashSale = sale.cashPaid >= totalAmount;
    const saleType = isFullCashSale ? TransactionType.CASH_SALE : TransactionType.CREDIT_SALE;
    const description = isFullCashSale ? 'Cash Sale' : 'Credit Sale';

    sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            const transRef = doc(collection(db, 'transactions'));
            batch.set(transRef, {
                shopId: sale.shopId,
                invoiceId,
                productId: item.productId,
                type: saleType,
                description: `${description}: ${product.name}`,
                amount: item.salePrice,
                quantity: item.quantity,
                customerId: sale.customerId,
                date: Timestamp.fromDate(saleDate),
            });
        }
    });

    if (sale.cashPaid > 0) {
        const receiptRef = doc(collection(db, 'transactions'));
        batch.set(receiptRef, {
            shopId: sale.shopId,
            invoiceId,
            type: TransactionType.SALES_RECEIPT,
            description: `Payment for invoice ${invoiceId}`,
            amount: sale.cashPaid,
            customerId: sale.customerId,
            date: Timestamp.fromDate(saleDate),
        });
    }
    await batch.commit();
  };

  const recordPayment = async (payload: { shopId: string; customerId: string; amount: number; date: Date; notes?: string }) => {
    await addDoc(collection(db, 'transactions'), {
      shopId: payload.shopId,
      customerId: payload.customerId,
      type: TransactionType.SALES_RECEIPT,
      description: payload.notes || `Payment received from customer`,
      amount: payload.amount,
      date: Timestamp.fromDate(payload.date),
    });
  };

  const addExpense = async (expense: { shopId: string, expenseAccountId: string, description: string, amount: number, date: Date }) => {
    await addDoc(collection(db, 'transactions'), {
      shopId: expense.shopId,
      type: TransactionType.EXPENSE,
      expenseAccountId: expense.expenseAccountId,
      description: expense.description,
      amount: expense.amount,
      date: Timestamp.fromDate(expense.date),
    });
  };
  
  const addExport = async (data: AddExportPayload) => {
    const batch = writeBatch(db);
    const now = Timestamp.now();
    
    // 1. Create Shipment
    const shipmentRef = doc(collection(db, 'shipments'));
    const newShipment: Omit<Shipment, 'id'> = {
      shopId: data.shopId,
      date: now.toDate(), // For immediate client-side display, will be converted to TS
      status: ShipmentStatus.PENDING,
      items: data.items.map(item => ({
        productId: item.productId,
        expectedQuantity: item.quantity,
        landedCost: item.landedCost,
      })),
      freightCost: data.freightForwarder.amount,
      clearingCost: data.clearingAgent.amount,
      customExpenseCost: data.customExpense.amount,
      expectedDuty: data.expectedDuty,
    };
    batch.set(shipmentRef, {
        ...newShipment,
        date: now,
    });

    // 2. Record HO expenses
    const HEAD_OFFICE_ACCOUNT_ID = 'HO'; 

    if (data.freightForwarder.amount > 0 && data.freightForwarder.id) {
      const ff = freightForwarders.find(f => f.id === data.freightForwarder.id);
      const expenseRef = doc(collection(db, 'transactions'));
      batch.set(expenseRef, {
        shopId: HEAD_OFFICE_ACCOUNT_ID,
        type: TransactionType.EXPENSE,
        description: `Freight Forwarder: ${ff?.name || 'N/A'} for Shipment #${shipmentRef.id}`,
        amount: data.freightForwarder.amount,
        date: now,
      });
    }
    
    if (data.clearingAgent.amount > 0 && data.clearingAgent.id) {
      const ca = clearingAgents.find(c => c.id === data.clearingAgent.id);
      const expenseRef = doc(collection(db, 'transactions'));
      batch.set(expenseRef, {
        shopId: HEAD_OFFICE_ACCOUNT_ID,
        type: TransactionType.EXPENSE,
        description: `Clearing Agent: ${ca?.name || 'N/A'} for Shipment #${shipmentRef.id}`,
        amount: data.clearingAgent.amount,
        date: now,
      });
    }

    if (data.customExpense.amount > 0 && data.customExpense.typeId) {
      const cet = customExpenseTypes.find(c => c.id === data.customExpense.typeId);
      const expenseRef = doc(collection(db, 'transactions'));
      batch.set(expenseRef, {
        shopId: HEAD_OFFICE_ACCOUNT_ID,
        type: TransactionType.EXPENSE,
        description: `Custom Expense: ${cet?.name || 'N/A'} for Shipment #${shipmentRef.id}`,
        amount: data.customExpense.amount,
        date: now,
      });
    }

    await batch.commit();
  };

  const receiveShipment = async (payload: { shipmentId: string; receivedItems: { productId: string; quantity: number }[] }) => {
    const shipment = shipments.find(s => s.id === payload.shipmentId);
    if (!shipment) return;

    const batch = writeBatch(db);
    const now = Timestamp.now();

    // 1. Create IMPORT transactions for the shop
    const totalOverheads = shipment.freightCost + shipment.clearingCost + shipment.customExpenseCost + shipment.expectedDuty;
    const totalReceivedQuantity = payload.receivedItems.reduce((sum, item) => sum + item.quantity, 0);
    const averageOverheadPerItem = totalReceivedQuantity > 0 ? totalOverheads / totalReceivedQuantity : 0;

    payload.receivedItems.forEach(receivedItem => {
        if (receivedItem.quantity > 0) {
            const originalItem = shipment.items.find(i => i.productId === receivedItem.productId);
            const product = products.find(p => p.id === receivedItem.productId);
            if (originalItem && product) {
                const finalUnitCost = originalItem.landedCost + averageOverheadPerItem;
                const importRef = doc(collection(db, 'transactions'));
                batch.set(importRef, {
                    shopId: shipment.shopId,
                    productId: receivedItem.productId,
                    type: TransactionType.IMPORT,
                    description: `Stock from HO - Shipment #${shipment.id}`,
                    amount: finalUnitCost,
                    quantity: receivedItem.quantity,
                    date: now,
                });
            }
        }
    });

    // 2. Update the shipment status and received quantities
    const shipmentRef = doc(db, 'shipments', payload.shipmentId);
    const updatedItems = shipment.items.map(item => ({
        ...item,
        receivedQuantity: payload.receivedItems.find(ri => ri.productId === item.productId)?.quantity || 0,
    }));
    batch.update(shipmentRef, { 
        status: ShipmentStatus.RECEIVED, 
        items: updatedItems
    });

    await batch.commit();
  };

  const addClearingAgent = async (agent: Omit<ClearingAgent, 'id'>) => {
    await addDoc(collection(db, 'clearingAgents'), agent);
  };

  const addFreightForwarder = async (forwarder: Omit<FreightForwarder, 'id'>) => {
    await addDoc(collection(db, 'freightForwarders'), forwarder);
  };

  const addCustomExpenseType = async (expenseType: Omit<CustomExpenseType, 'id'>) => {
    await addDoc(collection(db, 'customExpenseTypes'), expenseType);
  };

  const addExpenseAccount = async (account: Omit<ExpenseAccount, 'id'>) => {
    await addDoc(collection(db, 'expenseAccounts'), account);
  };

  const value = {
    role, setRole, shopId, setShopId, shops, addShop, products, addProduct,
    users, addUser, transactions, recordSale, recordPayment, addExpense, addExport, customers,
    clearingAgents, addClearingAgent, freightForwarders, addFreightForwarder,
    customExpenseTypes, addCustomExpenseType, expenseAccounts, addExpenseAccount,
    shipments, receiveShipment
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
