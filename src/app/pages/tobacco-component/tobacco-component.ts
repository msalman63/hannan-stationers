import { Component, inject, signal } from '@angular/core';
import { Tobacco } from '../../interfaces/tobacco';
import { SupabaseService } from '../../shared/services/supabase-service';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../interfaces/cart-item';
import { NavigationService } from '../../shared/services/navigation-service';
import { CartService } from '../../shared/services/cart-service';
import { Spinner } from "../../shared/components/spinner/spinner";

@Component({
  selector: 'app-tobacco-component',
  imports: [CommonModule, Spinner],
  templateUrl: './tobacco-component.html',
  styleUrl: './tobacco-component.css',
})
export class TobaccoComponent {
  private supabaseService = inject(SupabaseService);
  private cartService = inject(CartService);
  private navigationService = inject(NavigationService);
  tobacco = signal<Tobacco[]>([]);
  isLoading: boolean = true;

  async ngOnInit() {
    await this.loadTobaccos();
    this.isLoading = false;
  }

  async loadTobaccos() {
    if (this.tobacco().length > 0) return;
    const { data, error } = await this.supabaseService.getAllTobacco();
    console.log('loaded Tobacco:', data);
    if (data && !error) this.tobacco.set(data);
  }

  //add to cart function
  addToCart(product: Tobacco) {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: 'tobacco',
    };
    this.cartService.addToCart(cartItem);
  }

  //on click product card goes to product details
  productDetails(id: string, category: string) {
    this.navigationService.navigateToProductDetails(id, category);
  }
}
