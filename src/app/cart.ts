import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import {RouterLink, Router} from '@angular/router';
import {Location} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {CartService} from './services/cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-cart',
  imports: [RouterLink, MatIconModule],
  template: `
    <main class="min-h-screen pt-[100px] sm:pt-[120px] pb-[64px] px-4 sm:px-6 max-w-[1200px] mx-auto">
      <div class="mb-6 sm:mb-[32px]">
        <button (click)="goBack()" class="text-brand-900/60 hover:text-brand-900 transition-colors label-md flex items-center bg-transparent border-none cursor-pointer p-0">
          <mat-icon class="mr-2 text-[18px]">arrow_back</mat-icon> Back
        </button>
      </div>
      <div class="flex items-center justify-between mb-8 sm:mb-[48px]">
        <h1 class="font-serif text-[28px] sm:text-[40px] lg:text-[52px] text-brand-900">Your Cart</h1>
        @if (cartService.totalItems() > 0) {
          <button (click)="cartService.clearCart()" class="text-brand-900/60 hover:text-red-600 transition-colors label-md flex items-center gap-1.5 bg-brand-50 hover:bg-red-50 border border-brand-200 hover:border-red-200 cursor-pointer px-4 py-2 rounded-xl">
            <mat-icon class="text-[18px]">delete_sweep</mat-icon> Clear Cart
          </button>
        }
      </div>

      @if (cartService.totalItems() === 0) {
        <div class="bg-white rounded-[24px] sm:rounded-[32px] p-10 sm:p-[64px] text-center border border-brand-100 shadow-sm">
          <mat-icon class="text-[56px] sm:text-[64px] text-brand-200 mb-5 sm:mb-[24px]">shopping_bag</mat-icon>
          <h2 class="font-serif text-[26px] sm:text-[32px] text-brand-900 mb-4 sm:mb-[16px]">Your cart is empty</h2>
          <p class="body-md text-brand-900/60 mb-6 sm:mb-[32px] text-[14px] sm:text-[16px]">Looks like you haven't added any items to your cart yet.</p>
          <a routerLink="/learn" class="btn-primary inline-flex items-center gap-2">
            Explore our services and products
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-[48px]">
          <!-- Cart Items -->
          <div class="lg:col-span-2 flex flex-col gap-4 sm:gap-[24px]">
            @for (item of cartService.items(); track item.id) {
              <div class="flex items-center gap-4 sm:gap-[24px] bg-white p-4 sm:p-[24px] rounded-[20px] sm:rounded-[24px] border border-brand-100 shadow-sm">
                <img [src]="item.image" [alt]="item.name" class="w-20 h-20 sm:w-[120px] sm:h-[120px] object-cover rounded-[12px] sm:rounded-[16px] shrink-0" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                
                <div class="flex-1 min-w-0">
                  <h3 class="font-serif text-[17px] sm:text-[22px] text-brand-900 mb-1 sm:mb-[8px] leading-snug">{{ item.name }}</h3>
                  <p class="text-brand-600 font-medium mb-3 sm:mb-[16px] text-[14px] sm:text-[16px]">LKR {{ item.price.toLocaleString() }}</p>
                  
                  <div class="flex items-center gap-4 sm:gap-[16px]">
                      <span class="px-3 font-medium text-[12px] sm:text-[14px]">Qty: 1</span>
                    <button (click)="cartService.removeItem(item.id)" class="text-brand-900/40 hover:text-red-500 transition-colors text-[12px] sm:text-[14px] uppercase tracking-wider font-medium">
                      Remove
                    </button>
                  </div>
                </div>
                
                <div class="text-right shrink-0">
                  <p class="font-medium text-brand-900 text-[14px] sm:text-[16px]">LKR {{ (item.price * item.quantity).toLocaleString() }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div class="bg-brand-900 text-white p-6 sm:p-[40px] rounded-[24px] sm:rounded-[32px] h-fit lg:sticky lg:top-[120px]">
            <h2 class="font-serif text-[26px] sm:text-[32px] mb-6 sm:mb-[32px]">Order Summary</h2>
            
            <div class="flex flex-col gap-3 sm:gap-[16px] mb-6 sm:mb-[32px] body-md">
              <div class="flex justify-between text-white/80 text-[14px] sm:text-[16px]">
                <span>Subtotal ({{ cartService.totalItems() }} items)</span>
                <span>LKR {{ cartService.totalPrice().toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-white/80 text-[14px] sm:text-[16px]">
                <span>Delivery</span>
                <span>Instant access</span>
              </div>
            </div>
            
            <div class="border-t border-white/20 pt-6 sm:pt-[32px] mb-8 sm:mb-[40px]">
              <div class="flex justify-between font-serif text-[20px] sm:text-[24px]">
                <span>Total</span>
                <span>LKR {{ cartService.totalPrice().toLocaleString() }}</span>
              </div>
            </div>
            
            <button (click)="checkout()" class="w-full bg-white text-brand-900 py-4 sm:py-[16px] rounded-full label-md hover:bg-brand-50 transition-colors mb-4 sm:mb-[16px] flex justify-center items-center gap-2">
              <mat-icon>lock</mat-icon> Secure Checkout
            </button>
            <p class="text-center text-white/60 text-[12px]">All prices are final. No hidden fees.</p>
          </div>
        </div>
      }
    </main>
  `
})
export class Cart implements OnInit {
  cartService = inject(CartService);
  private location = inject(Location);
  private router = inject(Router);

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  goBack() {
    this.location.back();
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }
}
