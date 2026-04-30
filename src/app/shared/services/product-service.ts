import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase-service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private supabaseService = inject(SupabaseService);

  //Function to get product by id using checks and supabase get single item functions.
  async getProductById(id: string, category: string) {
    let productDetail: any = null;
    if (category === 'stationery') {
      productDetail = await this.supabaseService.getSingleStationery(id);
    } else if (category === 'grocery') {
      productDetail = await this.supabaseService.getSingleGroceryItem(id);
    } else if (category === 'sports') {
      productDetail = await this.supabaseService.getSingleSportsItem(id);
    } else if (category === 'tobacco') {
      productDetail = await this.supabaseService.getSingleTobaccoItem(id);
    } else if (category === 'deals') {
      productDetail = await this.supabaseService.getSingleDealsItem(id);
    }
    return productDetail;
  }
}
