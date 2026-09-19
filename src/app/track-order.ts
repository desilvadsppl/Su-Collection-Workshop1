import {ChangeDetectionStrategy, Component, inject, signal, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {db} from '../lib/firebase';
import {doc, onSnapshot, updateDoc} from 'firebase/firestore';
import {ContentService} from './services/content.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-track-order',
  imports: [RouterLink, MatIconModule, FormsModule],
  template: `
    <main class="min-h-screen pt-[120px] pb-[80px] px-6 max-w-[900px] mx-auto">
      <!-- Breadcrumb -->
      <div class="mb-8">
        <a routerLink="/" class="text-brand-900/60 hover:text-brand-900 transition-colors label-md flex items-center">
          <mat-icon class="mr-2 text-[18px]">arrow_back</mat-icon> Return to Home
        </a>
      </div>

      <div class="text-center max-w-xl mx-auto mb-10">
        <div class="w-14 h-14 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center mx-auto mb-4">
          <mat-icon class="text-[28px]">search</mat-icon>
        </div>
        <h1 class="font-serif text-[36px] sm:text-[44px] text-brand-900 mb-3 leading-tight">Track Your Order</h1>
        <p class="body-md text-brand-900/70">
          Enter your Order ID (e.g. SC-123456) to check payment verification, guide delivery status, and order updates in real time.
        </p>
      </div>

      <!-- Search Box -->
      <div class="bg-white p-4 sm:p-6 rounded-[28px] border border-brand-100 shadow-sm mb-10 max-w-xl mx-auto">
        <form (ngSubmit)="searchOrder()" class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400 text-[20px]">tag</mat-icon>
            <input 
              type="text" 
              [(ngModel)]="searchId" 
              name="searchId" 
              placeholder="e.g. SC-489210" 
              class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-brand-200 rounded-xl outline-none focus:border-brand-900 font-mono text-[15px] uppercase transition-colors">
          </div>
          <button type="submit" [disabled]="!searchId().trim() || isLoading()" class="btn-primary !py-3.5 !px-6 flex items-center justify-center gap-2 whitespace-nowrap">
            @if (isLoading()) {
              <mat-icon class="animate-spin text-[18px]">refresh</mat-icon>
              <span>Searching...</span>
            } @else {
              <mat-icon class="text-[18px]">search</mat-icon>
              <span>Track Order</span>
            }
          </button>
        </form>

        @if (errorMessage()) {
          <p class="text-red-500 text-[13px] text-center mt-3">{{ errorMessage() }}</p>
        }
      </div>

      <!-- Order Result Card -->
      @if (order()) {
        <div class="printable-receipt bg-white rounded-[32px] border border-brand-100 shadow-sm overflow-hidden animate-fade-in">
          <!-- Header Banner -->
          <div class="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[12px] uppercase tracking-wider text-slate-400">Order Reference</span>
                <button (click)="copyOrderId()" class="no-print text-slate-300 hover:text-white transition-colors" title="Copy Order ID">
                  <mat-icon class="text-[16px]">content_copy</mat-icon>
                </button>
              </div>
              <h2 class="font-mono text-[24px] sm:text-[28px] font-bold tracking-wider text-white">#{{ order().orderId || order().id }}</h2>
            </div>

            <div class="flex items-center gap-3">
              <!-- Status Pill -->
              <span class="px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 shadow-sm"
                    [class.bg-amber-100]="order().status === 'pending_receipt' || order().status === 'pending_whatsapp'"
                    [class.text-amber-900]="order().status === 'pending_receipt' || order().status === 'pending_whatsapp'"
                    [class.bg-sky-100]="order().status === 'slip_uploaded'"
                    [class.text-sky-900]="order().status === 'slip_uploaded'"
                    [class.bg-emerald-100]="order().status === 'paid' || order().status === 'sent' || order().status === 'completed'"
                    [class.text-emerald-900]="order().status === 'paid' || order().status === 'sent' || order().status === 'completed'"
                    [class.bg-rose-100]="order().status === 'cancelled'"
                    [class.text-rose-900]="order().status === 'cancelled'">
                <mat-icon class="text-[16px]">{{ getStatusIcon(order().status) }}</mat-icon>
                {{ getStatusLabel(order().status) }}
              </span>
            </div>
          </div>

          <div class="p-6 sm:p-8 flex flex-col gap-8">
            <!-- 4-Stage Progress Timeline -->
            <div class="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <h3 class="font-serif text-[18px] text-brand-900 mb-6">Fulfillment Progress</h3>
              
              <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                <!-- Step 1: Placed -->
                <div class="flex sm:flex-col items-center sm:text-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-600 text-white font-bold text-[14px]">
                    <mat-icon class="text-[18px]">check</mat-icon>
                  </div>
                  <div>
                    <h4 class="font-medium text-[14px] text-brand-900">Order Placed</h4>
                    <p class="text-[12px] text-brand-900/60">Saved in system</p>
                  </div>
                </div>

                <!-- Step 2: Slip Review -->
                <div class="flex sm:flex-col items-center sm:text-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                       [class.bg-emerald-600]="isStepReached(2)"
                       [class.text-white]="isStepReached(2)"
                       [class.bg-amber-500]="order().status === 'pending_receipt'"
                       [class.text-amber-950]="order().status === 'pending_receipt'"
                       [class.bg-slate-200]="!isStepReached(2) && order().status !== 'pending_receipt'"
                       [class.text-slate-500]="!isStepReached(2) && order().status !== 'pending_receipt'">
                    <mat-icon class="text-[18px]">{{ isStepReached(2) ? 'check' : 'receipt_long' }}</mat-icon>
                  </div>
                  <div>
                    <h4 class="font-medium text-[14px] text-brand-900">Slip Verification</h4>
                    <p class="text-[12px] text-brand-900/60">Bank transfer check</p>
                  </div>
                </div>

                <!-- Step 3: Verified -->
                <div class="flex sm:flex-col items-center sm:text-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                       [class.bg-emerald-600]="isStepReached(3)"
                       [class.text-white]="isStepReached(3)"
                       [class.bg-slate-200]="!isStepReached(3)"
                       [class.text-slate-500]="!isStepReached(3)">
                    <mat-icon class="text-[18px]">{{ isStepReached(3) ? 'check' : 'verified' }}</mat-icon>
                  </div>
                  <div>
                    <h4 class="font-medium text-[14px] text-brand-900">Payment Verified</h4>
                    <p class="text-[12px] text-brand-900/60">Confirmed by Swarna</p>
                  </div>
                </div>

                <!-- Step 4: Dispatched/Completed -->
                <div class="flex sm:flex-col items-center sm:text-center gap-3">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                       [class.bg-emerald-600]="isStepReached(4)"
                       [class.text-white]="isStepReached(4)"
                       [class.bg-slate-200]="!isStepReached(4)"
                       [class.text-slate-500]="!isStepReached(4)">
                    <mat-icon class="text-[18px]">{{ isStepReached(4) ? 'task_alt' : 'send' }}</mat-icon>
                  </div>
                  <div>
                    <h4 class="font-medium text-[14px] text-brand-900">Guides Dispatched</h4>
                    <p class="text-[12px] text-brand-900/60">Delivered via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notice / Status Details -->
            @if (order().status === 'pending_receipt') {
              <div class="bg-amber-50/80 border border-amber-200 rounded-2xl p-5">
                <div class="flex items-start gap-3">
                  <mat-icon class="text-amber-700 mt-0.5">info</mat-icon>
                  <div>
                    <h4 class="font-medium text-amber-950 mb-1">Awaiting Bank Transfer Slip</h4>
                    <p class="text-[13px] text-amber-900/80 mb-3">
                      Please transfer <strong>LKR {{ order().total?.toLocaleString() }}</strong> to our Commercial Bank account and send your screenshot on WhatsApp. Once received, our team verifies and sends your guides within minutes!
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <a [href]="getWhatsAppUrl()" target="_blank" rel="noopener noreferrer" class="btn-primary !bg-emerald-700 hover:!bg-emerald-800 !py-2 !px-4 text-[13px] inline-flex items-center gap-1.5">
                        <mat-icon class="text-[16px]">chat</mat-icon> Send Slip on WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            }

            @if (order().adminNotes) {
              <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
                <div class="flex items-start gap-2.5">
                  <mat-icon class="text-emerald-700 text-[20px] mt-0.5">campaign</mat-icon>
                  <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">Message from Swarna / Admin:</span>
                    <p class="text-[13px] text-emerald-950 mt-0.5">{{ order().adminNotes }}</p>
                  </div>
                </div>
              </div>
            }

            <!-- Bank Reference Update -->
            @if (order().status === 'pending_receipt' || order().status === 'slip_uploaded') {
              <div class="no-print border border-brand-100 rounded-2xl p-5 bg-white">
                <h4 class="font-medium text-brand-900 text-[15px] mb-2">Have you already made the transfer?</h4>
                <p class="text-[13px] text-brand-900/70 mb-4">
                  Add your transaction reference number (e.g. FriMi Ref, Bank App Slip ID, or ATM machine ref) to speed up verification.
                </p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    [(ngModel)]="bankRefInput" 
                    placeholder="e.g. FriMi #849204 or BOC 91283" 
                    class="flex-1 border border-brand-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-brand-900 bg-slate-50">
                  <button (click)="submitBankReference()" [disabled]="!bankRefInput().trim() || isUpdatingRef()" class="btn-secondary !py-2.5 !px-5 text-[13px] flex items-center justify-center gap-1.5">
                    <mat-icon class="text-[16px]">check</mat-icon>
                    {{ isUpdatingRef() ? 'Saving...' : 'Save Reference' }}
                  </button>
                </div>
                @if (order().bankReference) {
                  <p class="text-[12px] text-emerald-700 mt-2 font-medium">Current recorded reference: {{ order().bankReference }}</p>
                }
              </div>
            }

            <!-- Ordered Items Breakdown -->
            <div>
              <h3 class="font-serif text-[20px] text-brand-900 mb-4 pb-2 border-b border-brand-100">Ordered Items</h3>
              <div class="flex flex-col gap-3">
                @for (item of order().items; track item.id) {
                  <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
                    <div class="flex items-center gap-3 min-w-0">
                      @if (item.image) {
                        <img [src]="item.image" [alt]="item.name" class="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" referrerpolicy="no-referrer">
                      }
                      <div class="min-w-0">
                        <h4 class="font-medium text-[14px] text-brand-900 truncate">{{ item.name }}</h4>
                        <span class="text-[12px] text-brand-900/60">Qty: {{ item.quantity }} × LKR {{ item.price?.toLocaleString() }}</span>
                      </div>
                    </div>
                    <span class="font-semibold text-[14px] text-brand-900 shrink-0">
                      LKR {{ ((item.price || 0) * (item.quantity || 1)).toLocaleString() }}
                    </span>
                  </div>
                }
              </div>

              <div class="flex justify-between items-center pt-4 border-t border-brand-100 mt-4 text-[16px] font-semibold text-brand-900">
                <span>Total Amount:</span>
                <span class="font-serif text-[22px] text-emerald-800">LKR {{ order().total?.toLocaleString() }}</span>
              </div>
            </div>

            <!-- Customer & Delivery Information -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-[13px]">
              <div>
                <span class="text-[11px] uppercase tracking-wider text-brand-900/50 block font-semibold mb-1">Customer Details</span>
                <p class="font-medium text-brand-900">{{ order().customer?.firstName }} {{ order().customer?.lastName }}</p>
                <p class="text-brand-900/70">{{ order().customer?.phone }}</p>
                <p class="text-brand-900/70">{{ order().customer?.email }}</p>
              </div>
              <div>
                <span class="text-[11px] uppercase tracking-wider text-brand-900/50 block font-semibold mb-1">Delivery Address</span>
                <p class="text-brand-900/80">{{ order().customer?.address }}</p>
                <p class="text-brand-900/80">{{ order().customer?.city }} {{ order().customer?.postalCode }}</p>
                <p class="text-emerald-800 font-medium mt-1">Digital Delivery: Direct to WhatsApp & Email</p>
              </div>
            </div>

            <!-- Actions Footer -->
            <div class="no-print flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brand-100">
              <a [href]="getWhatsAppUrl()" target="_blank" rel="noopener noreferrer" class="btn-primary !bg-emerald-700 hover:!bg-emerald-800 w-full flex items-center justify-center gap-2">
                <mat-icon class="text-[18px]">chat</mat-icon> Chat with Swarna on WhatsApp
              </a>
            </div>

          </div>
        </div>
      }
    </main>
  `
})
export class TrackOrder implements OnInit {
  private route = inject(ActivatedRoute);
  contentService = inject(ContentService);

