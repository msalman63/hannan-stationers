import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase-service';
import { Sports } from '../../interfaces/sports';
import { CartService } from '../../shared/services/cart-service';
import { CartItem } from '../../interfaces/cart-item';
import { NavigationService } from '../../shared/services/navigation-service';
import { Spinner } from '../../shared/components/spinner/spinner';


@Component({
  selector: 'app-sports-component',
  imports: [CommonModule , Spinner],
  templateUrl: './sports-component.html',
  styleUrl: './sports-component.css',
})
export class SportsComponent {
  private supabaseService = inject(SupabaseService);
  private cartService = inject(CartService);
  private navigationService = inject(NavigationService);
  sports = signal<Sports[]>([]);
  isLoading : boolean = true;

  async ngOnInit() {
    await this.loadSports();
    this.isLoading = false;
  }

  async loadSports() {
    if (this.sports().length > 0) return;
    const { data, error } = await this.supabaseService.getAllSports();
    console.log('loaded Sports:', data);
    if (data && !error) this.sports.set(data);
  }

  //add to cart function
  addToCart(product : Sports){
    const cartItem : CartItem = {
      id : product.id,
      name : product.name,
      price : product.price,
      image : product.image,
      quantity : 1,
      category : 'sports'
    }
    this.cartService.addToCart(cartItem);
  }

  //On click the card, do to product details
  productDetails(id : string , category : string){
    this.navigationService.navigateToProductDetails(id ,category);
  }
}
