import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, Category, Supplier, Sale, StockMovement } from '../types/inventory';

const STORAGE_KEYS = {
  PRODUCTS: 'inventoree_products',
  CATEGORIES: 'inventoree_categories',
  SUPPLIERS: 'inventoree_suppliers',
  SALES: 'inventoree_sales',
  STOCK_MOVEMENTS: 'inventoree_stock_movements',
};

interface InventoryContextType {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  sales: Sale[];
  stockMovements: StockMovement[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt'>) => Promise<Supplier>;
  updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  recordSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => Promise<Sale>;
  getLowStockProducts: () => Product[];
  getTotalInventoryValue: () => number;
  getSalesAnalytics: (days?: number) => {
    totalSales: number;
    totalRevenue: number;
    totalQuantitySold: number;
    averageOrderValue: number;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedProducts, storedCategories, storedSuppliers, storedSales, storedMovements] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS),
          AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES),
          AsyncStorage.getItem(STORAGE_KEYS.SUPPLIERS),
          AsyncStorage.getItem(STORAGE_KEYS.SALES),
          AsyncStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS),
        ]);

      setProducts(storedProducts ? JSON.parse(storedProducts) : []);
      setCategories(storedCategories ? JSON.parse(storedCategories) : []);
      setSuppliers(storedSuppliers ? JSON.parse(storedSuppliers) : []);
      setSales(storedSales ? JSON.parse(storedSales) : []);
      setStockMovements(storedMovements ? JSON.parse(storedMovements) : []);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // --- CRUD functions ---
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...products, newProduct];
    setProducts(updated);
    await saveData(STORAGE_KEYS.PRODUCTS, updated);
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
    setProducts(updated);
    await saveData(STORAGE_KEYS.PRODUCTS, updated);
  };

  const deleteProduct = async (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    await saveData(STORAGE_KEYS.PRODUCTS, updated);
  };

  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = { ...categoryData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updated = [...categories, newCategory];
    setCategories(updated);
    await saveData(STORAGE_KEYS.CATEGORIES, updated);
    return newCategory;
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const updated = categories.map(c => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updated);
    await saveData(STORAGE_KEYS.CATEGORIES, updated);
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    await saveData(STORAGE_KEYS.CATEGORIES, updated);
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSupplier: Supplier = { ...supplierData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updated = [...suppliers, newSupplier];
    setSuppliers(updated);
    await saveData(STORAGE_KEYS.SUPPLIERS, updated);
    return newSupplier;
  };

  const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
    const updated = suppliers.map(s => (s.id === id ? { ...s, ...updates } : s));
    setSuppliers(updated);
    await saveData(STORAGE_KEYS.SUPPLIERS, updated);
  };

  const deleteSupplier = async (id: string) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    await saveData(STORAGE_KEYS.SUPPLIERS, updated);
  };

  const recordSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = { ...saleData, id: Date.now().toString(), createdAt: new Date().toISOString() };
    const updated = [...sales, newSale];
    setSales(updated);
    await saveData(STORAGE_KEYS.SALES, updated);
    return newSale;
  };

  // --- Reporting/Analytics functions ---
  const getLowStockProducts = () => products.filter(p => p.quantity <= p.minQuantity);

  const getTotalInventoryValue = () => products.reduce((total, p) => total + p.quantity * p.cost, 0);

  const getSalesAnalytics = (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const periodSales = sales.filter(s => new Date(s.createdAt) >= startDate);

    const totalRevenue = periodSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalSales = periodSales.length;
    const totalQuantitySold = periodSales.reduce((sum, s) => sum + s.quantity, 0);
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    return { totalRevenue, totalSales, totalQuantitySold, averageOrderValue };
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        suppliers,
        sales,
        stockMovements,
        isLoading,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        recordSale,
        getLowStockProducts,
        getTotalInventoryValue,
        getSalesAnalytics,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within InventoryProvider');
  return context;
};
