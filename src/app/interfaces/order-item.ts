export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  category: string;
  created_at?: Date;
}
