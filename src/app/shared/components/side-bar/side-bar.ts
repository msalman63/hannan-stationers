import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  imports: [],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  public cartService = inject(CartService);
  private router = inject(Router);

  goToCheckout() {
    this.cartService.closeCart();
    this.router.navigate(['/checkout']);
  }
}
