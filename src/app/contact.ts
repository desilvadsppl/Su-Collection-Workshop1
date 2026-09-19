import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ContentService} from './services/content.service';
import {FormatTextPipe} from './pipes/format-text.pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contact',
  imports: [MatIconModule, FormsModule, ReactiveFormsModule, FormatTextPipe],
  template: `
    <header class="pt-[120px] pb-[64px] px-6 text-center max-w-[1600px] mx-auto">
      <div class="max-w-4xl mx-auto">
        <h1 class="display-lg mb-[24px] text-brand-900" [innerHTML]="c().contact.heroTitle | formatText"></h1>
        <p class="body-md text-[18px] text-brand-900/80 max-w-2xl mx-auto font-light leading-relaxed" [innerHTML]="c().contact.heroDesc | formatText">
        </p>
      </div>
    </header>

    <main class="px-6 lg:px-[64px] pb-[64px] w-full max-w-[1600px] mx-auto">
      <div class="flex flex-col lg:flex-row gap-[24px] max-w-6xl mx-auto">
        
        <!-- Contact Info -->
        <div class="w-full lg:w-5/12 flex flex-col gap-[24px]">
          <div class="gradient-shell h-full">
            <div class="gradient-shell-inner !bg-brand-900 p-[48px] lg:p-[64px] h-full flex flex-col justify-center">
              <mat-icon class="text-brand-300 text-[48px] mb-[32px] block">chat</mat-icon>
              <h3 class="font-serif text-[40px] text-white mb-[24px] leading-tight" [innerHTML]="c().contact.whatsappTitle | formatText"></h3>
              <p class="body-md text-[16px] text-brand-100/90 mb-[40px] font-light" [innerHTML]="c().contact.whatsappDesc | formatText">
              </p>
              <a href="https://wa.me/94771234567" target="_blank" class="inline-flex items-center gap-[12px] bg-white text-brand-900 px-[32px] py-[16px] rounded-full label-md hover:bg-brand-50 transition-colors shadow-lg self-start">
                {{ c().contact.whatsappBtn }}
              </a>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="w-full lg:w-7/12">
          <div class="gradient-shell h-full">
            <div class="gradient-shell-inner p-[48px] lg:p-[64px] h-full">
              <h2 class="font-serif text-[40px] text-brand-900 mb-[48px] leading-tight" [innerHTML]="c().contact.formTitle | formatText"></h2>
              <form [formGroup]="contactForm" (ngSubmit)="sendMessage()" class="flex flex-col gap-[32px]">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-[32px]">
                  <div>
                    <label class="block label-md text-brand-900 mb-[12px]">Your Name *</label>
                    <input type="text" formControlName="name" class="w-full bg-white/40 border border-brand-200 backdrop-blur-sm rounded-[24px] px-[20px] py-[16px] focus:outline-none focus:border-brand-400 transition-all body-md" placeholder="e.g. Jane Doe">
                  </div>
                  <div>
                    <label class="block label-md text-brand-900 mb-[12px]">Topic</label>
                    <select formControlName="topic" class="w-full bg-white/40 border border-brand-200 backdrop-blur-sm rounded-[24px] px-[20px] py-[16px] focus:outline-none focus:border-brand-400 transition-all appearance-none body-md">
                      <option value="Sewing Classes">Sewing Classes</option>
                      <option value="Custom Order">Custom Order</option>
                      <option value="Shop Products">Shop Products</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block label-md text-brand-900 mb-[12px]">Message *</label>
                  <textarea formControlName="message" rows="4" class="w-full bg-white/40 border border-brand-200 backdrop-blur-sm rounded-[24px] p-[20px] focus:outline-none focus:border-brand-400 focus:bg-white/60 transition-all placeholder:text-brand-900/40 body-md" placeholder="How can we help you?"></textarea>
                </div>
                
                <div class="pt-[16px]">
                  <button type="submit" [disabled]="contactForm.invalid" class="w-full btn-primary py-[16px] flex items-center justify-center gap-[12px] disabled:opacity-50 transition-opacity">
                    <mat-icon class="text-[20px]">send</mat-icon>
                    Send to WhatsApp
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </main>
  `
})
export class Contact {
  private fb = inject(FormBuilder);
  contentService = inject(ContentService);
  c = this.contentService.content;
  
  contactForm = this.fb.group({
    name: ['', Validators.required],
    topic: ['Sewing Classes'],
    message: ['', Validators.required]
  });

  sendMessage() {
    if (this.contactForm.invalid) return;
    
    const data = this.contactForm.value;
    const msg = `Hi Su Collection! I'm ${data.name}.\n\nTopic: ${data.topic}\n\nMessage: ${data.message}`;
    const encodedMsg = encodeURIComponent(msg);
    
    window.open(`https://wa.me/94771234567?text=${encodedMsg}`, '_blank');
    this.contactForm.reset({ topic: 'Sewing Classes' });
  }
}
