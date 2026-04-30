import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase-service';
import { CartService } from '../../shared/services/cart-service';
import { Deals } from '../../interfaces/deals';
import { CartItem } from '../../interfaces/cart-item';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../shared/services/navigation-service';
import { Spinner } from '../../shared/components/spinner/spinner';


@Component({
  selector: 'app-deals-component',
  imports: [CommonModule , Spinner],
  templateUrl: './deals-component.html',
  styleUrl: './deals-component.css',
})
export class DealsComponent {
  private supabaseService = inject(SupabaseService);
  private cartService = inject(CartService);
  private navigationService = inject(NavigationService);
  deals = signal<Deals[]>([]);

  isLoading : boolean = true;

  async ngOnInit() {
    await this.loadDeals();
    this.isLoading = false;
  }

  async loadDeals() {
    if (this.deals.length > 0) return;
    const { data, error } = await this.supabaseService.getAllDeals();
    if (data && !error) this.deals.set(data);
  }

  //Add to cart function
  addToCart(product: Deals) {
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      category: product.category,
    };
    this.cartService.addToCart(cartItem);
  }
   //Product details component on product click
   productDetails(id : string , category : string){
    this.navigationService.navigateToProductDetails(id , category);
   }
}
