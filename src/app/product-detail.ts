import {ChangeDetectionStrategy, Component, computed, inject, signal, OnInit} from '@angular/core';
import {RouterLink, ActivatedRoute, Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {db} from '../lib/firebase';
import {doc, getDoc} from 'firebase/firestore';
import {CartService} from './services/cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-product-detail',
  imports: [RouterLink, MatIconModule],
  template: `
    <main class="min-h-screen pt-[120px] pb-[64px] px-6 max-w-[1200px] mx-auto">
      <a routerLink="/shop" class="inline-flex items-center text-brand-900/60 hover:text-brand-900 mb-[40px] transition-colors label-md">
        <mat-icon class="mr-2 text-[18px]">arrow_back</mat-icon> Back to Shop
      </a>

      @if (loading()) {
        <div class="py-24 flex justify-center">
          <mat-icon class="animate-spin text-brand-900">refresh</mat-icon>
        </div>
      } @else if (product()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[48px] lg:gap-[64px]">
          <!-- Image -->
          <div class="rounded-[32px] overflow-hidden bg-white shadow-sm border border-brand-100 aspect-square">
            <img [src]="product()?.image" [alt]="product()?.name" class="w-full h-full object-cover" loading="lazy" decoding="async" referrerpolicy="no-referrer">
          </div>

          <!-- Details -->
          <div class="flex flex-col justify-center">
            <span class="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-900 label-md uppercase tracking-[0.2em] text-[12px] mb-6 self-start">
              {{ product()?.category || 'Tool' }}
            </span>
            <h1 class="font-serif text-[40px] lg:text-[48px] text-brand-900 leading-tight mb-[16px]">{{ product()?.name }}</h1>
            <p class="text-[24px] font-medium text-brand-600 mb-[32px]">LKR {{ product()?.price?.toLocaleString() }}</p>
            
            <p class="body-md text-brand-900/80 leading-[1.8] mb-[48px]">
              {{ product()?.description || 'High-quality sewing tool handpicked for professional use.' }}
            </p>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-[48px]">
              <div class="flex items-center border border-brand-200 rounded-full bg-white px-2 justify-between sm:justify-start">
                <button (click)="decreaseQty()" class="w-10 h-10 flex items-center justify-center text-brand-900/70 hover:text-brand-900" aria-label="Decrease quantity">
                  <mat-icon>remove</mat-icon>
                </button>
                <span class="w-10 text-center font-medium">{{ quantity() }}</span>
                <button (click)="increaseQty()" class="w-10 h-10 flex items-center justify-center text-brand-900/70 hover:text-brand-900" aria-label="Increase quantity">
                  <mat-icon>add</mat-icon>
                </button>
              </div>
              <button (click)="addToCart()" class="btn-secondary flex-1 flex items-center justify-center gap-2">
                <mat-icon>shopping_bag</mat-icon> Add to Cart
              </button>
              <button (click)="buyNow()" class="btn-primary !bg-emerald-800 hover:!bg-emerald-900 flex-1 flex items-center justify-center gap-2 shadow-sm">
                <mat-icon>flash_on</mat-icon> Buy Now
              </button>
            </div>
            
            <div class="border-t border-brand-100 pt-[32px]">
              <div class="flex items-start gap-[16px] mb-[24px]">
                <mat-icon class="text-brand-400 mt-1">local_shipping</mat-icon>
                <div>
                  <h4 class="font-medium text-brand-900">Island-wide Delivery</h4>
                  <p class="text-[14px] text-brand-900/60">Delivered within 3-5 business days</p>
                </div>
              </div>
              <div class="flex items-start gap-[16px]">
                <mat-icon class="text-brand-400 mt-1">verified</mat-icon>
                <div>
                  <h4 class="font-medium text-brand-900">Quality Guarantee</h4>
                  <p class="text-[14px] text-brand-900/60">Tested and approved by Su Collection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="py-24 text-center">
          <h2 class="font-serif text-[32px] text-brand-900 mb-[16px]">Product Not Found</h2>
          <p class="body-md text-brand-900/70">The product you are looking for does not exist.</p>
        </div>
      }
    </main>
  `
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartService = inject(CartService);

  loading = signal(true);
  product = signal<any>(null);
  quantity = signal(1);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.fetchProduct(id);
    } else {
      this.loading.set(false);
    }
  }

  defaultProducts = [
    {
      id: 'beginner-essential-toolpack',
      name: 'Beginner Essential Toolpack',
      category: 'Toolpacks',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=800&auto=format&fit=crop',
      description: 'The perfect starter kit containing measuring tape, essential pins, snips, and needles.'
    },
    {
      id: 'precision-invisible-zipper-foot',
      name: 'Precision Invisible Zipper Foot',
      category: 'Machine Feet',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1598466185850-2f16246fcd20?q=80&w=800&auto=format&fit=crop',
      description: 'Get perfectly hidden zippers every time with this professional grade machine foot.'
    },
    {
      id: 'premium-rose-gold-shears',
      name: 'Premium Rose Gold Shears',
      category: 'Accessories',
      price: 3800,
      image: 'https://images.unsplash.com/photo-1606132717876-0fefd1beab5b?q=80&w=800&auto=format&fit=crop',
      description: 'Ultra-sharp, comfortable tailoring shears built for lifetime use.'
    },
    {
      id: 'professional-rolled-hem-set',
      name: 'Professional Rolled Hem Set',
      category: 'Machine Feet',
      price: 2500,
      image: 'https://images.unsplash.com/photo-1629198725916-d93540ce80ad?q=80&w=800&auto=format&fit=crop',
      description: 'Create flawless rolled hems on sheer fabrics without frustration.'
    },
    {
      id: 'french-curve-measuring-ruler',
      name: 'French Curve Measuring Ruler',
      category: 'Accessories',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1584034879669-e74f1d431051?q=80&w=800&auto=format&fit=crop',
      description: 'Essential pattern making ruler for perfect necklines and armholes.'
    },
    {
      id: 'advanced-master-toolpack',
      name: 'Advanced Master Toolpack',
      category: 'Toolpacks',
      price: 9500,
      image: 'https://images.unsplash.com/photo-1620799139502-2cce8c227e77?q=80&w=800&auto=format&fit=crop',
      description: 'The ultimate professional bundle for starting your own tailoring business.'
    }
  ];

  async fetchProduct(id: string) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.product.set({ id: docSnap.id, ...docSnap.data() });
      } else {
        const mockProduct = this.defaultProducts.find(p => p.id === id);
        if (mockProduct) {
          this.product.set(mockProduct);
        }
      }
    } catch (e) {
      console.error(e);
      const mockProduct = this.defaultProducts.find(p => p.id === id);
      if (mockProduct) {
        this.product.set(mockProduct);
      }
    } finally {
      this.loading.set(false);
    }
  }

  increaseQty() {
    this.quantity.update(q => q + 1);
  }

  decreaseQty() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  addToCart() {
    if (this.product()) {
      this.cartService.addItem(this.product());
      this.router.navigate(['/cart']);
    }
  }

  buyNow() {
    if (this.product()) {
      this.cartService.addItem(this.product());
      this.router.navigate(['/checkout']);
    }
  }
}
