import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../interfaces/order';
import { CommonModule } from '@angular/common';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule , Spinner],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
})
export class AdminOrders {
  private supabaseService = inject(SupabaseService);
  private toastr = inject(ToastrService);

  orders = signal<Order[]>([]);
  isLoading: boolean = false;
  isPageLoading : boolean = true;

  //Logic for row expand on click to see the order items against that particular order
  expandedOrderId = signal<string | null>(null);
  //function
  toggleExpand(order_id: string) {
    if (this.expandedOrderId() === order_id) {
      this.expandedOrderId.set(null);
    } else {
      this.expandedOrderId.set(order_id);
    }
  }
  
  async ngOnInit() {
    await this.loadOrders();
    this.isPageLoading = false;
  }

  //Load all orders from supabase
  private async loadOrders() {
    const { data, error } = await this.supabaseService.getAllOrders();
    if (error) return;
    this.orders.set(data ?? []);
  }

  async updateOrderStatus(order_id: string, status: 'pending' | 'confirmed' | 'delivered') {
    if (!order_id) return;
    this.isLoading = true;
    try {
      await this.supabaseService.updateOrderStatus(order_id, status);
      this.toastr.success('Status Updated Successfully!');
      this.loadOrders();
    } catch (error) {
      this.toastr.error('Failed to update Status!');
    } finally {
      this.isLoading = false;
    }
  }
}
