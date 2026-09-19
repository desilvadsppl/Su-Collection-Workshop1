import {ChangeDetectionStrategy, Component, inject, signal, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {db} from '../lib/firebase';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import {ContentService} from './services/content.service';
import {CartService} from './services/cart.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-success',
  imports: [RouterLink, MatIconModule, FormsModule],
  template: `
    <main class="min-h-screen pt-[100px] sm:pt-[120px] pb-[60px] sm:pb-[80px] px-4 sm:px-6 max-w-[960px] mx-auto">
      <div class="mb-[32px]">
        <a routerLink="/" [replaceUrl]="true" class="text-brand-900/60 hover:text-brand-900 transition-colors label-md flex items-center w-fit">
          <mat-icon class="mr-2 text-[18px]">home</mat-icon> Return to Home
        </a>
      </div>
      
      <!-- Top Success Alert -->
      <div class="text-center max-w-2xl mx-auto mb-10">
        <div class="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
          <mat-icon class="text-[44px] w-[44px] h-[44px]">check_circle</mat-icon>
        </div>
        <h1 class="font-serif text-[36px] sm:text-[48px] text-brand-900 mb-3 leading-tight">Order Placed Successfully!</h1>
        <p class="body-md text-brand-900/80 text-[15px] sm:text-[16px] mb-2 leading-relaxed font-['Noto_Sans_Sinhala']">
          කරුණාකර <strong>Bank Transfer</strong> එක සම්පූර්ණ කරලා, Payment එකට අදාල <strong>Receipt</strong> එකේ
          <strong>PDF/Screenshot</strong> එක අපේ <strong>Official WhatsApp Number</strong> එකට <strong>Send</strong> කරන්න.
        </p>
        <p class="body-md text-brand-900/80 text-[15px] sm:text-[16px] leading-relaxed font-['Noto_Sans_Sinhala']">
          Payment එක තහවුරු කළ පසු, ඔයාට අදාල <strong>Product/Service</strong> ලබාගන්න පුළුවන්.
        </p>
      </div>

      <!-- Main Order Receipt & Instructions Card -->
      <div class="printable-receipt bg-white rounded-[32px] border border-brand-100 shadow-sm overflow-hidden mb-8">
        
        <!-- Header Banner -->
        <div class="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span class="text-[12px] uppercase tracking-wider text-slate-400 block mb-1">Official Order Reference</span>
            <div class="flex items-center gap-3">
              <span class="font-mono text-[26px] sm:text-[32px] font-bold text-white tracking-wider">#{{ orderId() }}</span>
              <button (click)="copyOrderId()" class="no-print bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg text-[12px] flex items-center gap-1 transition-colors">
                <mat-icon class="text-[14px]">content_copy</mat-icon>
                {{ copiedId() ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

          <div class="flex flex-col sm:items-end">
            <span class="text-[12px] uppercase tracking-wider text-slate-400 block mb-1">Status</span>
            <span class="px-3.5 py-1.5 rounded-full text-[13px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
              <mat-icon class="text-[16px]">schedule</mat-icon> Pending Bank Slip
            </span>
          </div>
        </div>

        <div class="p-6 sm:p-10 flex flex-col gap-8">
          
          <!-- Bank Account Details Card -->
          <div class="border border-brand-200 rounded-3xl p-6 sm:p-8 bg-slate-50/50">
            <div class="flex items-center justify-between mb-4 border-b border-brand-100 pb-3">
              <div class="flex items-center gap-2.5">
                <mat-icon class="text-brand-800">account_balance</mat-icon>
                <h3 class="font-serif text-[20px] text-brand-900">Official Bank Transfer Details</h3>
              </div>
              <span class="text-[12px] font-medium text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Verified Account
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[14px] mb-6">
              <div class="bg-white p-4 rounded-2xl border border-brand-100">
                <span class="text-[11px] uppercase tracking-wider text-brand-900/60 block font-semibold mb-1">Bank Name</span>
                <span class="font-medium text-brand-950">{{ bankName() }}</span>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-brand-100">
                <span class="text-[11px] uppercase tracking-wider text-brand-900/60 block font-semibold mb-1">Account Name</span>
                <span class="font-medium text-brand-950">{{ accountName() }}</span>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-brand-100">
                <span class="text-[11px] uppercase tracking-wider text-brand-900/60 block font-semibold mb-1">Branch</span>
                <span class="font-medium text-brand-950">{{ branch() }}</span>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-brand-100 relative">
                <span class="text-[11px] uppercase tracking-wider text-brand-900/60 block font-semibold mb-1">Account Number</span>
                <div class="flex items-center justify-between">
                  <span class="font-mono font-bold text-[15px] text-brand-950">{{ accountNumber() }}</span>
                  <button (click)="copyAccountNumber()" class="text-[11px] bg-brand-100 hover:bg-brand-200 text-brand-900 px-2 py-0.5 rounded transition-colors font-medium">
                    {{ copiedAccount() ? 'Copied' : 'Copy' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Optional: Enter Transaction Reference -->
            <div class="bg-white p-5 rounded-2xl border border-brand-100">
              <h4 class="font-medium text-brand-900 text-[14px] mb-2">Have your transfer reference number handy? <span class="text-brand-900/60 font-normal">(Optional)</span></h4>
              <p class="text-[13px] sm:text-[14px] text-brand-900/80 mb-4 leading-relaxed font-['Noto_Sans_Sinhala']">
                ඔයාගේ <strong>Bank App</strong> එකේ <strong>Reference</strong> එක (FriMi, Flash, Online Banking Transaction ID හෝ Slip Number) මෙතන ඇතුළත් කරන්න. (අනිවාර්ය නොවේ)
              </p>
              <div class="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  [(ngModel)]="bankReferenceInput" 
                  placeholder="e.g. FriMi Ref 948210 or Commercial Bank Ref" 
                  class="flex-1 bg-slate-50 border border-brand-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-brand-900">
                <button (click)="saveBankReference()" [disabled]="!bankReferenceInput().trim() || isSavingRef()" class="btn-secondary !py-2.5 !px-5 text-[13px] flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <mat-icon class="text-[16px]">check</mat-icon>
                  <span>{{ isSavingRef() ? 'Saving...' : 'Attach Reference' }}</span>
                </button>
              </div>
              @if (refSavedMessage()) {
                <p class="text-emerald-700 text-[12px] mt-2 font-medium flex items-center gap-1">
                  <mat-icon class="text-[16px]">check_circle</mat-icon> {{ refSavedMessage() }}
                </p>
              }
            </div>
          </div>

          <!-- Primary WhatsApp Action Box or Next Steps -->
          @if (!whatsAppOpened()) {
            <div class="bg-brand-50/40 border-2 border-brand-100 rounded-3xl p-6 sm:p-8 animate-fade-in">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div class="max-w-2xl">
                  <div class="text-brand-900/80 text-[14px] mb-2 font-medium">
                    Step 1: Open WhatsApp
                  </div>
                  <h3 class="font-serif font-bold text-[24px] sm:text-[28px] text-brand-900 mb-4">
                    Send Your Order Slip to Swarna
                  </h3>
                  <p class="text-[14px] sm:text-[15px] text-brand-900/80 leading-relaxed mb-4 font-['Noto_Sans_Sinhala']">
                    "<strong>OPEN WHATSAPP</strong>" button එක Click කරන්න, ඔයා කලින් Fill කරපු ඔයාගේ Details සහ ඔයාගේ Order එකේ Details ස්වර්ණා මහත්මියගේ WhatsApp Chat එකේ Type වෙලා ඔයාට Open වෙයි, ඊට පස්සේ App එකේ <strong>Send Button එක Click</strong> කරල ඒ Message එක Send කරන්න.
                  </p>
                  <p class="text-[14px] sm:text-[15px] text-brand-900/80 leading-relaxed font-['Noto_Sans_Sinhala']">
                    Payment එක Complete කළාට පස්සේ, <strong>Bank Deposit Slip එකේ Photo එකක් හෝ Mobile Transfer එකේ Screenshot/PDF එකක්</strong> මේ Chat එකටම Attach කරලා Send කරන්න.
                  </p>
                </div>

                <div class="flex flex-col gap-3 shrink-0 sm:w-[260px]">
                  <a [href]="whatsAppUrl()" target="_blank" rel="noopener noreferrer"
                     (click)="onWhatsAppClick()"
                     class="btn-primary !bg-emerald-700 hover:!bg-emerald-800 !py-4 !px-6 w-full flex items-center justify-center gap-2 text-[15px] shadow-md hover:shadow-lg transition-all">
                    <mat-icon class="text-[22px]">chat</mat-icon>
                    <span>Open WhatsApp</span>
                  </a>
                  <button (click)="copyWhatsAppMessage()" class="text-[13px] text-emerald-900/80 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-200/70 py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors font-medium">
                    <mat-icon class="text-[16px]">content_copy</mat-icon>
                    <span>{{ copiedMessage() ? 'Message Copied!' : 'Copy Order Text' }}</span>
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <div class="bg-brand-50/80 border-2 border-brand-500/20 rounded-3xl p-6 sm:p-8 animate-fade-in">
              <div class="text-center max-w-xl mx-auto">
                <div class="w-16 h-16 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center mx-auto mb-4">
                  <mat-icon class="text-[32px]">mark_email_read</mat-icon>
                </div>
                <h3 class="font-serif text-[24px] sm:text-[28px] text-brand-950 mb-3">
                  Awesome! We're checking your slip.
                </h3>
                <div class="text-[15px] text-brand-900/80 leading-relaxed mb-6 flex flex-col gap-3 font-['Noto_Sans_Sinhala']">
                  <p>ඔයා Bank Slip එක <strong>Swarna මහත්මියට WhatsApp හරහා</strong> එවලා තියෙනවා නම්, ඒක අපි ඉක්මනින් Check කරලා Payment එක Confirm කරන්නම්.</p>
                  <p>Payment එක Verify වුණාම, ඔයාගේ <strong>Order Status එක Automatically Update වෙයි.</strong></p>
                </div>
                
                <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a routerLink="/learn" class="no-print btn-primary !py-3.5 flex items-center gap-2 w-full sm:w-auto justify-center uppercase tracking-widest text-[13px]">
                    CONTINUE SHOPPING
                  </a>
                </div>
              </div>
            </div>
          }

          <!-- Itemized Order Summary -->
          @if (orderData()) {
            <div>
              <h3 class="font-serif text-[22px] text-brand-900 mb-4 pb-2 border-b border-brand-100">Order Items</h3>
              
              <div class="flex flex-col gap-3">
                @for (item of orderData()?.items; track item.id) {
                  <div class="flex items-center justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
                    <div class="flex items-center gap-4 min-w-0">
                      @if (item.image) {
                        <img [src]="item.image" [alt]="item.name" class="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0" referrerpolicy="no-referrer">
                      }
                      <div class="min-w-0">
                        <h4 class="font-medium text-[15px] text-brand-900">{{ item.name }}</h4>
                        <span class="text-[12px] text-brand-900/60">Quantity: {{ item.quantity }} × LKR {{ item.price?.toLocaleString() }}</span>
                      </div>
                    </div>
                    <span class="font-medium text-[15px] text-brand-900 shrink-0">
                      LKR {{ ((item.price || 0) * (item.quantity || 1)).toLocaleString() }}
                    </span>
                  </div>
                }
              </div>

              <!-- Total Row -->
              <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-4 flex justify-between items-center">
                <span class="font-medium text-brand-900 text-[16px]">Total Payable:</span>
                <span class="font-serif text-[26px] font-bold text-emerald-900">LKR {{ orderData()?.total?.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Customer Details Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-[13px]">
              <div>
                <span class="text-[11px] uppercase tracking-wider text-brand-900/50 block font-semibold mb-1">Customer Name & Contact</span>
                <p class="font-medium text-brand-900 text-[14px]">{{ orderData()?.customer?.firstName }} {{ orderData()?.customer?.lastName }}</p>
                <p class="text-brand-900/70">{{ orderData()?.customer?.phone }}</p>
                <p class="text-brand-900/70">{{ orderData()?.customer?.email }}</p>
              </div>
              <div>
                <span class="text-[11px] uppercase tracking-wider text-brand-900/50 block font-semibold mb-1">Delivery / Fulfillment</span>
                <p class="text-brand-900/80">{{ orderData()?.customer?.address }}</p>
                <p class="text-brand-900/80">{{ orderData()?.customer?.city }} {{ orderData()?.customer?.postalCode }}</p>
                <p class="text-emerald-800 font-medium mt-1">Ebooks & Guides sent to your WhatsApp number directly</p>
              </div>
            </div>
          }

          <!-- Footer Actions -->
          <div class="no-print flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-brand-100">
            <div class="flex flex-wrap items-center gap-3">
              <!-- Print Receipt Button Removed -->
            </div>

            <a routerLink="/learn" [replaceUrl]="true" class="text-brand-900/80 hover:text-brand-900 label-md text-[13px] flex items-center">
              Continue Shopping <mat-icon class="ml-1 text-[16px]">arrow_forward</mat-icon>
            </a>
          </div>

        </div>
      </div>
    </main>
  `
})
export class Success implements OnInit {
  private route = inject(ActivatedRoute);
  contentService = inject(ContentService);
  cartService = inject(CartService);

