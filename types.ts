export enum UserRole {
  HEAD_OFFICE = 'HEAD_OFFICE',
  SHOP_OPERATOR = 'SHOP_OPERATOR',
}

export enum TransactionType {
  CASH_SALE = 'CASH_SALE',
  CREDIT_SALE = 'CREDIT_SALE',
  SALES_RECEIPT = 'SALES_RECEIPT',
  EXPENSE = 'EXPENSE',
  IMPORT = 'IMPORT', // From Head Office to Shop
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
}

export interface ShipmentItem {
    productId: string;
    expectedQuantity: number;
    receivedQuantity?: number; // Filled by shop upon receipt
    landedCost: number; // Cost per unit from HO
}

export interface Shipment {
  id: string;
  shopId: string;
  date: Date;
  status: ShipmentStatus;
  items: ShipmentItem[];
  freightCost: number;
  clearingCost: number;
  customExpenseCost: number;
  expectedDuty: number;
}

export interface Shop {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  hoCost: number; // Head Office cost
  minSalePrice: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  shopId?: string; // Only for SHOP_OPERATOR
}

export interface Customer {
    id: string;
    name: string;
    shopId: string;
    phone?: string;
    reference?: string;
}

export interface Transaction {
  id: string;
  shopId: string;
  invoiceId?: string;
  productId?: string;
  type: TransactionType;
  description: string;
  amount: number; // For sales, it's price per unit. For expenses/receipts, it's total cost.
  quantity?: number; // For sales and imports
  customerId?: string; // For all sales and receipts
  expenseAccountId?: string; // For EXPENSE type
  date: Date;
}

// For Head Office specific setups
export interface ClearingAgent {
    id: string;
    name: string;
    contact: string;
}

export interface FreightForwarder {
    id: string;
    name: string;
    contact: string;
}

export interface CustomExpenseType {
    id: string;
    name: string;
    description: string;
}

export interface ExpenseAccount {
  id: string;
  name: string;
  description: string;
}