import {ChangeDetectionStrategy, Component, inject, signal, OnInit, effect} from '@angular/core';
import {RouterLink, Router} from '@angular/router';
import {Location} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors} from '@angular/forms';
import {CartService} from './services/cart.service';
import {ContentService} from './services/content.service';
import {db} from '../lib/firebase';
import {doc, setDoc, serverTimestamp} from 'firebase/firestore';
import {COUNTRIES} from './countries';

type Country = typeof COUNTRIES[0];

// Standalone validator — must live outside the class to avoid circular type inference
function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value;
  if (!value) return null;

  const parent = control.parent;
  if (!parent) return null;

  const countryCode: string = parent.get('countryCode')?.value;
  const country: Country | undefined = COUNTRIES.find((c: Country) => c.code === countryCode);
  if (!country) return null;

  const targetLength: number = String(country.placeholder).replace(/[^0-9]/g, '').length;
  let cleaned: string = value.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);

  if (cleaned.length !== targetLength) {
    return { exactLength: { requiredLength: targetLength, actualLength: cleaned.length } };
  }
  return null;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-checkout',
  imports: [RouterLink, MatIconModule, ReactiveFormsModule],
  template: `
    <main class="min-h-screen pt-[100px] sm:pt-[120px] pb-[60px] sm:pb-[80px] px-4 sm:px-6 max-w-[1100px] mx-auto">
      <div class="mb-6 sm:mb-[32px] flex items-center justify-between">
        <button (click)="goBack()" class="text-brand-900/60 hover:text-brand-900 transition-colors label-md flex items-center bg-transparent border-none cursor-pointer p-0">
          <mat-icon class="mr-2 text-[18px]">arrow_back</mat-icon> Back
        </button>
      </div>

      @if (cartService.items().length === 0) {
        <div class="bg-white rounded-[32px] p-8 sm:p-14 text-center border border-brand-100 shadow-sm max-w-xl mx-auto my-12">
          <div class="w-16 h-16 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-[32px]">shopping_cart</mat-icon>
          </div>
          <h2 class="font-serif text-[28px] sm:text-[34px] text-brand-900 mb-3">Your Cart is Empty</h2>
          <p class="body-md text-brand-900/70 mb-6">
            You don't have any items in your cart to checkout. Please select a cutting guide, mentorship program, or sewing tool first.
          </p>
          <div class="flex justify-center">
            <a routerLink="/learn" class="btn-primary">Explore our services and products</a>
          </div>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          <!-- Checkout Form Side -->
          <div class="lg:col-span-7">
            <h1 class="font-serif text-[36px] sm:text-[46px] text-brand-900 mb-6 leading-tight">ඔයාගේ Order එක Complete කරමු</h1>
            
            <form [formGroup]="checkoutForm" (ngSubmit)="processOrder()" class="flex flex-col gap-6">
              
              <!-- 1. Customer Details -->
              <section class="bg-brand-50/40 p-6 sm:p-8 rounded-[28px] border border-brand-100 shadow-sm">
                <div class="flex items-center gap-2.5 mb-5 pb-3 border-b border-brand-50">
                  <div class="w-7 h-7 rounded-full bg-brand-900 text-white flex items-center justify-center text-[12px] font-bold">1</div>
                  <h3 class="font-serif text-[20px] text-brand-900">ඔයාගේ විස්තර</h3>
                </div>

                <div class="flex flex-col gap-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[13px] sm:text-[14px] text-brand-900/90 mb-1.5 font-bold">මුල් නම <span class="text-rose-500">*</span></label>
                      <input type="text" formControlName="firstName" placeholder="Hemachandra" class="w-full appearance-none shadow-sm border border-brand-200 rounded-xl py-3 px-4 outline-none focus:border-brand-900 transition-colors body-md" style="background-color: white !important;" [class.border-rose-400]="checkoutForm.get('firstName')?.touched && checkoutForm.get('firstName')?.invalid">
                      @if (checkoutForm.get('firstName')?.touched) {
                        @if (checkoutForm.get('firstName')?.errors?.['required']) {
                          <p class="text-rose-500 text-[11px] mt-1">First name is required</p>
                        } @else if (checkoutForm.get('firstName')?.errors?.['pattern']) {
                          <p class="text-rose-500 text-[11px] mt-1">Only letters and spaces are allowed</p>
                        }
                      }
                    </div>
                    <div>
                      <label class="block text-[13px] sm:text-[14px] text-brand-900/90 mb-1.5 font-bold">අග නම <span class="text-rose-500">*</span></label>
                      <input type="text" formControlName="lastName" placeholder="Silva" class="w-full appearance-none shadow-sm border border-brand-200 rounded-xl py-3 px-4 outline-none focus:border-brand-900 transition-colors body-md" style="background-color: white !important;" [class.border-rose-400]="checkoutForm.get('lastName')?.touched && checkoutForm.get('lastName')?.invalid">
                      @if (checkoutForm.get('lastName')?.touched) {
                        @if (checkoutForm.get('lastName')?.errors?.['required']) {
                          <p class="text-rose-500 text-[11px] mt-1">Last name is required</p>
                        } @else if (checkoutForm.get('lastName')?.errors?.['pattern']) {
                          <p class="text-rose-500 text-[11px] mt-1">Only letters and spaces are allowed</p>
                        }
                      }
                    </div>
                  </div>

                  <div>
                    <label class="block text-[13px] sm:text-[14px] text-brand-900/90 mb-1.5 font-bold">
                      WhatsApp අංකය <span class="text-rose-500">*</span>
                    </label>
                    <div class="flex flex-col sm:flex-row gap-2">
                      <div class="relative w-full sm:w-[180px] shrink-0">
                        <select 
                          formControlName="countryCode"
                          class="w-full bg-white border border-brand-200 rounded-xl py-3 pl-4 pr-8 outline-none focus:border-brand-900 transition-colors body-md appearance-none cursor-pointer truncate">
                          @for (country of countries; track country.code) {
                            <option [value]="country.code">{{ country.name }}</option>
                          }
                        </select>
                        <mat-icon class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none text-[18px]">expand_more</mat-icon>
                      </div>
                      <div class="relative flex-1">
                        <input 
                          type="tel" 
                          formControlName="phone" 
                          [placeholder]="getPhonePlaceholder()" 
                          maxlength="15"
                          class="w-full appearance-none shadow-sm border border-brand-200 rounded-xl py-3 px-4 outline-none focus:border-brand-900 transition-colors body-md" style="background-color: white !important;"
                          [class.border-rose-400]="checkoutForm.get('phone')?.touched && checkoutForm.get('phone')?.invalid">
                      </div>
                    </div>
                    @if (checkoutForm.get('phone')?.touched) {
                      @if (checkoutForm.get('phone')?.errors?.['required']) {
                        <p class="text-rose-500 text-[11px] mt-1">Phone number is required</p>
                      } @else if (checkoutForm.get('phone')?.errors?.['pattern']) {
                        <p class="text-rose-500 text-[11px] mt-1">Please enter a valid phone number (digits only)</p>
                      } @else if (checkoutForm.get('phone')?.errors?.['exactLength']) {
                        <p class="text-rose-500 text-[11px] mt-1">
                          Phone number must be exactly {{ checkoutForm.get('phone')?.errors?.['exactLength'].requiredLength }} digits for this country (you entered {{ checkoutForm.get('phone')?.errors?.['exactLength'].actualLength }})
                        </p>
                      }
                    }
                    <span class="text-[11px] text-brand-900/60 mt-1 block">Digital pattern PDFs and receipts are delivered to this WhatsApp number.</span>
                  </div>

                  <div>
                    <label class="block text-[13px] sm:text-[14px] text-brand-900/90 mb-1.5 font-bold">
                      Email ලිපිනය (අත්‍යවශ්‍ය නොවේ)
                    </label>
                    <input 
                      type="email" 
                      formControlName="email" 
                      placeholder="yourname@example.com" 
                      class="w-full appearance-none shadow-sm border border-brand-200 rounded-xl py-3 px-4 outline-none focus:border-brand-900 transition-colors body-md" style="background-color: white !important;"
                      [class.border-rose-400]="checkoutForm.get('email')?.touched && checkoutForm.get('email')?.invalid">
                    @if (checkoutForm.get('email')?.touched) {
                      @if (checkoutForm.get('email')?.errors?.['required']) {
                        <p class="text-rose-500 text-[11px] mt-1">Email is required</p>
                      } @else if (checkoutForm.get('email')?.errors?.['email']) {
                        <p class="text-rose-500 text-[11px] mt-1">Please enter a valid email address</p>
                      }
                    }
                  </div>

                  <div>
                    <div class="flex justify-between items-end mb-1">
                      <label class="block text-[13px] sm:text-[14px] text-brand-900/90 font-bold">ඔයාගේ ප්‍රධාන අරමුණු මොනවාද? ප්‍රශ්න තියෙනවද? (අත්‍යවශ්‍ය නොවේ)</label>
                      <span class="text-[10px] text-brand-900/50 font-medium">{{ checkoutForm.get('notes')?.value?.length || 0 }}/500</span>
                    </div>
                    <textarea formControlName="notes" rows="4" maxlength="500" placeholder="Mentorship එකෙන් ඔයා බලාපොරොත්තු වෙන දේ, ඔයාට තියෙන questions, guidance එකක් ඕන තැනක්, නැත්නම් Swarna ට personally කියන්න කැමති ඕනෑම දෙයක් මෙතන type කරන්න." class="w-full appearance-none shadow-sm border border-brand-200 rounded-xl py-3 px-4 outline-none focus:border-brand-900 transition-colors text-[14px] min-h-[120px] sm:min-h-[140px] resize-y" style="background-color: white !important;" [class.border-rose-400]="checkoutForm.get('notes')?.invalid"></textarea>
                    @if (checkoutForm.get('notes')?.errors?.['maxlength']) {
                      <p class="text-rose-500 text-[11px] mt-1">Notes cannot exceed 500 characters</p>
                    }
                  </div>
                </div>
              </section>



              <!-- Submit Button & Error display -->
              @if (errorMessage()) {
                <div class="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-[13px] flex items-center gap-2">
                  <mat-icon class="text-[18px]">error</mat-icon>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <button 
                type="submit" 
                [disabled]="isProcessing()" 
                class="btn-primary !bg-emerald-700 hover:!bg-emerald-800 py-4 w-full flex items-center justify-center gap-2 text-[15px] shadow-md hover:shadow-lg transition-all">
                @if (isProcessing()) {
                  <mat-icon class="animate-spin text-[20px]">refresh</mat-icon>
                  <span>Saving Order...</span>
                } @else {
                  <mat-icon class="text-[20px]">arrow_forward</mat-icon>
                  <span>Place Order & Get Payment Details</span>
                }
              </button>

              @if (checkoutForm.invalid && checkoutForm.touched) {
                <p class="text-rose-600 text-[13px] text-center font-medium">
                  කරුණාකර ඉහත තරුව (*) ලකුණින් දක්වා ඇති අනිවාර්යයෙන්ම පිරවිය යුතු සියලුම තොරතුරු සම්පූර්ණ කරන්න.
                </p>
              }
            </form>
          </div>

          <!-- Order Summary Side -->
          <div class="lg:col-span-5">
            <div class="bg-white p-6 sm:p-8 rounded-[32px] border border-brand-100 shadow-sm sticky top-[120px]">
              <h2 class="font-serif text-[24px] mb-5 text-brand-900 pb-3 border-b border-brand-100">ඔයාගේ Order එකේ සාරාංශය</h2>
              
              <div class="flex flex-col gap-3.5 mb-6 max-h-[360px] overflow-y-auto pr-1">
                @for (item of cartService.items(); track item.id) {
                  <div class="flex items-center gap-3.5 py-2 border-b border-brand-50 last:border-0">
                    <div class="relative shrink-0">
                      <img [src]="item.image" [alt]="item.name" class="w-14 h-14 object-cover rounded-2xl border border-brand-100" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                      <span class="absolute -top-1.5 -right-1.5 bg-brand-900 text-white text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{{ item.quantity }}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-[14px] text-brand-900 leading-snug">{{ item.name }}</h4>
                      <span class="text-[12px] text-brand-900/60">LKR {{ item.price.toLocaleString() }} × {{ item.quantity }}</span>
                    </div>
                    <div class="font-medium text-[14px] text-brand-900 shrink-0">
                      LKR {{ (item.price * item.quantity).toLocaleString() }}
                    </div>
                  </div>
                }
              </div>

              <div class="flex flex-col gap-2.5 py-4 border-t border-brand-200 text-[14px]">
                <div class="flex justify-between text-brand-900/70">
                  <span>Subtotal ({{ cartService.totalItems() }} items)</span>
                  <span>LKR {{ cartService.totalPrice().toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-brand-900/70">
                  <span>Delivery / PDF Delivery</span>
                  <span class="text-emerald-700 font-medium">Free (WhatsApp & Email)</span>
                </div>
              </div>
              
              <div class="border-t border-brand-200 pt-4 mt-2">
                <div class="flex justify-between items-center">
                  <span class="font-serif text-[18px] text-brand-900">ගෙවිය යුතු මුළු මුදල</span>
                  <span class="font-serif text-[26px] font-bold text-emerald-900">LKR {{ totalPayable().toLocaleString() }}</span>
                </div>
                <p class="text-[12px] text-brand-900/60 mt-1">Bank Transfer එකෙන් payment එක කරලා, Deposit Slip එක WhatsApp හරහා එවූ පසු ඔයාගේ Order එක confirm කරනවා.</p>
              </div>
            </div>
          </div>

        </div>
      }
    </main>
  `
})
export class Checkout implements OnInit {
  cartService = inject(CartService);
  contentService = inject(ContentService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private location = inject(Location);

  isProcessing = signal(false);
  copied = signal(false);
  errorMessage = signal('');
  existingOrderId: string | null = null;

  constructor() {
    // Reactively redirect away if cart becomes empty (e.g. user cleared cart then hit Back)
    effect(() => {
      if (this.cartService.items().length === 0) {
        this.router.navigate(['/learn'], { replaceUrl: true });
      }
    });
  }

  bankName = () => this.contentService.content().app.bankName || 'Commercial Bank of Ceylon';
  accountName = () => this.contentService.content().app.accountName || 'Su Collection (Swarna Herath)';
  accountNumber = () => this.contentService.content().app.accountNumber || '1000 2489 5821';
  branch = () => this.contentService.content().app.branch || 'Kandy City Branch';
  whatsappNumber = () => this.contentService.content().app.whatsappNumber || '94771234567';

  totalPayable = () => this.cartService.totalPrice();

  countries = COUNTRIES;

  checkoutForm = this.fb.group({
    email: ['', [Validators.email]],
    countryCode: ['+94', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9\s-]{7,15}$/), phoneValidator]],
    firstName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\u0D80-\u0DFF\s\-']+$/)]],
    lastName: ['', [Validators.required, Validators.pattern(/^[A-Za-z\u0D80-\u0DFF\s\-']+$/)]],
    notes: ['', Validators.maxLength(500)]
  });

  getPhonePlaceholder(): string {
    const code = this.checkoutForm.get('countryCode')?.value;
    const country = this.countries.find(c => c.code === code);
    return country?.placeholder || '1234567890';
  }

  ngOnInit() {
    // Re-validate phone when country changes
    this.checkoutForm.get('countryCode')?.valueChanges.subscribe(() => {
      if (this.checkoutForm.get('phone')?.value) {
        this.checkoutForm.get('phone')?.updateValueAndValidity();
      }
    });

    const draft = this.cartService.checkoutDraft();
    let parsedCustomer = null;

    if (draft) {
      parsedCustomer = draft;
    } else if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('sc_current_order');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.orderId) {
            this.existingOrderId = parsed.orderId;
          }
          if (parsed.customer) {
            let phoneVal = parsed.customer.phone || '';
            let codeVal = '+94';
            
            if (phoneVal.startsWith('+')) {
              const spaceIdx = phoneVal.indexOf(' ');
              if (spaceIdx > -1) {
                const possibleCode = phoneVal.substring(0, spaceIdx);
                if (this.countries.some(c => c.code === possibleCode)) {
                  codeVal = possibleCode;
                  phoneVal = phoneVal.substring(spaceIdx + 1);
                }
              }
            }
            parsedCustomer = {
              firstName: parsed.customer.firstName,
              lastName: parsed.customer.lastName,
              email: parsed.customer.email,
              countryCode: codeVal,
              phone: phoneVal,
              notes: parsed.customer.notes
            };
          }
        } catch (e) {}
      }
    }

    if (parsedCustomer) {
      this.checkoutForm.patchValue(parsedCustomer);
    }

    // Save draft on every change
    this.checkoutForm.valueChanges.subscribe(val => {
      this.cartService.checkoutDraft.set(val);
    });
  }

  copyAccountNumber() {
    navigator.clipboard.writeText(this.accountNumber()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    });
  }

  goBack() {
    this.location.back();
  }

  async processOrder() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (this.cartService.items().length === 0) {
      this.errorMessage.set('Your cart is empty. Please add items before checking out.');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set('');

    try {
      const orderId = this.existingOrderId || 'SC-' + Math.floor(100000 + Math.random() * 900000);
      const f = this.checkoutForm.value;
      const englishTitles: Record<string, string> = {
        'course-couture-and-tailoring-business-mentorship': 'Mentorship',
        'course-sri-lankan-saree-jacket-master-blueprint': 'E-Book',
        'main-foundation-course': 'Course',
        'dg-1': 'Mentorship',
        'dg-2': 'E-Book'
      };
      const items = this.cartService.items().map(item => ({
        ...item,
        name: englishTitles[item.id] || item.name
      }));
      const total = this.totalPayable();

      let cleanPhone = f.phone?.replace(/[^0-9]/g, '') || '';
      if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
      }

      const orderData = {
        orderId,
        customer: {
          firstName: f.firstName || '',
          lastName: f.lastName || '',
          email: f.email || '',
          phone: `${f.countryCode} ${cleanPhone}`.trim(),
          notes: f.notes || ''
        },
        items,
        subtotal: total,
        shipping: 0,
        total,
        status: 'lead',
        createdAt: serverTimestamp()
      };

      // Save to Firestore with document ID equal to human orderId
      await setDoc(doc(db, 'orders', orderId), orderData);

      // Save to localStorage for instant local retrieval
      localStorage.setItem('sc_current_order', JSON.stringify({
        ...orderData,
        createdAt: new Date().toISOString()
      }));



      // Navigate to order confirmation success screen
      this.router.navigate(['/success'], { queryParams: { id: orderId }, replaceUrl: true });

    } catch (e: any) {
      console.error('Checkout error:', e);
      this.errorMessage.set('We encountered an error saving your order. Please check your connection and try again or contact us directly on WhatsApp.');
      this.isProcessing.set(false);
    }
  }
}