  orderId = signal('SC-100000');
  orderData = signal<any>(null);

  copiedId = signal(false);
  copiedAccount = signal(false);
  copiedMessage = signal(false);
  whatsAppOpened = signal(false);

  bankReferenceInput = signal('');
  isSavingRef = signal(false);
  refSavedMessage = signal('');

  bankName = () => this.contentService.content().app.bankName || 'Seylan Bank PLC';
  accountName = () => this.contentService.content().app.accountName || 'The UVA VEC (Private) Limited';
  accountNumber = () => this.contentService.content().app.accountNumber || '11201 39276 64001';
  branch = () => this.contentService.content().app.branch || 'Godagama';
  whatsappNumber = () => this.contentService.content().app.whatsappNumber || '94771234567';

  ngOnInit() {
    this.route.queryParams.subscribe(async (params) => {
      let id = params['id'];
      if (!id) {
        // Check local storage fallback
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          const saved = localStorage.getItem('sc_current_order');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              id = parsed.orderId || parsed.id;
              this.orderData.set(parsed);
            } catch (e) {
              console.warn(e);
            }
          }
        }
      }

      if (id) {
        this.orderId.set(id);
        try {
          const snap = await getDoc(doc(db, 'orders', id));
          if (snap.exists()) {
            this.orderData.set({ id: snap.id, ...snap.data() });
          }
        } catch (e) {
          console.warn('Could not load remote order:', e);
        }
      }
    });
  }

  copyOrderId() {
    navigator.clipboard.writeText(this.orderId()).then(() => {
      this.copiedId.set(true);
      setTimeout(() => this.copiedId.set(false), 2000);
    });
  }

  copyAccountNumber() {
    navigator.clipboard.writeText(this.accountNumber()).then(() => {
      this.copiedAccount.set(true);
      setTimeout(() => this.copiedAccount.set(false), 2000);
    });
  }

  generateOrderMessage(): string {
    const o = this.orderData();
    const id = this.orderId();
    const cust = o?.customer;
    const total = o?.total ? Number(o.total).toLocaleString() : '0';

    let msg = `🧾 *Order & Payment Slip Submission - Su Collection*\n\n`;
    msg += `*Order ID:* #${id}\n`;
    if (cust) {
      msg += `*Customer:* ${cust.firstName || ''} ${cust.lastName || ''}\n`;
      msg += `*Phone:* ${cust.phone || ''}\n`;
      msg += `*Email:* ${cust.email || ''}\n`;
      if (cust.address) msg += `*Address:* ${cust.address}, ${cust.city || ''}\n`;
    }
    msg += `\n*Ordered Items:*\n`;
    if (o?.items) {
      o.items.forEach((item: any) => {
        msg += `• ${item.quantity || 1}x ${item.name} (LKR ${(item.price || 0).toLocaleString()})\n`;
      });
    }
    msg += `\n*Total Payable:* LKR ${total}\n\n`;
    msg += `*Bank Transfer Details:*\n`;
    msg += `Transferred to: ${this.bankName()} (Acct: ${this.accountNumber()})\n`;
    if (this.bankReferenceInput().trim()) {
      msg += `*Bank Reference / FriMi:* ${this.bankReferenceInput().trim()}\n`;
    }
    msg += `I am attaching my deposit slip screenshot below. Please confirm my payment and dispatch my order / digital guides!`;
    return msg;
  }

  whatsAppUrl(): string {
    const phone = this.whatsappNumber().replace(/\D/g, '').replace(/^0/, '94');
    const msg = encodeURIComponent(this.generateOrderMessage());
    return `https://wa.me/${phone}?text=${msg}`;
  }

  onWhatsAppClick() {
    // Finalize order visually by clearing the cart since they are proceeding to pay
    this.cartService.clearCart();
    this.cartService.checkoutDraft.set(null);
    // Update local UI state to show next steps
    this.whatsAppOpened.set(true);
  }

  openWhatsApp() {
    const url = this.whatsAppUrl();
    this.cartService.clearCart();
    this.cartService.checkoutDraft.set(null);
    this.whatsAppOpened.set(true);
    window.open(url, '_blank');
  }

  copyWhatsAppMessage() {
    const msg = this.generateOrderMessage();
    navigator.clipboard.writeText(msg).then(() => {
      this.copiedMessage.set(true);
      setTimeout(() => this.copiedMessage.set(false), 2500);
    });
  }

  async saveBankReference() {
    const ref = this.bankReferenceInput().trim();
    const id = this.orderId();
    if (!ref || !id) return;

    this.isSavingRef.set(true);
    try {
      await updateDoc(doc(db, 'orders', id), {
        bankReference: ref,
        status: 'slip_uploaded'
      });
      this.refSavedMessage.set('Bank reference attached to order successfully!');
      setTimeout(() => this.refSavedMessage.set(''), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      this.isSavingRef.set(false);
    }
  }
}
