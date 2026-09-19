import {ChangeDetectionStrategy, Component, signal, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {db} from '../lib/firebase';
import {collection, query, orderBy, onSnapshot} from 'firebase/firestore';
import {ContentService} from './services/content.service';
import {FormatTextPipe} from './pipes/format-text.pipe';
import {inject} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-shop',
  imports: [MatIconModule, RouterLink, FormatTextPipe],
  template: `
    <header class="pt-[40px] pb-[48px] px-6 text-center max-w-[1600px] mx-auto">
      <div class="relative w-full rounded-[36px] sm:rounded-[48px] overflow-hidden p-10 sm:p-16 border border-white/20 shadow-2xl text-white bg-slate-950 group">
        <!-- Background Editorial Fashion Tailoring Image -->
        <div class="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1606132717876-0fefd1beab5b?q=75&w=1200&auto=format&fit=crop" 
               alt="Tailoring Shears & Tools" 
               class="w-full h-full object-cover opacity-45 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000" 
               fetchpriority="high"
               decoding="async"
               referrerpolicy="no-referrer">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/50"></div>
        </div>

        <div class="relative z-10 max-w-4xl mx-auto">
          <span class="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-300 label-md uppercase tracking-[0.2em] text-[12px] mb-6">
            Sewing Essentials
          </span>
          <h1 class="display-lg mb-[24px] text-white" [innerHTML]="c().shop.heroTitle | formatText"></h1>
          <p class="body-md text-[18px] text-brand-100/90 max-w-2xl mx-auto font-light leading-relaxed" [innerHTML]="c().shop.heroDesc | formatText">
          </p>
        </div>
      </div>
    </header>

    <main class="px-6 lg:px-[64px] pb-[64px] w-full">
      <!-- Filters (Mock) -->
      <div class="flex items-center justify-between mb-[48px] pb-[16px] border-b border-brand-200">
        <div class="flex gap-[32px] overflow-x-auto pb-[8px] no-scrollbar">
          <button class="label-md text-brand-900 whitespace-nowrap border-b border-brand-900 pb-[8px]">All Products</button>
          <button class="label-md text-brand-900/50 hover:text-brand-900 whitespace-nowrap pb-[8px] transition-colors">Toolpacks</button>
          <button class="label-md text-brand-900/50 hover:text-brand-900 whitespace-nowrap pb-[8px] transition-colors">Machine Feet</button>
          <button class="label-md text-brand-900/50 hover:text-brand-900 whitespace-nowrap pb-[8px] transition-colors">Accessories</button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
        @for (product of displayProducts(); track product.id) {
          <a [routerLink]="['/shop', product.id]" class="group cursor-pointer block">
            <div class="gradient-shell mb-[24px]">
              <div class="gradient-shell-inner !bg-white/40 aspect-square overflow-hidden relative group-hover:shadow-[0_25px_50px_-12px_rgba(248,58,100,0.15)] transition-shadow duration-500 rounded-[39px]">
                <img [src]="product.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 mix-blend-multiply opacity-90" [alt]="product.name" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                
                <!-- Add to cart overlay -->
                <div class="absolute inset-x-[24px] bottom-[24px] translate-y-[24px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <div class="w-full btn-primary flex items-center justify-center gap-[8px] pointer-events-none">
                    <mat-icon class="text-[20px]">visibility</mat-icon>
                    View Details
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex justify-between items-start gap-[16px] px-[12px]">
              <div>
                <h3 class="font-serif text-[20px] text-brand-900 mb-[4px] group-hover:text-brand-600 transition-colors leading-tight">{{product.name}}</h3>
                <p class="label-md text-brand-900/60">{{product.category || 'Product'}}</p>
              </div>
              <span class="body-md font-medium text-brand-900 whitespace-nowrap">LKR {{product.price.toLocaleString()}}</span>
            </div>
          </a>
        } @empty {
           <div class="col-span-full py-16 text-center">
             <div class="animate-pulse flex space-x-4 justify-center">
                <div class="rounded-full bg-brand-200 h-10 w-10"></div>
                <div class="flex-1 space-y-6 py-1 max-w-sm">
                  <div class="h-2 bg-brand-200 rounded"></div>
                  <div class="space-y-3">
                    <div class="grid grid-cols-3 gap-4">
                      <div class="h-2 bg-brand-200 rounded col-span-2"></div>
                      <div class="h-2 bg-brand-200 rounded col-span-1"></div>
                    </div>
                    <div class="h-2 bg-brand-200 rounded"></div>
                  </div>
                </div>
              </div>
          </div>
        }
      </div>
    </main>
  `
})
export class Shop implements OnInit {
  contentService = inject(ContentService);
  c = this.contentService.content;

  defaultProducts = [
    {
      id: 'beginner-essential-toolpack',
      name: 'Beginner Essential Toolpack',
      category: 'Toolpacks',
      price: 4500,
      image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=75&w=500&auto=format&fit=crop',
      description: 'The perfect starter kit containing measuring tape, essential pins, snips, and needles.'
    },
    {
      id: 'precision-invisible-zipper-foot',
      name: 'Precision Invisible Zipper Foot',
      category: 'Machine Feet',
      price: 1200,
      image: 'https://images.unsplash.com/photo-1598466185850-2f16246fcd20?q=75&w=500&auto=format&fit=crop',
      description: 'Get perfectly hidden zippers every time with this professional grade machine foot.'
    },
    {
      id: 'premium-rose-gold-shears',
      name: 'Premium Rose Gold Shears',
      category: 'Accessories',
      price: 3800,
      image: 'https://images.unsplash.com/photo-1606132717876-0fefd1beab5b?q=75&w=500&auto=format&fit=crop',
      description: 'Ultra-sharp, comfortable tailoring shears built for lifetime use.'
    },
    {
      id: 'professional-rolled-hem-set',
      name: 'Professional Rolled Hem Set',
      category: 'Machine Feet',
      price: 2500,
      image: 'https://images.unsplash.com/photo-1629198725916-d93540ce80ad?q=75&w=500&auto=format&fit=crop',
      description: 'Create flawless rolled hems on sheer fabrics without frustration.'
    },
    {
      id: 'french-curve-measuring-ruler',
      name: 'French Curve Measuring Ruler',
      category: 'Accessories',
      price: 1800,
      image: 'https://images.unsplash.com/photo-1584034879669-e74f1d431051?q=75&w=500&auto=format&fit=crop',
      description: 'Essential pattern making ruler for perfect necklines and armholes.'
    },
    {
      id: 'advanced-master-toolpack',
      name: 'Advanced Master Toolpack',
      category: 'Toolpacks',
      price: 9500,
      image: 'https://images.unsplash.com/photo-1620799139502-2cce8c227e77?q=75&w=500&auto=format&fit=crop',
      description: 'The ultimate professional bundle for starting your own tailoring business.'
    }
  ];

  dbProducts = signal<any[]>([]);
  displayProducts = signal<any[]>(this.defaultProducts);

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('sc_current_order');
    }
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.dbProducts.set(items);
        this.displayProducts.set(items);
      } else {
        this.displayProducts.set(this.defaultProducts);
      }
    });
  }
}
