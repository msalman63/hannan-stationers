import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CustomerInfo } from '../../../interfaces/customer-info';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  customerForm!: FormGroup;
  isLoading: boolean = false;
  private supabaseService = inject(SupabaseService);
  private toastr = inject(ToastrService);
  public cartService = inject(CartService);
  private router = inject(Router);

  //Getter Function for shipping cost
  get shippingCost(): number {
    if (this.cartService.getTotal() >= 2000) {
      return 0;
    } else {
      return 200;
    }
  }

  //Getting final total
  get finalTotal(): number {
    return this.cartService.getTotal() + this.shippingCost;
  }
  constructor(private fb: FormBuilder) {
    this.customerForm = this.fb.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      phone: ['', Validators.required],
      postal: ['', Validators.required],
    });
  }

  async onSubmit() {
    // Stop if form is invalid
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    if (this.cartService.cartItems().length === 0) {
      this.toastr.warning('Your cart is empty!');
      return;
    }
    this.isLoading = true;
    try {
      const customerData: CustomerInfo = {
        fname: this.customerForm.value.fname,
        lname: this.customerForm.value.lname,
        address: this.customerForm.value.address,
        city: this.customerForm.value.city,
        phone: this.customerForm.value.phone,
        postal: this.customerForm.value.postal,
      };
      await this.supabaseService.saveOrder(
        customerData,
        this.cartService.cartItems(),
        this.shippingCost,
        this.finalTotal,
      );
      this.cartService.clearCart();
      await Swal.fire({
        icon: 'success',
        title: 'Order Successful',
        text: 'Your order has been placed! We will contact you soon.',
        padding: '2em',
        confirmButtonText: 'Go To Home',
        customClass: {
          confirmButton:
            'grad-amber-btn px-8 py-3 rounded-lg font-heading font-semibold text-sm text-white cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all duration-200',
        },
        buttonsStyling: false,
      });
      this.router.navigate(['/']);
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to place order. Please try again.');
    } finally {
      this.customerForm.reset();
      this.isLoading = false;
    }
  }

  //Go to home on click
  goToHome(){
    this.router.navigate(['/']);
  }
}
