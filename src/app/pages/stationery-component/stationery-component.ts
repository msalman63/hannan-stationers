import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase-service';
import { Stationery } from '../../interfaces/stationery';
import { CommonModule } from '@angular/common';
import { CartService } from '../../shared/services/cart-service';
import { CartItem } from '../../interfaces/cart-item';
import { NavigationService } from '../../shared/services/navigation-service';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-stationery-component',
  imports: [CommonModule , Spinner],
  templateUrl: './stationery-component.html',
  styleUrl: './stationery-component.css',
})
export class StationeryComponent {
  private supabaseService = inject(SupabaseService);
  private cartService = inject(CartService);
  private navigationService = inject(NavigationService);
  stationery = signal<Stationery[]>([]);
  isLoading : boolean = true;

  async ngOnInit() {
    await this.loadStationery();
    this.isLoading = false;
  }

  async loadStationery() {
    if (this.stationery().length > 0) return;
    const { data, error } = await this.supabaseService.getAllStationery();
    console.log('loaded Stationery:', data);
    if (data && !error) this.stationery.set(data);
  }

  //Add to cart function
  addToCart(product: Stationery) {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: 'stationery',
    };
    this.cartService.addToCart(cartItem);
  }

  //on click product card goes to product details
  productDetails(id : string , category : string){
    this.navigationService.navigateToProductDetails(id , category);
  }
}
