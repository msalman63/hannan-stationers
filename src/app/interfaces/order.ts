import { OrderItem } from './order-item';

export interface Order {
  id?: string;
  fname: string;
  lname: string;
  phone: string;
  address: string;
  city: string;
  postal: string;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered';
  payment: string;
  created_at?: Date;
  order_items: OrderItem[];
}
