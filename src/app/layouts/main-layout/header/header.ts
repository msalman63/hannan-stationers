import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../../shared/services/supabase-service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../shared/services/cart-service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private supabaseService = inject(SupabaseService);
  public cartService = inject(CartService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  isLoggedIn: boolean = false;
  userSubscription!: any;

  ngOnInit() {
    this.loggedIn();
    this.userSubscription = this.supabaseService.authChanges((event, session) : any => {
      if (session) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }
  async loggedIn() {
    const session = await this.supabaseService.getSession();
    if (session) {
      this.isLoggedIn = true;
    }
  }

  async logOut() {
    this.isLoggedIn = false;
    await this.supabaseService.signOut();
    this.toastr.success('Logged Out Successfully');
    this.router.navigate(['/']);
  }

  isMenuOpen: boolean = false;
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  ngOnDestroy(){
    if(this.userSubscription) this.userSubscription.data.subscription.unsubscribe();
  }
}
