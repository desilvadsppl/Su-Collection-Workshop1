import {ChangeDetectionStrategy, Component, inject, signal, OnInit, ElementRef, viewChild} from '@angular/core';
import {RouterLink, Router, ActivatedRoute} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {ContentService} from './services/content.service';
import {CartService} from './services/cart.service';
import {db} from '../lib/firebase';
import {collection, query, orderBy, onSnapshot} from 'firebase/firestore';
import {FormatTextPipe} from './pipes/format-text.pipe';

interface SocialVideo {
  id: string;
  title: string;
  platform: 'tiktok' | 'facebook';
  url: string;
  thumbnail: string;
  views: string;
  duration?: string;
  author?: string;
}

interface DigitalGuide {
  id: string;
  title: string;
  category: 'Mentorship' | 'PDF E-Book' | 'Pattern Guide';
  price: string;
  durationOrPages: string;
  description: string;
  features: string[];
  image: string;
  badge?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  imports: [RouterLink, MatIconModule, FormatTextPipe],
  template: `
    <!-- 1. Hero Section (Attention-Grabbing, No Eyebrows, Clear Human Copy) -->
    <section class="p-3 sm:p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto pt-1 sm:pt-2 sm:pt-4">
      <div class="relative w-full rounded-[24px] sm:rounded-[44px] lg:rounded-[52px] overflow-hidden min-h-[80vh] sm:min-h-[75vh] lg:min-h-[82vh] flex flex-col justify-end p-5 sm:p-10 lg:p-14 border border-white/20 shadow-2xl text-white bg-slate-950 group">
        
        <!-- Background Atelier & Tailoring Imagery -->
        <div class="absolute inset-0 z-0">
          <img src="/images/hero.png" 
               alt="Swarna Herath Atelier Studio" 
               class="w-full h-full object-cover object-[center_30%] scale-100 group-hover:scale-105 transition-transform duration-1000 opacity-60 mix-blend-luminosity" 
               fetchpriority="high"
               decoding="async"
               referrerpolicy="no-referrer">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-900/35 pointer-events-none"></div>
        </div>

        <!-- Subtle Drafting Hairline Overlay -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-25" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="780" cy="420" r="360" stroke="white" stroke-width="0.8" stroke-dasharray="4 4" />
          <circle cx="780" cy="420" r="260" stroke="white" stroke-width="0.8" />
          <path d="M 60 760 Q 720 220 1140 760" stroke="white" stroke-width="0.8" />
          <line x1="200" y1="80" x2="860" y2="760" stroke="white" stroke-width="0.6" />
        </svg>

        <!-- Main Hero Content -->
        <div class="relative z-20 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-16 mt-auto pt-20 sm:pt-16 lg:pt-24">
          
          <!-- Left Display Headline & Trust Strip -->
          <div class="w-full lg:w-7/12">
            <h1 class="font-['Noto_Sans_Sinhala'] text-[32px] sm:text-[56px] lg:text-[84px] xl:text-[92px] font-normal leading-[1.3] lg:leading-[1.25] text-white tracking-tight mb-4 sm:mb-8" [innerHTML]="c().home.heroTitle | formatText">
            </h1>

            <!-- Quick Trust Strip -->
            <div class="flex flex-wrap items-center gap-3 sm:gap-6 pt-2 text-white/80">
              <div class="flex items-center gap-1.5 sm:gap-2">
                <mat-icon class="text-brand-300 text-[16px] sm:text-[18px]">verified</mat-icon>
                <span class="text-[11px] sm:text-[13px] tracking-wide font-medium">30+ Years Master Craft</span>
              </div>
              <div class="flex items-center gap-1.5 sm:gap-2">
                <mat-icon class="text-brand-300 text-[16px] sm:text-[18px]">group</mat-icon>
                <span class="text-[11px] sm:text-[13px] tracking-wide font-medium">150K+ Community on TikTok & FB</span>
              </div>
              <div class="flex items-center gap-1.5 sm:gap-2">
                <mat-icon class="text-brand-300 text-[16px] sm:text-[18px]">chat</mat-icon>
                <span class="text-[11px] sm:text-[13px] tracking-wide font-medium">100% WhatsApp Support</span>
              </div>
            </div>
          </div>

          <!-- Right Supporting Narrative & High-Intent Action Buttons -->
          <div class="w-full lg:w-5/12 flex flex-col items-start gap-4 sm:gap-6 pb-2 lg:pl-6">
            <p class="body-md text-white/95 text-[14px] sm:text-[16px] lg:text-[17px] leading-[1.7] font-light max-w-lg font-['Noto_Sans_Sinhala']" [innerHTML]="c().home.heroDesc | formatText"></p>
            <p class="body-md text-white/80 text-[13px] sm:text-[15px] lg:text-[16px] leading-[1.7] font-light max-w-lg mb-2 font-['Noto_Sans_Sinhala']" [innerHTML]="c().home.heroDesc2 | formatText"></p>

            <div class="flex flex-col items-stretch sm:items-start gap-3 w-full">
              <button type="button" (click)="scrollToOfferings()" class="bg-white text-slate-950 hover:bg-brand-50 transition-all rounded-full px-6 py-3.5 label-md font-semibold tracking-wider uppercase text-[11px] sm:text-[12px] shadow-lg flex items-center justify-center gap-2">
                <span>OUR SERVICES &amp; PRODUCTS</span>
                <mat-icon class="text-[18px]">arrow_downward</mat-icon>
              </button>
              <a [href]="getGeneralWhatsAppUrl()" target="_blank" rel="noopener noreferrer" class="border border-emerald-400/40 bg-emerald-950/60 hover:bg-emerald-900/80 backdrop-blur-md text-emerald-200 rounded-full px-5 py-3.5 label-md font-medium tracking-wider uppercase text-[11px] sm:text-[12px] transition-all flex items-center justify-center gap-2">
                <mat-icon class="text-emerald-400 text-[18px]">chat</mat-icon>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>

    <!-- 2. TikTok & Facebook Video Showcase (Touch Slider) -->
    <section class="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-[64px] w-full max-w-[1600px] mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h3 class="font-serif text-[24px] sm:text-[32px] text-brand-900 mb-2 sm:mb-3 leading-tight" [innerHTML]="c().home.videoTitle | formatText">
          </h3>
          <p class="body-md text-brand-900/80 max-w-xl mx-auto text-[13px] sm:text-[15px]" [innerHTML]="c().home.videoDesc | formatText">
          </p>
        </div>
        
        <!-- Controls & Follow Buttons -->
        <div class="flex items-center gap-3 shrink-0">
          <a href="https://www.tiktok.com/@swarnaherath527" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-[12px] font-medium tracking-wider uppercase bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors shadow-sm">
            <mat-icon class="text-[16px]">play_circle</mat-icon>
            TikTok
          </a>
          <a href="https://www.facebook.com/people/%E0%B7%83%E0%B7%96-collection/61573462124609/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-[12px] font-medium tracking-wider uppercase bg-[#1877F2] text-white px-4 py-2 rounded-full hover:bg-[#166fe5] transition-colors shadow-sm">
            <mat-icon class="text-[16px]">thumb_up</mat-icon>
            Facebook
          </a>
          <div class="hidden sm:flex items-center gap-1.5 ml-2">
            <button type="button" (click)="slidePrev()" class="w-10 h-10 rounded-full border border-brand-200 bg-white/90 hover:bg-white text-brand-900 flex items-center justify-center transition-all shadow-sm active:scale-95" aria-label="Previous slide">
              <mat-icon class="text-[20px]">chevron_left</mat-icon>
            </button>
            <button type="button" (click)="slideNext()" class="w-10 h-10 rounded-full border border-brand-200 bg-white/90 hover:bg-white text-brand-900 flex items-center justify-center transition-all shadow-sm active:scale-95" aria-label="Next slide">
              <mat-icon class="text-[20px]">chevron_right</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Slider Container with Edge Fade -->
      <div class="relative">
        <div class="pointer-events-none absolute -left-4 sm:-left-6 lg:-left-[64px] top-0 bottom-0 w-8 bg-gradient-to-r from-brand-50 to-transparent z-10 hidden md:block"></div>
        <div class="pointer-events-none absolute -right-4 sm:-right-6 lg:-right-[64px] top-0 bottom-0 w-8 bg-gradient-to-l from-brand-50 to-transparent z-10 hidden md:block"></div>

        <!-- Touch & Drag Slider Track (No Scrollbar) -->
        <div #reelContainer 
             (scroll)="onScroll()"
             (mousedown)="onMouseDown($event)"
             (mousemove)="onMouseMove($event)"
             (mouseup)="onMouseUp()"
             (mouseleave)="onMouseLeave()"
             class="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar select-none cursor-grab active:cursor-grabbing scroll-smooth -mx-4 sm:-mx-6 lg:-mx-[64px] px-4 sm:px-6 lg:px-[64px] scroll-pl-4 sm:scroll-pl-6 lg:scroll-pl-[64px]">
          @for (video of displayVideos(); track video.id) {
            <button type="button" 
                    (click)="handleCardClick(video)" 
                    class="snap-start shrink-0 w-[240px] sm:w-[280px] group cursor-pointer text-left border-0 bg-transparent p-0 focus:outline-none transition-transform duration-300">
              <div class="relative aspect-[9/16] rounded-[28px] overflow-hidden bg-slate-900 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300 border border-white/20 pointer-events-none">
                
                <!-- Video Poster Thumbnail -->
                <img [src]="video.thumbnail" [alt]="video.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-slate-950/40"></div>

                <!-- Top Badges: Platform & Views -->
                <div class="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase shadow-sm"
                        [class.bg-slate-900]="video.platform === 'tiktok'"
                        [class.text-white]="video.platform === 'tiktok'"
                        [class.bg-[#1877F2]]="video.platform === 'facebook'"
                        [class.text-white]="video.platform === 'facebook'">
                    <mat-icon class="text-[13px]">{{ video.platform === 'tiktok' ? 'music_note' : 'public' }}</mat-icon>
                    {{ video.platform === 'tiktok' ? 'TikTok' : 'Facebook' }}
                  </span>
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
                    <mat-icon class="text-[13px] text-brand-400">visibility</mat-icon>
                    {{ video.views }}
                  </span>
                </div>

                <!-- Center Play Badge -->
                <div class="absolute inset-0 flex items-center justify-center z-10">
                  <div class="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-brand-500 transition-all duration-300 shadow-xl">
                    <mat-icon class="text-[28px] ml-0.5">play_arrow</mat-icon>
                  </div>
                </div>

                <!-- Bottom Title & Duration -->
                <div class="absolute bottom-4 inset-x-4 z-10 text-white">
                  <h4 class="font-serif text-[17px] leading-snug line-clamp-2 mb-1.5 group-hover:text-brand-300 transition-colors">
                    {{ video.title }}
                  </h4>
                  <div class="flex items-center justify-between text-[11px] text-white/70">
                    <span>{{ video.author || 'Swarna Herath' }}</span>
                    <span>{{ video.duration || '0:45' }}</span>
                  </div>
                </div>

              </div>
            </button>
          }
        </div>
      </div>

      <!-- Slider Pagination Dots & Navigation Controls -->
      <div class="flex items-center justify-between mt-6 pt-2 border-t border-brand-200/50">
        <div class="flex items-center gap-2 text-brand-900/60 text-[12px]">
          <mat-icon class="text-[16px] text-brand-500">touch_app</mat-icon>
          <span>Touch swipe or drag to slide</span>
        </div>

        <!-- Slide Dots -->
        <div class="flex items-center gap-1.5">
          @for (video of displayVideos(); track video.id; let i = $index) {
            <button type="button" 
                    (click)="scrollToIndex(i)" 
                    [attr.aria-label]="'Go to slide ' + (i + 1)"
                    class="h-2 rounded-full transition-all duration-300 focus:outline-none"
                    [class.w-7]="activeSlideIndex() === i"
                    [class.bg-brand-900]="activeSlideIndex() === i"
                    [class.w-2]="activeSlideIndex() !== i"
                    [class.bg-brand-200]="activeSlideIndex() !== i"
                    [class.hover:bg-brand-400]="activeSlideIndex() !== i">
            </button>
          }
        </div>

        <!-- Slide Buttons for all devices -->
        <div class="flex items-center gap-1.5">
          <button type="button" (click)="slidePrev()" class="w-8 h-8 rounded-full border border-brand-200 bg-white/90 hover:bg-white text-brand-900 flex items-center justify-center transition-all shadow-sm active:scale-95" aria-label="Previous slide">
            <mat-icon class="text-[18px]">chevron_left</mat-icon>
          </button>
          <button type="button" (click)="slideNext()" class="w-8 h-8 rounded-full border border-brand-200 bg-white/90 hover:bg-white text-brand-900 flex items-center justify-center transition-all shadow-sm active:scale-95" aria-label="Next slide">
            <mat-icon class="text-[18px]">chevron_right</mat-icon>
          </button>
        </div>
      </div>
    </section>

    <!-- 3. Mentorship Offers & Digital Guides Section (Addressing WhatsApp Sales Flow) -->
    <div id="digital-offerings">
      <section class="py-10 sm:py-14 lg:py-20 px-4 sm:px-6 lg:px-[64px] w-full max-w-[1600px] mx-auto">
      <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <h2 class="font-serif text-[28px] sm:text-[40px] lg:text-[50px] text-brand-900 leading-tight mb-3 sm:mb-4" [innerHTML]="c().home.servicesTitle | formatText">
        </h2>
        <p class="body-md text-[14px] sm:text-[16px] lg:text-[18px] text-brand-900/80 font-light leading-relaxed" [innerHTML]="c().home.servicesDesc | formatText">
        </p>
      </div>

      <!-- How WhatsApp & Bank Transfer Orders Work -->
      <div class="bg-white/80 backdrop-blur-xl border border-brand-200 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 mb-8 sm:mb-12 shadow-sm">
        <h3 class="font-serif text-[20px] sm:text-[24px] text-brand-900 mb-6 sm:mb-8 text-center sm:text-left flex items-center justify-center gap-2">
          <mat-icon class="text-emerald-600">verified_user</mat-icon>
          <span [innerHTML]="c().home.howItWorksTitle | formatText"></span>
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div class="flex items-start gap-3 sm:gap-4 bg-white/60 p-4 rounded-2xl border border-brand-100 h-full shadow-sm">
            <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-serif text-[13px] sm:text-[15px] shrink-0">1</span>
            <div>
              <h4 class="font-medium text-brand-900 text-[14px] sm:text-[15px] mb-1" [innerHTML]="c().home.howItWorksStep1Title | formatText"></h4>
              <p class="text-[12px] sm:text-[13px] text-brand-900/70 leading-relaxed" [innerHTML]="c().home.howItWorksStep1 | formatText"></p>
            </div>
          </div>
          <div class="flex items-start gap-3 sm:gap-4 bg-white/60 p-4 rounded-2xl border border-brand-100 h-full shadow-sm">
            <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-serif text-[13px] sm:text-[15px] shrink-0">2</span>
            <div>
              <h4 class="font-medium text-brand-900 text-[14px] sm:text-[15px] mb-1" [innerHTML]="c().home.howItWorksStep2Title | formatText"></h4>
              <p class="text-[12px] sm:text-[13px] text-brand-900/70 leading-relaxed" [innerHTML]="c().home.howItWorksStep2 | formatText"></p>
            </div>
          </div>
          <div class="flex items-start gap-3 sm:gap-4 bg-white/60 p-4 rounded-2xl border border-brand-100 h-full shadow-sm">
            <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-serif text-[13px] sm:text-[15px] shrink-0">3</span>
            <div>
              <h4 class="font-medium text-brand-900 text-[14px] sm:text-[15px] mb-1" [innerHTML]="c().home.howItWorksStep3Title | formatText"></h4>
              <p class="text-[12px] sm:text-[13px] text-brand-900/70 leading-relaxed" [innerHTML]="c().home.howItWorksStep3 | formatText"></p>
            </div>
          </div>
          <div class="flex items-start gap-3 sm:gap-4 bg-white/60 p-4 rounded-2xl border border-brand-100 h-full shadow-sm">
            <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-serif text-[13px] sm:text-[15px] shrink-0">4</span>
            <div>
              <h4 class="font-medium text-brand-900 text-[14px] sm:text-[15px] mb-1" [innerHTML]="c().home.howItWorksStep4Title | formatText"></h4>
              <p class="text-[12px] sm:text-[13px] text-brand-900/70 leading-relaxed" [innerHTML]="c().home.howItWorksStep4 | formatText"></p>
            </div>
          </div>
          <div class="flex items-start gap-3 sm:gap-4 bg-white/60 p-4 rounded-2xl border border-brand-100 h-full shadow-sm">
            <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-serif text-[13px] sm:text-[15px] shrink-0">5</span>
            <div>
              <h4 class="font-medium text-brand-900 text-[14px] sm:text-[15px] mb-1" [innerHTML]="c().home.howItWorksStep5Title | formatText"></h4>
              <p class="text-[12px] sm:text-[13px] text-brand-900/70 leading-relaxed" [innerHTML]="c().home.howItWorksStep5 | formatText"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Offerings Grid (Mentorship & E-Books) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
        @for (item of displayCourses(); track item.id) {
          <div class="gradient-shell flex flex-col h-full group hover:shadow-[0_25px_50px_-12px_rgba(248,58,100,0.2)] transition-all duration-500">
            <div class="gradient-shell-inner p-7 sm:p-8 flex flex-col h-full bg-white/70">
              
              <!-- Image Banner with Badge -->
              <div class="relative h-56 rounded-[24px] overflow-hidden mb-6 shrink-0 shadow-md">
                <img [src]="item.image" [alt]="item.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                

                @if (item.badge) {
                  <span class="absolute top-4 right-4 bg-brand-900/90 text-white px-3 py-1 text-[11px] font-semibold tracking-widest uppercase rounded-full shadow-md z-10 backdrop-blur-sm">
                    {{ item.badge }}
                  </span>
                }

                <div class="absolute bottom-4 left-4 flex items-center text-white z-10">
                  <span class="text-[13px] font-medium flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
                    <mat-icon class="text-[15px] text-brand-300">schedule</mat-icon>
                    {{ item.duration }}
                  </span>
                </div>
              </div>

              <!-- Content -->
              <div class="flex flex-col flex-1">
                <h3 class="font-serif text-[24px] text-brand-900 mb-2 leading-snug group-hover:text-brand-600 transition-colors">
                  {{ item.title }}
                </h3>
                <div class="mb-4 flex flex-wrap items-center gap-2">
                  <div class="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                    <mat-icon class="text-[18px]">local_offer</mat-icon>
                    @if (item.id === '6-month-tailoring-business-mentorship') {
                      @if (isOfferValid()) {
                        <span class="text-brand-900/40 line-through mr-1 font-normal text-[13px]">LKR 65,000</span>
                        <span class="text-[16px] sm:text-[18px] font-extrabold text-brand-900">LKR 55,000</span>
                      } @else {
                        <span class="text-[16px] sm:text-[18px] font-extrabold text-brand-900">LKR 65,000</span>
                      }
                    } @else if (item.id === '100-day-tailoring-business-workbook') {
                      <span class="text-brand-900/40 line-through mr-1 font-normal text-[13px]">LKR 990</span>
                      <span class="text-[16px] sm:text-[18px] font-extrabold text-brand-900">LKR 690</span>
                    } @else {
                      <span class="text-[15px]">{{ item.price.split('(')[0].trim() }}</span>
                    }
                  </div>
                  @if (item.price.includes('(')) {
                    <span class="text-[13px] sm:text-[14px] text-brand-900/60 font-medium">({{ item.price.split('(')[1] }}</span>
                  }
                </div>
                <p class="body-md text-brand-900/80 mb-6 text-[14px] leading-relaxed font-['Noto_Sans_Sinhala']" [innerHTML]="item.description | formatText">
                </p>

                <!-- Features Checklist -->
                @if (item.features && item.features.length) {
                  <ul class="flex flex-col gap-2.5 mb-6 text-[13px] text-brand-900/70">
                    @for (feat of item.features; track feat) {
                      <li class="flex items-start gap-2">
                        <mat-icon class="text-[16px] text-brand-600 shrink-0 mt-0.5">check_circle</mat-icon>
                        <span class="leading-relaxed font-bold text-brand-900 font-['Noto_Sans_Sinhala']" [innerHTML]="feat | formatText"></span>
                      </li>
                    }
                  </ul>
                }

                <div class="mt-auto flex flex-col pt-4 border-t border-brand-200">
                  <a [routerLink]="['/learn', item.id]" [state]="{ course: item }" class="btn-primary flex items-center justify-center gap-2 !py-3.5 w-full">
                    <span>{{ item.btnViewText || 'View Details' }}</span>
                    <mat-icon class="text-[18px]">arrow_forward</mat-icon>
                  </a>
                </div>

              </div>

            </div>
          </div>
        }
      </div>
    </section>
    </div>

    <!-- 4. Bento Grid Services -->
    <section class="py-8 sm:py-12 px-4 sm:px-6 lg:px-[64px] w-full max-w-[1600px] mx-auto">
      <div class="flex flex-col md:flex-row gap-4 sm:gap-6">
        
        <!-- About Swarna -->
        <div class="w-full">
          <div class="gradient-shell h-full">
            <a routerLink="/about" class="gradient-shell-inner p-6 sm:p-10 lg:p-14 flex flex-col justify-end min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(248,58,100,0.15)] transition-shadow">
              <div class="absolute inset-0 z-0">
                 <img src="/images/landing_meet_swarna.png" alt="Swarna teaching" class="w-full h-full object-cover object-[center_30%] scale-110 group-hover:scale-[1.15] transition-transform duration-1000 opacity-100" loading="lazy" decoding="async" referrerpolicy="no-referrer">
              </div>
              <div class="relative z-10 max-w-lg bg-white/80 p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] backdrop-blur-md border border-white/60 shadow-lg">
                <h3 class="font-serif text-[26px] sm:text-[36px] text-brand-900 mb-2 sm:mb-3 leading-tight" [innerHTML]="c().home.meetTitle | formatText"></h3>
                <p class="body-md text-brand-900/80 mb-4 sm:mb-6 text-[13px] sm:text-[15px] leading-relaxed font-['Noto_Sans_Sinhala']">
                  වසර 30කට වැඩි කාලයක් පුරා විලාසිතා නිර්මාණකරණයේ නියැලෙමින්, කාන්තාවන් සිය ගණනකට සාර්ථක නිවෙස් පදනම් කරගත් විලාසිතා ව්‍යාපාර ආරම්භ කිරීමට මඟපෙන්වූ ප්‍රවීණ අත්දැකීම්.
                </p>
                <div class="flex items-center label-md text-brand-900 group-hover:text-brand-600 transition-colors font-semibold">
                  {{ c().home.meetBtn }} <mat-icon class="ml-2 text-[16px] transform group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
                </div>
              </div>
            </a>
          </div>
        </div>

        @if (false) {
        <div class="w-full md:w-1/3">
          <div class="gradient-shell h-full">
            <a routerLink="/sew-and-su" class="gradient-shell-inner p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_25px_50px_-12px_rgba(248,58,100,0.15)] transition-shadow min-h-[460px]">
               <div class="absolute inset-0 z-0">
                 <img src="https://images.unsplash.com/photo-1598466185850-2f16246fcd20?q=80&w=1200&auto=format&fit=crop" alt="Custom Tailoring" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-40 mix-blend-multiply" referrerpolicy="no-referrer">
                 <div class="absolute inset-0 bg-gradient-to-t from-brand-100/90 via-white/80 to-brand-50/70"></div>
               </div>

               <div class="relative z-10 w-14 h-14 bg-white/90 backdrop-blur text-brand-700 rounded-2xl flex items-center justify-center mb-auto group-hover:scale-110 transition-transform shadow-md">
                 <mat-icon class="text-[28px]">content_cut</mat-icon>
               </div>

               <div class="relative z-10 mt-12">
                 <h3 class="font-serif text-[28px] text-brand-900 mb-2 leading-tight" [innerHTML]="c().home.bento2Title | formatText"></h3>
                 <p class="body-md text-brand-900/80 mb-6 text-[14px] leading-relaxed" [innerHTML]="c().home.bento2Desc | formatText"></p>
                 <div class="flex items-center label-md text-brand-900 group-hover:text-brand-600 transition-colors font-semibold">
                    {{ c().home.bento2Btn }} <mat-icon class="ml-2 text-[16px] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all">arrow_forward</mat-icon>
                 </div>
               </div>
            </a>
          </div>
        </div>
        }

      </div>
    </section>

    <!-- 5. Testimonial Quote -->
    <section class="py-8 sm:py-12 px-4 sm:px-6 lg:px-[64px] w-full mb-8 sm:mb-12 max-w-[1600px] mx-auto">
      <div class="gradient-shell">
        <div class="gradient-shell-inner p-8 sm:p-12 md:p-20 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] bg-white/60">
          <div class="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1583922606661-0822ed0bd916?q=75&w=1200&auto=format&fit=crop" alt="Couture Atelier Fabric" class="w-full h-full object-cover opacity-20 mix-blend-multiply scale-105" loading="lazy" decoding="async" referrerpolicy="no-referrer">
            <div class="absolute inset-0 bg-gradient-to-b from-brand-50/90 via-white/80 to-brand-100/90"></div>
          </div>

          <mat-icon class="text-brand-400 text-[40px] sm:text-[56px] mb-3 sm:mb-4 relative z-10">format_quote</mat-icon>
          <p class="font-serif text-[20px] sm:text-[28px] md:text-[40px] text-brand-900 leading-[1.3] sm:leading-[1.2] tracking-tight mb-6 sm:mb-8 max-w-4xl relative z-10" [innerHTML]="c().home.testimonialQuote | formatText">
          </p>
          <div class="flex flex-col items-center justify-center relative z-10">
            <span class="label-md text-brand-900 mb-1 font-semibold">Amasha P. · Colombo</span>
            <span class="body-md text-brand-600">Home Tailor & Boutique Owner</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Modal Viewer -->
    @if (activeVideo()) {
      <div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <button type="button" (click)="closeVideo()" class="fixed inset-0 w-full h-full cursor-default bg-transparent border-0 -z-10" aria-label="Close modal background"></button>
        <div class="relative m-auto w-full max-w-[calc(85vh*9/16)] aspect-[9/16] bg-slate-900 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-2xl border border-white/20 shrink-0">
          <button type="button" (click)="closeVideo()" class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors" aria-label="Close video player">
            <mat-icon>close</mat-icon>
          </button>
          
          <div class="relative w-full h-full bg-black">
            <img [src]="activeVideo()!.thumbnail" [alt]="activeVideo()!.title" class="w-full h-full object-cover" referrerpolicy="no-referrer">
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
              <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                <mat-icon class="text-[36px]">play_arrow</mat-icon>
              </div>
              <h4 class="font-serif text-[22px] mb-2">{{ activeVideo()!.title }}</h4>
              <p class="text-[13px] text-white/80 mb-6">Watch this tutorial directly on {{ activeVideo()!.platform === 'tiktok' ? 'TikTok' : 'Facebook' }} for high-definition streaming.</p>
              
              <a [href]="activeVideo()!.url" target="_blank" rel="noopener noreferrer" class="btn-primary !bg-white !text-slate-950 hover:!bg-brand-50 flex items-center gap-2 px-6 py-3">
                <span>Open in {{ activeVideo()!.platform === 'tiktok' ? 'TikTok' : 'Facebook' }}</span>
                <mat-icon class="text-[18px]">open_in_new</mat-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class Home implements OnInit {
  contentService = inject(ContentService);
  cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  deadline = new Date(2026, 8, 30, 23, 59, 59).getTime();
  
  isOfferValid() {
    return Date.now() < this.deadline;
  }

  c = this.contentService.content;

  reelContainer = viewChild<ElementRef<HTMLDivElement>>('reelContainer');
  activeVideo = signal<SocialVideo | null>(null);

  // Digital Guides & Mentorship Programs
  defaultCourses = [
    {
      id: '100-day-tailoring-business-workbook',
      title: 'Become a Successful Tailoring Entrepreneur in 100 Days',
      level: 'PDF E-BOOK',
      badge: 'Best Seller',
      price: 'LKR 690',
      duration: '28 PAGES',
      description: 'ඔයාගේ මැහුම් Skill එකෙන් **තමන්ගේම Business එකක් ගොඩනගන්න**, Product එක තෝරගන්න තැන ඉදන් **Pricing, Online Presence, Content, Orders, Delivery සහ Launch** දක්වා දින 100ක් පුරා Step-by-Step follow කරන්න පුළුවන් Practical Workbook එකක්.',
      features: [
        'Build Your Product & Set Your Price',
        'Build Your Online Business Presence',
        'Create Content & Find Customers',
        'Set Up Orders & Delivery',
        'Launch & Grow Your Business'
      ],
      image: '/images/Workbook.jpeg'
    },
    {
      id: '6-month-tailoring-business-mentorship',
      title: '100-Day Tailoring Business Building Program',
      level: 'Mentorship',
      badge: 'Limited Slots',
      price: 'රු. 45,000 (පහසු ගෙවීමේ ක්රමයටද ලබාගත හැක)',
      duration: 'දින 100යි (100 Days)',
      description: 'Product එකක් හදාගැනීමේ ඉඳන් Pricing, Online Presence, Content, Customer Enquiries, Sales සහ Business Growth දක්වා — ඉගෙනගෙන නවතින්නේ නැතුව, ඔයාගේම Business එකට apply කරගෙන යන්න.',
      features: [
        'Build a Product or Service',
        'Create Your Online Business Presence',
        'Turn Enquiries into Sales & Learn Organic & Paid Growth',
        'Build Your 90-Day Growth Plan'
      ],
      image: '/images/product_Mentorship.png'
    }
  ];

  displayCourses = signal<any[]>(this.defaultCourses);

  // Default Seed Videos (TikTok & Facebook Sewing Tips)
  defaultVideos: SocialVideo[] = [
    {
      id: 'v1',
      title: 'Create a Neckline Design in 90 Seconds',
      platform: 'tiktok',
      url: 'https://vt.tiktok.com/ZSqgwU2JT/',
      thumbnail: '/social-media-card-images/tiktok_card_1.jpeg',
      views: '345K',
      duration: '0:58',
      author: 'Swarna Herath'
    },
    {
      id: 'v2',
      title: 'Create Different Styles Using Basic Patterns',
      platform: 'facebook',
      url: 'https://www.facebook.com/share/v/19e5ddqoup/?mibextid=wwXIfr',
      thumbnail: '/social-media-card-images/Fb_card_1.jpeg',
      views: '210K',
      duration: '1:15',
      author: 'Su Collection'
    },
    {
      id: 'v3',
      title: 'Dart Manipulation Made Simple',
      platform: 'tiktok',
      url: 'https://vt.tiktok.com/ZSqgfd41U/',
      thumbnail: '/social-media-card-images/tiktok_card_2.jpeg',
      views: '185K',
      duration: '0:45',
      author: 'Swarna Herath'
    },
    {
      id: 'v4',
      title: 'How to Join Two Bias Strips in 30 Seconds',
      platform: 'tiktok',
      url: 'https://www.tiktok.com/@swarnaherath527/video/7569840977985293575?is_from_webapp=1&sender_device=pc&web_id=7686381380838065665',
      thumbnail: '/social-media-card-images/tiktok_card_3.jpeg',
      views: '142K',
      duration: '0:52',
      author: 'Swarna Herath'
    },
    {
      id: 'v5',
      title: 'The Easiest Way to Attach Piping',
      platform: 'facebook',
      url: 'https://www.facebook.com/share/v/1GU4sRUyKf/',
      thumbnail: '/social-media-card-images/Fb_card_2.jpeg',
      views: '98K',
      duration: '1:30',
      author: 'Su Collection'
    }
  ];

  dbVideos = signal<SocialVideo[]>([]);
  displayVideos = signal<SocialVideo[]>(this.defaultVideos);
  activeSlideIndex = signal(0);

  // Drag-to-slide state
  isMouseDown = false;
  startX = 0;
  scrollStartLeft = 0;
  dragDistance = 0;

  ngOnInit() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('sc_current_order');
    }

    // Handle incoming fragment navigation (e.g. from Success page "Continue Shopping")
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'digital-offerings' && typeof window !== 'undefined') {
        const doScroll = () => {
          const el = document.getElementById('digital-offerings');
          if (el) {
            const navbarHeight = 120;
            const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        };
        // Small delay to allow Angular to render
        setTimeout(doScroll, 150);
      }
    });
    // Use default hardcoded videos
    this.displayVideos.set(this.defaultVideos);
    
    // const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    // onSnapshot(q, (snapshot) => {
    //   if (!snapshot.empty) {
    //     const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialVideo));
    //     this.dbVideos.set(items);
    //     this.displayVideos.set(items);
    //   } else {
    //     this.displayVideos.set(this.defaultVideos);
    //   }
    // }, (err) => {
    //   console.warn("Using fallback default videos:", err);
    //   this.displayVideos.set(this.defaultVideos);
    // });

    const coursesQ = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    onSnapshot(coursesQ, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          let id = doc.id;
          
          if (id === 'sri-lankan-saree-jacket-master-blueprint' || 
              (typeof data['title'] === 'string' && data['title'].includes('Tailoring Entrepreneur')) ||
              (typeof data['subtitle'] === 'string' && data['subtitle'].includes('Workbook'))) {
            id = '100-day-tailoring-business-workbook';
          }
          if (id === 'mentorship' || id === 'couture-and-tailoring-business-mentorship') {
            id = '6-month-tailoring-business-mentorship';
          }

          if (id === '100-day-tailoring-business-workbook') {
            data['image'] = '/images/Workbook.jpeg';
            data['title'] = 'Become a Successful Tailoring Entrepreneur in 100 Days';
            data['subtitle'] = '100-Day Tailoring Business Workbook (PDF)';
            data['price'] = 'LKR 690';
            data['duration'] = '28 PAGES';
            data['level'] = 'PDF E-BOOK';
            data['badge'] = '';
            data['description'] = 'ඔයාගේ මැහුම් Skill එකෙන් **තමන්ගේම Business එකක් ගොඩනගන්න**, Product එක තෝරගන්න තැන ඉදන් **Pricing, Online Presence, Content, Orders, Delivery සහ Launch** දක්වා දින 100ක් පුරා Step-by-Step follow කරන්න පුළුවන් Practical Workbook එකක්.';
            data['features'] = [
              'Build Your Product & Set Your Price',
              'Build Your Online Business Presence',
              'Create Content & Find Customers',
              'Set Up Orders & Delivery',
              'Launch & Grow Your Business'
            ];
          }
          if (id === '6-month-tailoring-business-mentorship') {
            data['title'] = '100-Day Tailoring Business Building Program';
            data['duration'] = 'දින 100යි (100 Days)';
            data['description'] = 'Product එකක් හදාගැනීමේ ඉඳන් Pricing, Online Presence, Content, Customer Enquiries, Sales සහ Business Growth දක්වා — ඉගෙනගෙන නවතින්නේ නැතුව, ඔයාගේම Business එකට apply කරගෙන යන්න.';
            data['features'] = [
              'Build a Product or Service',
              'Create Your Online Business Presence',
              'Turn Enquiries into Sales & Learn Organic & Paid Growth',
              'Build Your 90-Day Growth Plan'
            ];
            data['price'] = 'රු. 45,000 (පහසු ගෙවීමේ ක්රමයටද ලබාගත හැක)';
            data['image'] = '/images/product_Mentorship.png';
          }
          return { ...data, id };
        });
        this.displayCourses.set(items);
      } else {
        this.displayCourses.set(this.defaultCourses);
      }
    }, (err) => {
      this.displayCourses.set(this.defaultCourses);
    });
  }

  onScroll() {
    const el = this.reelContainer()?.nativeElement;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 20 : 280;
    const index = Math.round(el.scrollLeft / cardWidth);
    const maxIndex = this.displayVideos().length - 1;
    this.activeSlideIndex.set(Math.max(0, Math.min(index, maxIndex)));
  }

  scrollToIndex(index: number) {
    const el = this.reelContainer()?.nativeElement;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 20 : 280;
    el.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
    this.activeSlideIndex.set(index);
  }

  slidePrev() {
    const prevIdx = Math.max(0, this.activeSlideIndex() - 1);
    this.scrollToIndex(prevIdx);
  }

  slideNext() {
    const maxIdx = this.displayVideos().length - 1;
    const nextIdx = Math.min(maxIdx, this.activeSlideIndex() + 1);
    this.scrollToIndex(nextIdx);
  }

  onMouseDown(e: MouseEvent) {
    this.isMouseDown = true;
    this.dragDistance = 0;
    const el = this.reelContainer()?.nativeElement;
    if (!el) return;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollStartLeft = el.scrollLeft;
  }

  onMouseMove(e: MouseEvent) {
    if (!this.isMouseDown) return;
    const el = this.reelContainer()?.nativeElement;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - this.startX) * 1.5;
    this.dragDistance = Math.abs(walk);
    el.scrollLeft = this.scrollStartLeft - walk;
  }

  onMouseUp() {
    this.isMouseDown = false;
  }

  onMouseLeave() {
    this.isMouseDown = false;
  }

  handleCardClick(video: SocialVideo) {
    if (this.dragDistance > 8) {
      this.dragDistance = 0;
      return; // Dragged, so don't trigger click/open
    }
    this.openVideo(video);
  }

  scrollReel(direction: 'left' | 'right') {
    if (direction === 'left') {
      this.slidePrev();
    } else {
      this.slideNext();
    }
  }

  openVideo(video: SocialVideo) {
    this.activeVideo.set(video);
  }

  closeVideo() {
    this.activeVideo.set(null);
  }

  getGeneralWhatsAppUrl(): string {
    const phone = this.c().app.whatsappNumber || '94771234567';
    const message = encodeURIComponent(
      `Hello Swarna, I visited Su Collection website. I would like to learn more about your sewing mentorship, e-books, and custom tailoring!`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  getWhatsAppOrderUrl(item: DigitalGuide): string {
    const phone = this.c().app.whatsappNumber || '94771234567';
    const bank = this.c().app.bankName || 'Commercial Bank';
    const acc = this.c().app.accountNumber || '1000 2489 5821';
    
    const message = encodeURIComponent(
      `🛍️ *Order Request for ${item.title}*\n\n` +
      `Category: ${item.category}\n` +
      `Price: LKR ${item.price.toLocaleString()}\n\n` +
      `Hi Swarna, I want to purchase this guide / enroll in this mentorship. Please confirm your bank details (${bank} Acct: ${acc}) so I can transfer the payment and send you my deposit slip screenshot!`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  addToCart(item: any) {
    const numericPrice = parseInt(String(item.price).replace(/\D/g, ''), 10) || 0;
    this.cartService.addItem({
      id: item.id,
      name: item.title,
      price: numericPrice,
      image: item.image,
      quantity: 1
    });
  }
  scrollToOfferings() {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('digital-offerings');
    if (!el) return;
    const navbarHeight = 120;
    const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  viewDetails(courseId: string) {
    this.router.navigate(['/learn', courseId]);
  }
}
