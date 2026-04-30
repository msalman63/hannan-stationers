import { Injectable, signal } from '@angular/core';
import { CartItem } from '../../interfaces/cart-item';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  
  // Holds all items currently in the cart
  cartItems = signal<CartItem[]>(
    JSON.parse(localStorage.getItem('cartItems') || '[]')
  );

  //Save Cart Items to local storage 
  private saveToLocalStorage(){
    localStorage.setItem('cartItems' , JSON.stringify(this.cartItems()));
  }
  
  // Controls whether the cart sidebar is visible or not
  isCartOpen = signal<boolean>(false);

  //  Sidebar Controls 

  // Opens the cart sidebar
  openCart() {
    this.isCartOpen.set(true);
  }

  // Closes the cart sidebar
  closeCart() {
    this.isCartOpen.set(false);
  }

  // Toggles the cart sidebar open/close
  toggleCart() {
    this.isCartOpen.set(!this.isCartOpen());
  }

  // Cart Operations

  // Adds item to cart — if already exists, increases quantity by 1
  addToCart(item: CartItem) {
    const currentItems = this.cartItems();
    const existingItem = currentItems.find((c) => c.id === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.set([...currentItems]);
    } else {
      this.cartItems.set([...currentItems, { ...item, quantity: 1 }]);
    }
    this.openCart();
    this.saveToLocalStorage();
  }

  // Removes an item completely from the cart by id
  removeFromCart(item: CartItem) {
    const currentItems = this.cartItems();
    const updatedItems = currentItems.filter((c) => c.id !== item.id);
    this.cartItems.set(updatedItems);
    this.saveToLocalStorage();
  }

  // Increases the quantity of a specific cart item by 1
  increaseQty(item: CartItem) {
    const currentItems = this.cartItems();
    const existingItem = currentItems.find((c) => c.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
      this.cartItems.set([...currentItems]);
    }
    this.saveToLocalStorage();
  }

  // Decreases the quantity by 1 — removes item if quantity reaches 0
  decreaseQty(item: CartItem) {
  const currentItems = this.cartItems();
  const existingItem = currentItems.find((c) => c.id === item.id);
  if (existingItem) {
    existingItem.quantity -= 1;
    if (existingItem.quantity === 0) {
      this.removeFromCart(item); 
    } else {
      this.cartItems.set([...currentItems]);
      this.saveToLocalStorage();
    }
  }
}

  // Calculates and returns the total price of all items in the cart
  getTotal(): number {
    return this.cartItems().reduce(
      (total, item) => total + item.price * item.quantity, 0
    );
  }

  // Clears all items from the cart and closes the sidebar
  clearCart() {
    this.cartItems.set([]);
    this.closeCart();
    this.saveToLocalStorage();
  }
  
}