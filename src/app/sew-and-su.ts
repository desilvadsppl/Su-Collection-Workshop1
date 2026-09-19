import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {db} from '../lib/firebase';
import {collection, addDoc, serverTimestamp} from 'firebase/firestore';
import {ContentService} from './services/content.service';
import {FormatTextPipe} from './pipes/format-text.pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sew-and-su',
  imports: [MatIconModule, FormsModule, ReactiveFormsModule, FormatTextPipe],
  template: `
    <!-- Header -->
    <header class="pt-[40px] pb-[48px] px-6 text-center max-w-[1600px] mx-auto">
      <div class="relative w-full rounded-[36px] sm:rounded-[48px] overflow-hidden p-10 sm:p-16 border border-white/20 shadow-2xl text-white bg-slate-950 group">
        <!-- Background Editorial Fashion Tailoring Image -->
        <div class="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1598466185850-2f16246fcd20?q=75&w=1200&auto=format&fit=crop" 
               alt="Custom Made Dresses" 
               class="w-full h-full object-cover opacity-45 mix-blend-luminosity group-hover:scale-105 transition-transform duration-1000" 
               fetchpriority="high"
               decoding="async"
               referrerpolicy="no-referrer">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/50"></div>
        </div>

        <div class="relative z-10 max-w-4xl mx-auto">
          <span class="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-300 label-md uppercase tracking-[0.2em] text-[12px] mb-6">
            Custom Tailoring Services
          </span>
          <h1 class="display-lg mb-[24px] text-white font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.heroTitle | formatText"></h1>
          <p class="body-md text-[18px] text-brand-100/90 max-w-2xl mx-auto font-light leading-relaxed font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.heroDesc | formatText">
          </p>
        </div>
      </div>
    </header>

    <main class="px-6 lg:px-[64px] pb-[64px] w-full">
      <div class="flex flex-col lg:flex-row gap-[24px]">
        
        <!-- Order Form Intake -->
        <div class="w-full lg:w-7/12">
          <div class="gradient-shell h-full">
            <div class="gradient-shell-inner p-[64px] relative">
              <h2 class="font-serif text-[40px] text-brand-900 mb-[48px] leading-tight font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.formTitle | formatText"></h2>
              
              <form [formGroup]="bookingForm" (ngSubmit)="submitBooking()" class="flex flex-col gap-[32px]">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
                  <div>
                    <label class="block label-md text-brand-900 mb-[12px]">Your Name *</label>
                    <input type="text" formControlName="customerName" class="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[24px] px-[20px] py-[16px] focus:outline-none focus:border-brand-400 transition-all body-md" placeholder="e.g. Jane Doe">
                  </div>
                  <div>
                    <label class="block label-md text-brand-900 mb-[12px]">Phone Number *</label>
                    <input type="tel" formControlName="phone" class="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[24px] px-[20px] py-[16px] focus:outline-none focus:border-brand-400 transition-all body-md" placeholder="e.g. 077 123 4567">
                  </div>
                </div>

                <!-- Occasion -->
                <div>
                  <label class="block label-md text-brand-900 mb-[12px]">What kind of outfit do you want? *</label>
                  <textarea formControlName="notes" rows="4" class="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[24px] p-[20px] focus:outline-none focus:border-brand-400 focus:bg-white/60 transition-all placeholder:text-brand-900/40 body-md" placeholder="Tell us about the event, what kind of fabric you like, or any specific details..."></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
                  <!-- Timeline -->
                  <div>
                    <label class="block label-md text-brand-900 mb-[12px]">When do you need it?</label>
                    <select formControlName="garmentType" class="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[24px] px-[20px] py-[16px] focus:outline-none focus:border-brand-400 transition-all appearance-none body-md">
                      <option value="Standard (3-4 Weeks)">Standard (3-4 Weeks)</option>
                      <option value="Rush (1-2 Weeks)">Rush (1-2 Weeks)</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                  <!-- Budget -->
                  <div>
                    <label class="block label-md text-brand-900 mb-[12px]">Budget Range</label>
                    <select formControlName="budget" class="w-full bg-white/40 border border-white/60 backdrop-blur-sm rounded-[24px] px-[20px] py-[16px] focus:outline-none focus:border-brand-400 transition-all appearance-none body-md">
                      <option value="Rs. 10,000 - Rs. 25,000">Rs. 10,000 - Rs. 25,000</option>
                      <option value="Rs. 25,000 - Rs. 50,000">Rs. 25,000 - Rs. 50,000</option>
                      <option value="Rs. 50,000+">Rs. 50,000+</option>
                    </select>
                  </div>
                </div>

                <!-- CTA -->
                <div class="pt-[32px] mt-[12px] border-t border-brand-200">
                  <button type="submit" [disabled]="bookingForm.invalid || isSubmitting()" class="w-full btn-primary flex items-center justify-center gap-[12px] py-[16px] disabled:opacity-50 transition-opacity">
                    <mat-icon class="text-[20px]">chat</mat-icon>
                    {{ isSubmitting() ? 'Sending...' : 'Send Details via WhatsApp' }}
                  </button>
                  <p class="body-md text-[12px] text-brand-900/60 mt-[16px] text-center">
                    You will be redirected to WhatsApp to chat directly with Swarna's team.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- How it works & Portfolio snapshot -->
        <div class="w-full lg:w-5/12 flex flex-col gap-[24px]">
          
          <!-- Process -->
          <div class="gradient-shell">
            <div class="gradient-shell-inner p-[48px] lg:p-[64px] relative overflow-hidden">
              <!-- Background Image -->
              <div class="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=75&w=800&auto=format&fit=crop" alt="Tailoring Atelier" class="w-full h-full object-cover opacity-35 mix-blend-luminosity scale-105" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/90 to-slate-950/80"></div>
              </div>

              <div class="relative z-10">
                <h3 class="font-serif text-[32px] text-white mb-[40px] leading-tight font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.processTitle | formatText"></h3>
                <div class="flex flex-col gap-[32px]">
                  <div class="flex gap-[24px]">
                    <div class="w-[40px] h-[40px] rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center body-md font-semibold shrink-0 text-brand-300 shadow-inner">1</div>
                    <div>
                      <h4 class="body-md font-medium text-white mb-[8px] font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.step1Title | formatText"></h4>
                      <p class="body-md text-[14px] text-brand-100/80 font-light font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.step1Desc | formatText"></p>
                    </div>
                  </div>
                  <div class="flex gap-[24px]">
                    <div class="w-[40px] h-[40px] rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center body-md font-semibold shrink-0 text-brand-300 shadow-inner">2</div>
                    <div>
                      <h4 class="body-md font-medium text-white mb-[8px] font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.step2Title | formatText"></h4>
                      <p class="body-md text-[14px] text-brand-100/80 font-light font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.step2Desc | formatText"></p>
                    </div>
                  </div>
                  <div class="flex gap-[24px]">
                    <div class="w-[40px] h-[40px] rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center body-md font-semibold shrink-0 text-brand-300 shadow-inner">3</div>
                    <div>
                      <h4 class="body-md font-medium text-white mb-[8px] font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.step3Title | formatText"></h4>
                      <p class="body-md text-[14px] text-brand-100/80 font-light font-['Noto_Sans_Sinhala']" [innerHTML]="c().sewAndSu.step3Desc | formatText"></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mini Portfolio -->
          <div class="gradient-shell flex-1">
            <div class="gradient-shell-inner p-[64px]">
              <div class="flex items-center justify-between mb-[32px]">
                <h3 class="font-serif text-[24px] text-brand-900">Recent Work</h3>
              </div>
              <div class="grid grid-cols-2 gap-[16px]">
                 <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=75&w=500&auto=format&fit=crop" class="w-full aspect-[4/5] object-cover rounded-[24px]" alt="Dress" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                 <img src="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=75&w=500&auto=format&fit=crop" class="w-full aspect-[4/5] object-cover rounded-[24px]" alt="Dress" loading="lazy" decoding="async" referrerpolicy="no-referrer">
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  `
})
export class SewAndSu {
  private fb = inject(FormBuilder);
  contentService = inject(ContentService);
  c = this.contentService.content;
  
  isSubmitting = signal(false);
  
  bookingForm = this.fb.group({
    customerName: ['', Validators.required],
    phone: ['', Validators.required],
    notes: ['', Validators.required],
    garmentType: ['Standard (3-4 Weeks)'],
    budget: ['Rs. 10,000 - Rs. 25,000']
  });

  async submitBooking() {
    if (this.bookingForm.invalid) return;
    
    this.isSubmitting.set(true);
    const data = this.bookingForm.value;
    
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, 'bookings'), {
        ...data,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      
      // 2. Open WhatsApp
      const msg = `Hi Su Collection! I'm ${data.customerName}. I'd like to order a custom outfit.\n\nVision: ${data.notes}\nTimeline: ${data.garmentType}\nBudget: ${data.budget}`;
      const encodedMsg = encodeURIComponent(msg);
      window.open(`https://wa.me/94771234567?text=${encodedMsg}`, '_blank');
      
      this.bookingForm.reset();
    } catch (e) {
      console.error(e);
      alert('Failed to submit consultation. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
