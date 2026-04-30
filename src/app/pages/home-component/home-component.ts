import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Slider } from '../../shared/components/slider/slider';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../shared/services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../shared/services/cart-service';
import { CartItem } from '../../interfaces/cart-item';
import { NavigationService } from '../../shared/services/navigation-service';

@Component({
  selector: 'app-home-component',
  imports: [CommonModule, Slider, RouterLink],
  templateUrl: './home-component.html',
  styleUrl: './home-component.css',
})
export class HomeComponent {
  private supabaseService = inject(SupabaseService);
  private cartService = inject(CartService);
  private toastr = inject(ToastrService);
  private navigationService = inject(NavigationService);
  collection1 = signal<any[]>([]);
  collection2 = signal<any[]>([]);
  features = signal<any[]>([]);
  deals = signal<any[]>([]);

  ngOnInit() {
    this.loadHomeData();
  }

  async loadHomeData() {
    try {
      const [stationeryResult, groceryResult, sportsResult, tobaccoResult, dealsResult] =
        await Promise.all([
          this.supabaseService.getAllStationery(),
          this.supabaseService.getAllGrocery(),
          this.supabaseService.getAllSports(),
          this.supabaseService.getAllTobacco(),
          this.supabaseService.getAllDeals(),
        ]);

      //latest collection
      this.collection1.set([
        ...(stationeryResult.data
          ?.slice(0, 3)
          .map((item: any) => ({ ...item, route: '/stationers', category: 'stationery' })) ?? []),
        ...(groceryResult.data
          ?.slice(0, 3)
          .map((item: any) => ({ ...item, route: '/grocery', category: 'grocery' })) ?? []),
      ]);

      //latest collection
      this.collection2.set([
        ...(sportsResult.data
          ?.slice(0, 3)
          .map((item: any) => ({ ...item, route: '/sports', category: 'sports' })) ?? []),
        ...(tobaccoResult.data
          ?.slice(0, 3)
          .map((item: any) => ({ ...item, route: '/tobacco', category: 'tobacco' })) ?? []),
      ]);

      //latest deals
      this.deals.set([
        ...(dealsResult.data?.slice(0, 4).map((item: any) => ({ ...item, route: '/deals' })) ?? []),
      ]);

      //Latest Features
      this.features.set([
        ...(stationeryResult.data
          ?.slice(0, 1)
          .map((item: any) => ({ ...item, route: '/stationers', category: 'stationery' })) ?? []),
        ...(groceryResult.data
          ?.slice(0, 1)
          .map((item: any) => ({ ...item, route: '/grocery', category: 'grocery' })) ?? []),
        ...(sportsResult.data
          ?.slice(0, 1)
          .map((item: any) => ({ ...item, route: '/sports', category: 'sports' })) ?? []),
        ...(tobaccoResult.data
          ?.slice(0, 1)
          .map((item: any) => ({ ...item, route: '/tobacco', category: 'tobacco' })) ?? []),
      ]);
    } catch (error) {
      this.toastr.error('Failed to load home data. Please try again.', 'Error');
    }
  }

  categories = [
    { image: 'images/category1.jpeg', name: 'Stationery', route: '/stationers' },
    { image: 'images/category2.jpeg', name: 'Grocery', route: '/grocery' },
    { image: 'images/category3.jpeg', name: 'Sports', route: '/sports' },
    { image: 'images/category4.jpeg', name: 'Tobacco', route: '/tobacco' },
  ];

  //add to cart function
  addtoCart(product: any) {
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
  productDetails(id: string, category: string) {
    this.navigationService.navigateToProductDetails(id , category);
  }
}
