import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase-service';
import { Grocery } from '../../interfaces/grocery';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../interfaces/cart-item';
import { CartService } from '../../shared/services/cart-service';
import { NavigationService } from '../../shared/services/navigation-service';
import { Spinner } from '../../shared/components/spinner/spinner';


@Component({
  selector: 'app-grocery-component',
  imports: [CommonModule , Spinner],
  templateUrl: './grocery-component.html',
  styleUrl: './grocery-component.css',
})
export class GroceryComponent {
  private supabaseService = inject(SupabaseService);
  private cartService = inject(CartService);
  private navigationService = inject(NavigationService);
  grocery = signal<Grocery[]>([]);
  isLoading: boolean = true;

  async ngOnInit() {
    await this.loadGrocery();
    this.isLoading = false;
  }

  async loadGrocery() {
    if (this.grocery().length > 0) return;
    const { data, error } = await this.supabaseService.getAllGrocery();
    if (data && !error) this.grocery.set(data);
  }

  //Add to cart function
  addToCart(product: Grocery) {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: 'grocery',
    };
    this.cartService.addToCart(cartItem);
  }

  //Navigate to product details
  productDetails(id: string, category: string) {
    this.navigationService.navigateToProductDetails(id, category);
  }
}
