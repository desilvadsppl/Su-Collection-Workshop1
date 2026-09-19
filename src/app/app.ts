import {ChangeDetectionStrategy, Component, signal, inject, computed} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {ContentService} from './services/content.service';
import {CartService} from './services/cart.service';

import {db} from '../lib/firebase';
import {doc, getDoc, setDoc, deleteDoc} from 'firebase/firestore';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="min-h-screen flex flex-col selection:bg-brand-200 selection:text-brand-900 bg-brand-50 relative overflow-x-clip">
      <!-- Ambient Background -->
      <div class="fixed inset-0 z-0 pointer-events-none">
        <div class="absolute top-0 left-0 w-[800px] h-[800px] bg-brand-200/40 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div class="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-300/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      <!-- Scroll Fade Mask -->
      <div class="fixed top-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-brand-50 via-brand-50/90 to-transparent z-40 pointer-events-none backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,black_20%,transparent_100%)]"></div>

      <!-- Navbar (Glassy Site-Wide Header) -->
      <header class="sticky top-4 sm:top-6 z-50 mx-4 sm:mx-6 lg:mx-[64px]">
        <div class="gradient-shell !rounded-full shadow-lg">
          <div class="gradient-shell-inner !rounded-full px-6 sm:px-8 py-3.5 sm:py-4 flex justify-between items-center bg-white/80 backdrop-blur-xl border border-white/60">
            <!-- Logo -->
            <a routerLink="/" class="flex items-center gap-3 group">
              <img src="/image.png" alt="Su Collection Logo" class="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-brand-100 shadow-sm transition-transform group-hover:scale-105">
              <span class="font-serif text-xl sm:text-2xl font-normal tracking-tight text-brand-900">Su Collection</span>
            </a>

            <!-- Desktop Nav -->
            <nav class="hidden md:flex items-center gap-8 lg:gap-10">
              @for (link of navLinks(); track link.path) {
                @if (!link.mobileOnly) {
                  <a [routerLink]="link.path" 
                     routerLinkActive="!text-brand-900 !font-bold" 
                     [routerLinkActiveOptions]="{exact: link.exact}"
                     class="text-brand-900/70 hover:text-brand-900 transition-colors label-md tracking-wider uppercase text-[12px]">
                    {{link.label}}
                  </a>
                }
              }
            </nav>

            <!-- Desktop Actions -->
            <div class="hidden md:flex items-center gap-4 lg:gap-6">
              <a routerLink="/cart" class="p-2 text-brand-900/70 hover:text-brand-900 transition-colors relative" title="Shopping Cart">
                <mat-icon>shopping_bag</mat-icon>
                @if (cartService.totalItems() > 0) {
                  <span class="absolute top-1 right-1 bg-brand-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">{{ cartService.totalItems() }}</span>
                }
              </a>
              @if (false) {
                <a routerLink="/sew-and-su" class="btn-primary !px-5 !py-2.5 text-[13px] flex items-center gap-2">
                  <span>Custom Order</span>
                </a>
              }
            </div>

            <!-- Mobile Actions & Menu Button -->
            <div class="md:hidden flex items-center gap-2">
              <a routerLink="/cart" class="p-2 text-brand-900/70 hover:text-brand-900 transition-colors relative" title="Shopping Cart" (click)="isMobileMenuOpen.set(false)">
                <mat-icon>shopping_bag</mat-icon>
                @if (cartService.totalItems() > 0) {
                  <span class="absolute top-1 right-1 bg-brand-900 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">{{ cartService.totalItems() }}</span>
                }
              </a>
              <button (click)="isMobileMenuOpen.set(!isMobileMenuOpen())" 
                      aria-label="Toggle Menu"
                      class="p-2 text-brand-900/80 hover:text-brand-900 focus:outline-none">
                <mat-icon>{{ isMobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile Menu -->
      @if (isMobileMenuOpen()) {
        <div class="fixed inset-0 z-40 bg-brand-50/98 backdrop-blur-3xl md:hidden pt-[120px] px-[64px] pb-[64px] flex flex-col overflow-y-auto">
          <nav class="flex flex-col gap-6 sm:gap-[24px] mt-[24px]">
            @for (link of navLinks(); track link.path) {
              <a [routerLink]="link.path" 
                 (click)="isMobileMenuOpen.set(false)"
                 routerLinkActive="!text-brand-900 !font-bold"
                 [routerLinkActiveOptions]="{exact: link.exact}"
                 class="font-serif text-3xl sm:text-4xl text-brand-900/60 hover:text-brand-900 transition-colors">
                {{link.label}}
              </a>
            }
          </nav>
        </div>
      }

      <!-- Main Content -->
      <main class="flex-1 flex flex-col w-full">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="mt-auto px-4 sm:px-6 lg:px-[64px] pb-10 sm:pb-[64px] relative z-10 pt-10 sm:pt-[64px]">
        <div class="gradient-shell">
          <div class="gradient-shell-inner p-6 sm:p-10 lg:p-[64px] bg-brand-900/95 backdrop-blur-[64px]">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-[64px]">
              <div class="col-span-2 md:col-span-1">
                <div class="flex items-center gap-3 mb-5 sm:mb-[24px]">
                  <img src="/image.png" alt="Su Collection Logo" class="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover bg-white shadow-md border-2 border-white/20 opacity-95">
                  <span class="font-serif text-[22px] sm:text-[28px] font-normal text-brand-900 tracking-tight">Su Collection</span>
                </div>
                <p class="body-md text-brand-700 mb-5 sm:mb-[24px] text-[13px] sm:text-[14px]">
                  {{ contentService.content().app.footerBrand }}
                </p>
                <div class="flex items-center gap-[12px] text-brand-900">
                  <a href="https://www.facebook.com/people/%E0%B7%83%E0%B7%96-collection/61573462124609/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors" title="Facebook">
                    <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd"/></svg>
                  </a>
                  <a href="https://www.tiktok.com/@swarnaherath527" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center hover:bg-black hover:text-white transition-colors" title="TikTok">
                    <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/></svg>
                  </a>
                  <a href="https://www.youtube.com/@SuCollectionLK" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-colors" title="YouTube">
                    <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path fill-rule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clip-rule="evenodd"/></svg>
                  </a>
                  <a href="https://linktr.ee/SuCollectionLK" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center hover:bg-[#43E660] hover:text-[#282D29] transition-colors" title="Linktree">
                    <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path d="M13.511 5.853l4.005-3.957 2.36 2.394-4.041 3.987h5.132v3.399h-5.068l4.032 3.98-2.395 2.36-5.836-5.76V22H8.3v-9.742l-5.835 5.76-2.396-2.36 4.032-3.98H-.033V8.277h5.132L1.058 4.29l2.36-2.394 4.005 3.957v-5.82h3.354v5.82h.023l2.711 0z"/></svg>
                  </a>
                  <a href="https://wa.me/94769269586" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors" title="WhatsApp">
                    <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5"><path fill-rule="evenodd" d="M12.031 1.706C6.347 1.706 1.734 6.32 1.734 12.003c0 1.815.474 3.585 1.376 5.148L1.724 22.25l5.226-1.371a10.22 10.22 0 005.081 1.341h.004c5.682 0 10.294-4.614 10.294-10.297 0-2.754-1.072-5.342-3.018-7.29A10.24 10.24 0 0012.031 1.706zm.003 18.66h-.002a8.55 8.55 0 01-4.364-1.196l-.313-.186-3.245.852.866-3.165-.205-.326A8.536 8.536 0 013.435 12.003c0-4.73 3.849-8.58 8.581-8.58 2.293 0 4.448.892 6.07 2.515 1.62 1.621 2.513 3.778 2.513 6.07 0 4.731-3.85 8.58-8.58 8.58h-.016zm4.708-6.435c-.258-.129-1.526-.753-1.761-.84-.236-.086-.407-.129-.579.129-.172.258-.665.84-.816 1.013-.15.172-.301.193-.559.064-.258-.129-1.089-.402-2.073-1.28-.767-.684-1.285-1.53-1.435-1.788-.15-.258-.016-.398.113-.526.116-.115.258-.301.387-.452.13-.15.172-.258.258-.43.086-.172.043-.322-.021-.451-.064-.129-.579-1.396-.793-1.91-.208-.501-.419-.433-.579-.441-.15-.008-.323-.01-.494-.01-.172 0-.451.064-.687.322-.236.258-.902.881-.902 2.149 0 1.267.924 2.492 1.053 2.664.129.172 1.817 2.773 4.403 3.89 1.559.673 2.164.717 2.91.602.85-.133 1.526-.623 1.741-1.225.215-.602.215-1.117.15-1.225-.064-.108-.236-.172-.494-.301z" clip-rule="evenodd"/></svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h4 class="label-md text-brand-900 mb-4 sm:mb-[24px] text-[11px] sm:text-[12px]">Explore</h4>
                <ul class="flex flex-col gap-3 sm:gap-[12px] body-md text-brand-700 text-[13px] sm:text-[14px]">
                  <li><a routerLink="/learn" class="hover:text-brand-900 transition-colors">{{ contentService.content().app.navCourses }}</a></li>
                  @if (false) {
                    <li><a routerLink="/sew-and-su" class="hover:text-brand-900 transition-colors">{{ contentService.content().app.navCustom }}</a></li>
                    <li><a routerLink="/shop" class="hover:text-brand-900 transition-colors">{{ contentService.content().app.navShop }}</a></li>
                  }
                  <li><a routerLink="/about" class="hover:text-brand-900 transition-colors">{{ contentService.content().app.navAbout }}</a></li>
                </ul>
              </div>
              
              <div>
                <h4 class="label-md text-brand-900 mb-4 sm:mb-[24px] text-[11px] sm:text-[12px]">Support</h4>
                <ul class="flex flex-col gap-3 sm:gap-[12px] body-md text-brand-700 text-[13px] sm:text-[14px]">
                  <li><a routerLink="/contact" class="hover:text-brand-900 transition-colors">Contact Us</a></li>
                </ul>
              </div>

              <div class="col-span-2 sm:col-span-1">
                <h4 class="label-md text-brand-900 mb-4 sm:mb-[24px] text-[11px] sm:text-[12px]">Newsletter</h4>
                <form class="flex flex-col gap-3 sm:gap-[12px]">
                  <input type="email" placeholder="Your email address" class="bg-brand-50 border border-brand-200 text-brand-900 px-5 py-3 rounded-full focus:outline-none focus:border-brand-400 placeholder:text-brand-900/50 transition-colors body-md text-[13px] sm:text-[14px]">
                  <button type="submit" class="bg-brand-900 text-white px-5 py-3 rounded-full hover:bg-brand-800 transition-colors label-md border border-brand-900/30 text-center text-[12px] sm:text-[14px]">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class App {
  private router = inject(Router);
  contentService = inject(ContentService);
  cartService = inject(CartService);
  isMobileMenuOpen = signal(false);
  
  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      }
    });

    // Run one-off SEO URL migration on load
    this.migrateSeoUrls();
  }

  async migrateSeoUrls() {
    try {
      const oldMentorship = await getDoc(doc(db, 'courses', 'couture-and-tailoring-business-mentorship'));
      if (oldMentorship.exists()) {
        await setDoc(doc(db, 'courses', '6-month-tailoring-business-mentorship'), { ...oldMentorship.data(), id: '6-month-tailoring-business-mentorship' });
        await deleteDoc(doc(db, 'courses', 'couture-and-tailoring-business-mentorship'));
      }
      
      const oldMentorship2 = await getDoc(doc(db, 'courses', 'mentorship'));
      if (oldMentorship2.exists()) {
        await setDoc(doc(db, 'courses', '6-month-tailoring-business-mentorship'), { ...oldMentorship2.data(), id: '6-month-tailoring-business-mentorship' });
        await deleteDoc(doc(db, 'courses', 'mentorship'));
      }

      const oldPdf = await getDoc(doc(db, 'courses', 'sri-lankan-saree-jacket-master-blueprint'));
      if (oldPdf.exists()) {
        await setDoc(doc(db, 'courses', '100-day-tailoring-business-workbook'), { ...oldPdf.data(), id: '100-day-tailoring-business-workbook' });
        await deleteDoc(doc(db, 'courses', 'sri-lankan-saree-jacket-master-blueprint'));
      }
    } catch (e) {
      console.error("Migration error:", e);
    }
  }

  navLinks = computed(() => [
    { path: '/', label: this.contentService.content().app.navHome, exact: true },
    { path: '/learn', label: this.contentService.content().app.navCourses, exact: false },
    // { path: '/sew-and-su', label: this.contentService.content().app.navCustom, exact: false }, // Hidden for now
    // { path: '/shop', label: this.contentService.content().app.navShop, exact: false }, // Hidden for now
    { path: '/contact', label: 'Contact Us', exact: false, mobileOnly: true },
    { path: '/about', label: this.contentService.content().app.navAbout, exact: false },
  ]);
}
