import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product-service';
import { CartItem } from '../../../interfaces/cart-item';
import { CartService } from '../../services/cart-service';
import { ToastrService } from 'ngx-toastr';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-product-details',
  imports: [Spinner],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  detailProduct!: any;
  isLoading: boolean = true;

  //On load snapshot of category & id and get product by id from service.
  async ngOnInit() {
    try {
      const category = this.activatedRoute.snapshot.params['category'];
      const id = this.activatedRoute.snapshot.params['id'];
      this.detailProduct = await this.productService.getProductById(id, category);
    } catch (error) {
      this.toastr.error('Product not found. Please try again.');
      this.router.navigate(['/']);
    } finally {
      this.isLoading = false;
    }
  }

  //Add to Cart function
  addToCart() {
    const cartItem: CartItem = {
      id: this.detailProduct.id,
      name: this.detailProduct.name,
      price: this.detailProduct.price,
      image: this.detailProduct.image,
      quantity: 1,
      category: this.detailProduct.category,
    };
    this.cartService.addToCart(cartItem);
  }
}