  searchId = signal('');
  order = signal<any>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  bankRefInput = signal('');
  isUpdatingRef = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.searchId.set(params['id']);
        this.searchOrder();
      }
    });
  }

  searchOrder() {
    const rawId = this.searchId().trim();
    if (!rawId) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const formattedId = rawId.startsWith('SC-') ? rawId : `SC-${rawId}`;

    const docRef = doc(db, 'orders', formattedId);
    onSnapshot(docRef, (docSnap) => {
      this.isLoading.set(false);
      if (docSnap.exists()) {
        const data: any = { id: docSnap.id, ...docSnap.data() };
        this.order.set(data);
        if (data.bankReference) {
          this.bankRefInput.set(data.bankReference);
        }
      } else {
        this.errorMessage.set(`No order found matching "${formattedId}". Please check your order reference and try again.`);
        this.order.set(null);
      }
    }, (err) => {
      console.error('Error fetching order:', err);
      this.isLoading.set(false);
      this.errorMessage.set('Could not fetch order details. Please check your internet connection or message us on WhatsApp.');
    });
  }

  isStepReached(stepNumber: number): boolean {
    const s = this.order()?.status;
    if (!s) return false;
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return s === 'slip_uploaded' || s === 'paid' || s === 'sent' || s === 'completed';
    if (stepNumber === 3) return s === 'paid' || s === 'sent' || s === 'completed';
    if (stepNumber === 4) return s === 'sent' || s === 'completed';
    return false;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending_receipt': return 'Pending Bank Slip';
      case 'pending_whatsapp': return 'Pending WhatsApp Verification';
      case 'slip_uploaded': return 'Slip Received - Reviewing';
      case 'paid': return 'Payment Verified';
      case 'sent': return 'Guides Sent / Dispatched';
      case 'completed': return 'Order Completed';
      case 'cancelled': return 'Order Cancelled';
      default: return 'Order Placed';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending_receipt': return 'schedule';
      case 'slip_uploaded': return 'receipt_long';
      case 'paid': return 'check_circle';
      case 'sent': return 'send';
      case 'completed': return 'task_alt';
      case 'cancelled': return 'cancel';
      default: return 'info';
    }
  }

  copyOrderId() {
    const id = this.order()?.orderId || this.order()?.id;
    if (id) {
      navigator.clipboard.writeText(id);
    }
  }

  async submitBankReference() {
    const id = this.order()?.orderId || this.order()?.id;
    const ref = this.bankRefInput().trim();
    if (!id || !ref) return;

    this.isUpdatingRef.set(true);
    try {
      await updateDoc(doc(db, 'orders', id), {
        bankReference: ref,
        status: 'slip_uploaded'
      });
    } catch (e) {
      console.error('Error updating bank reference:', e);
    } finally {
      this.isUpdatingRef.set(false);
    }
  }

  getWhatsAppUrl(): string {
    const phone = this.contentService.content().app.whatsappNumber || '94771234567';
    const id = this.order()?.orderId || this.order()?.id || '';
    const name = this.order()?.customer?.firstName || 'Customer';
    const total = this.order()?.total?.toLocaleString() || '0';
    const msg = encodeURIComponent(
      `Hello Swarna, I am checking the status of my Su Collection Order #${id} (LKR ${total}). My name is ${name}.`
    );
    return `https://wa.me/${phone}?text=${msg}`;
  }
}
