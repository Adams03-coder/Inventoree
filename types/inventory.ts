export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  supplierId: string;
  quantity: number;
  minQuantity: number;
  price: number;
  cost: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerId?: string;
  customerName?: string;
  userId: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'sale' | 'purchase' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  userId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  updatedAt: string;
}