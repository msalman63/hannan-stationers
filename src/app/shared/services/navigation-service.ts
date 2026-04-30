import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private router = inject(Router);
  navigateToProductDetails(id: string, category: string) {
    this.router.navigate(['product', category, id]);
  }
}
