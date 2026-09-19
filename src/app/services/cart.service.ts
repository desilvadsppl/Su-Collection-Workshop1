import {Injectable, computed, signal} from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  checkoutDraft = signal<any>(null);

  items = this.cartItems.asReadonly();
  
  totalItems = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
  totalPrice = computed(() => this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0));

  hasItem(productId: string): boolean {
    return this.cartItems().some(i => i.id === productId);
  }

  addItem(product: any) {
    this.cartItems.update(items => {
      const existingItem = items.find(i => i.id === product.id);
      if (existingItem) {
        return items; // Already in cart, do nothing
      }
      return [...items, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      }];
    });
  }

  removeItem(productId: string) {
    this.cartItems.update(items => items.filter(i => i.id !== productId));
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
