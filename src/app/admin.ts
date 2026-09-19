import { Component, inject, signal, OnInit, effect, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './services/auth.service';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { ContentService, WebsiteContent, defaultContent } from './services/content.service';
import { COUNTRIES } from './countries';

import { FormatTextPipe } from './pipes/format-text.pipe';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, FormatTextPipe],
  template: `
    <div class="min-h-screen bg-slate-50 pt-[100px] sm:pt-32 pb-16 px-4 sm:px-6 lg:px-[64px]">
      <div class="max-w-[1200px] mx-auto">
        
        @if (!auth.isInitialized()) {
          <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-900"></div>
          </div>
        } @else if (!auth.user()) {
          <div class="bg-white p-8 sm:p-12 rounded-[24px] sm:rounded-[32px] shadow-sm text-center max-w-md mx-auto border border-brand-100">
            <h1 class="font-serif text-[28px] sm:text-[32px] text-brand-900 mb-4">Admin Access</h1>
            <p class="body-md text-brand-900/70 mb-8 text-[14px] sm:text-[16px]">Please sign in to access the Su Collection admin dashboard.</p>
            <button (click)="auth.loginWithGoogle()" class="btn-primary w-full flex items-center justify-center gap-2">
              <mat-icon>login</mat-icon> Sign in with Google
            </button>
          </div>
        } @else if (!auth.isAdmin()) {
          <div class="bg-white p-8 sm:p-12 rounded-[24px] sm:rounded-[32px] shadow-sm text-center max-w-md mx-auto border border-brand-100">
            <mat-icon class="text-red-500 text-[48px] mb-4">gpp_bad</mat-icon>
            <h1 class="font-serif text-[28px] sm:text-[32px] text-brand-900 mb-4">Access Denied</h1>
            <p class="body-md text-brand-900/70 mb-8 text-[14px] sm:text-[16px]">You do not have administrative privileges.</p>
            <button (click)="auth.logout()" class="btn-secondary w-full">Sign Out</button>
          </div>
        } @else {
          <!-- Admin Dashboard -->
          <div class="flex items-center justify-between mb-6 sm:mb-8">
            <h1 class="font-serif text-[28px] sm:text-[40px] text-brand-900 leading-tight">Admin Dashboard</h1>
            <button (click)="auth.logout()" class="text-brand-900/60 hover:text-brand-900 text-[13px] sm:text-[14px] flex items-center gap-1 sm:gap-2">
              <mat-icon class="text-[16px] sm:text-[18px]">logout</mat-icon> <span class="hidden sm:inline">Sign out</span>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex overflow-x-auto whitespace-nowrap sm:flex-wrap gap-2 sm:gap-4 mb-6 sm:mb-8 border-b border-brand-200 pb-2 sm:pb-0 hide-scrollbar">
            <button (click)="activeTab.set('orders')" [class.border-brand-900]="activeTab() === 'orders'" [class.text-brand-900]="activeTab() === 'orders'" class="px-4 sm:px-6 py-2 sm:py-3 border-b-2 border-transparent text-brand-900/60 hover:text-brand-900 label-md text-[13px] sm:text-[14px] transition-colors flex items-center gap-2">
              <span>Order Management (OMS)</span>
              @if (orderMetrics().needsReviewCount > 0) {
                <span class="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {{ orderMetrics().needsReviewCount }} Action Required
                </span>
              }
            </button>
            <!-- Temporarily hidden content editor tabs
            <button (click)="activeTab.set('videos')" [class.border-brand-900]="activeTab() === 'videos'" [class.text-brand-900]="activeTab() === 'videos'" class="px-4 sm:px-6 py-2 sm:py-3 border-b-2 border-transparent text-brand-900/60 hover:text-brand-900 label-md text-[13px] sm:text-[14px] transition-colors">
              Social Reel (TikTok & FB)
            </button>
            <button (click)="activeTab.set('bookings')" [class.border-brand-900]="activeTab() === 'bookings'" [class.text-brand-900]="activeTab() === 'bookings'" class="px-4 sm:px-6 py-2 sm:py-3 border-b-2 border-transparent text-brand-900/60 hover:text-brand-900 label-md text-[13px] sm:text-[14px] transition-colors">
              Consultations
            </button>
            <button (click)="activeTab.set('courses')" [class.border-brand-900]="activeTab() === 'courses'" [class.text-brand-900]="activeTab() === 'courses'" class="px-4 sm:px-6 py-2 sm:py-3 border-b-2 border-transparent text-brand-900/60 hover:text-brand-900 label-md text-[13px] sm:text-[14px] transition-colors">
              Courses
            </button>
            <button (click)="activeTab.set('shop')" [class.border-brand-900]="activeTab() === 'shop'" [class.text-brand-900]="activeTab() === 'shop'" class="px-4 sm:px-6 py-2 sm:py-3 border-b-2 border-transparent text-brand-900/60 hover:text-brand-900 label-md text-[13px] sm:text-[14px] transition-colors">
              Shop Inventory
            </button>
            <button (click)="activeTab.set('content')" [class.border-brand-900]="activeTab() === 'content'" [class.text-brand-900]="activeTab() === 'content'" class="px-4 sm:px-6 py-2 sm:py-3 border-b-2 border-transparent text-brand-900/60 hover:text-brand-900 label-md text-[13px] sm:text-[14px] transition-colors">
              Content Editor
            </button>
            <button (click)="activeTab.set('dedicatedCourses')" [class.border-brand-900]="activeTab() === 'dedicatedCourses'" [class.text-brand-900]="activeTab() === 'dedicatedCourses'" class="px-4 sm:px-6 py-2 sm:py-3 border-b-2 border-transparent text-brand-900/60 hover:text-brand-900 label-md text-[13px] sm:text-[14px] transition-colors">
              Dedicated Courses
            </button>
            -->
          </div>

          <!-- Tab Content: Order Management System (OMS) -->
          @if (activeTab() === 'orders') {
            <div class="flex flex-col gap-6">
              
              <!-- 1. OMS Metrics Cards -->
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div class="bg-white p-4 sm:p-5 rounded-[16px] sm:rounded-2xl border border-brand-100 shadow-sm">
                  <span class="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand-900/60 font-semibold block mb-1">Total Orders</span>
                  <div class="font-serif text-[24px] sm:text-[28px] text-brand-900 font-bold leading-tight">{{ orderMetrics().totalCount }}</div>
                  <span class="text-[10px] sm:text-[11px] text-brand-900/50">All recorded orders</span>
                </div>

                <div class="bg-white p-4 sm:p-5 rounded-[16px] sm:rounded-2xl border border-amber-200 bg-amber-50/30 shadow-sm">
                  <span class="text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-900/70 font-semibold block mb-1">Awaiting Slip</span>
                  <div class="font-serif text-[24px] sm:text-[28px] text-amber-700 font-bold leading-tight">{{ orderMetrics().awaitingSlipCount }}</div>
                  <span class="text-[10px] sm:text-[11px] text-amber-800/60">Pending receipt</span>
                </div>

                <div class="bg-white p-4 sm:p-5 rounded-[16px] sm:rounded-2xl border border-sky-300 bg-sky-50/40 shadow-sm relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-1.5 sm:w-2 h-full bg-sky-500"></div>
                  <span class="text-[10px] sm:text-[11px] uppercase tracking-wider text-sky-950 font-semibold block mb-1">Slips Uploaded</span>
                  <div class="font-serif text-[24px] sm:text-[28px] text-sky-700 font-bold leading-tight">{{ orderMetrics().needsReviewCount }}</div>
                  <span class="text-[10px] sm:text-[11px] text-sky-800 font-medium">Ready for review!</span>
                </div>

                <div class="bg-white p-4 sm:p-5 rounded-[16px] sm:rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
                  <span class="text-[10px] sm:text-[11px] uppercase tracking-wider text-emerald-900/70 font-semibold block mb-1">Verified</span>
                  <div class="font-serif text-[24px] sm:text-[28px] text-emerald-700 font-bold leading-tight">{{ orderMetrics().verifiedCount }}</div>
                  <span class="text-[10px] sm:text-[11px] text-emerald-800/60">Paid & active</span>
                </div>

                <div class="bg-white p-4 sm:p-5 rounded-[16px] sm:rounded-2xl border border-brand-100 shadow-sm col-span-2 sm:col-span-1">
                  <span class="text-[10px] sm:text-[11px] uppercase tracking-wider text-brand-900/60 font-semibold block mb-1">Gross Revenue</span>
                  <div class="font-serif text-[20px] sm:text-[22px] text-brand-950 font-bold leading-tight truncate">LKR {{ orderMetrics().totalRevenue.toLocaleString() }}</div>
                  <span class="text-[10px] sm:text-[11px] text-emerald-700 font-medium">Verified payments</span>
                </div>
              </div>

              <!-- 2. Controls: Status Tabs, Search, Sort & Manual Order -->
              <div class="bg-white p-5 rounded-2xl border border-brand-100 shadow-sm flex flex-col gap-4">
                
                <!-- Status Pills -->
                <div class="flex flex-wrap items-center gap-2 pb-3 border-b border-brand-50">
                  <button (click)="orderStatusFilter.set('all')" 
                          [class.bg-brand-900]="orderStatusFilter() === 'all'"
                          [class.text-white]="orderStatusFilter() === 'all'"
                          [class.bg-slate-100]="orderStatusFilter() !== 'all'"
                          [class.text-brand-900]="orderStatusFilter() !== 'all'"
                          class="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors">
                    All ({{ orders().length }})
                  </button>
                  
                  <button (click)="orderStatusFilter.set('slip_uploaded')" 
                          [class.bg-sky-600]="orderStatusFilter() === 'slip_uploaded'"
                          [class.text-white]="orderStatusFilter() === 'slip_uploaded'"
                          [class.bg-sky-50]="orderStatusFilter() !== 'slip_uploaded'"
                          [class.text-sky-900]="orderStatusFilter() !== 'slip_uploaded'"
                          class="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5">
                    <span>Needs Review</span>
                    @if (orderMetrics().needsReviewCount > 0) {
                      <span class="bg-white text-sky-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold shadow-xs">{{ orderMetrics().needsReviewCount }}</span>
                    }
                  </button>

                  <button (click)="orderStatusFilter.set('pending_receipt')" 
                          [class.bg-amber-600]="orderStatusFilter() === 'pending_receipt'"
                          [class.text-white]="orderStatusFilter() === 'pending_receipt'"
                          [class.bg-amber-50]="orderStatusFilter() !== 'pending_receipt'"
                          [class.text-amber-900]="orderStatusFilter() !== 'pending_receipt'"
                          class="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors">
                    Pending Slip ({{ orderMetrics().awaitingSlipCount }})
                  </button>

                  <button (click)="orderStatusFilter.set('paid')" 
                          [class.bg-emerald-700]="orderStatusFilter() === 'paid'"
                          [class.text-white]="orderStatusFilter() === 'paid'"
                          [class.bg-emerald-50]="orderStatusFilter() !== 'paid'"
                          [class.text-emerald-900]="orderStatusFilter() !== 'paid'"
                          class="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors">
                    Paid & Verified
                  </button>

                  <button (click)="orderStatusFilter.set('sent')" 
                          [class.bg-indigo-700]="orderStatusFilter() === 'sent'"
                          [class.text-white]="orderStatusFilter() === 'sent'"
                          [class.bg-indigo-50]="orderStatusFilter() !== 'sent'"
                          [class.text-indigo-900]="orderStatusFilter() !== 'sent'"
                          class="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors">
                    Guides Sent
                  </button>

                  <button (click)="orderStatusFilter.set('completed')" 
                          [class.bg-slate-700]="orderStatusFilter() === 'completed'"
                          [class.text-white]="orderStatusFilter() === 'completed'"
                          [class.bg-slate-100]="orderStatusFilter() !== 'completed'"
                          [class.text-slate-800]="orderStatusFilter() !== 'completed'"
                          class="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors">
                    Completed ({{ orderMetrics().completedCount }})
                  </button>

                  <button (click)="orderStatusFilter.set('cancelled')" 
                          [class.bg-rose-700]="orderStatusFilter() === 'cancelled'"
                          [class.text-white]="orderStatusFilter() === 'cancelled'"
                          [class.bg-rose-50]="orderStatusFilter() !== 'cancelled'"
                          [class.text-rose-900]="orderStatusFilter() !== 'cancelled'"
                          class="px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors">
                    Cancelled
                  </button>
                </div>

                <!-- Search Input, Sort & Manual Order -->
                <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div class="relative flex-1 w-full sm:w-auto">
                    <mat-icon class="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 text-[18px]">search</mat-icon>
                    <input 
                      type="text" 
                      [ngModel]="orderSearchQuery()" 
                      (ngModelChange)="orderSearchQuery.set($event)" 
                      placeholder="Search by Order ID (SC-...), customer name, phone, or email..." 
                      class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-brand-200 rounded-xl text-[13px] outline-none focus:border-brand-900 transition-colors">
                  </div>

                  <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
                    <select [ngModel]="orderSortBy()" (ngModelChange)="orderSortBy.set($event)" class="w-full sm:w-auto border border-brand-200 rounded-xl px-3 py-2 text-[13px] bg-white outline-none">
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="highest">Highest Total</option>
                      <option value="lowest">Lowest Total</option>
                    </select>

                    <button (click)="openManualOrderModal()" class="w-full sm:w-auto justify-center btn-primary !py-2 !px-4 text-[13px] flex items-center gap-1.5 whitespace-nowrap shadow-sm">
                      <mat-icon class="text-[16px]">add</mat-icon>
                      <span>Record Order</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 3. Orders Table -->
              <div class="bg-white rounded-[16px] sm:rounded-[24px] shadow-sm border border-brand-100 overflow-hidden">
                <div class="overflow-x-auto hide-scrollbar">
                  <table class="w-full text-left border-collapse min-w-[920px]">
                    <thead>
                      <tr class="bg-brand-50 border-b border-brand-100">
                        <th class="p-4 label-md text-brand-900">Order ID & Date</th>
                        <th class="p-4 label-md text-brand-900">Customer</th>
                        <th class="p-4 label-md text-brand-900">Items</th>
                        <th class="p-4 label-md text-brand-900">Payment & Slip</th>
                        <th class="p-4 label-md text-brand-900">Total</th>
                        <th class="p-4 label-md text-brand-900">Status</th>
                        <th class="p-4 label-md text-brand-900 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (order of filteredOrders(); track order.id) {
                        <tr class="border-b border-brand-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                          <!-- Order ID & Date -->
                          <td class="p-4 text-[14px]">
                            <div class="font-mono font-bold text-brand-900">#{{ order.orderId || order.id }}</div>
                            <div class="text-[12px] text-brand-900/60">{{ order.createdAt?.toDate ? (order.createdAt?.toDate() | date:'mediumDate') : (order.createdAt | date:'mediumDate') }}</div>
                          </td>

                          <!-- Customer -->
                          <td class="p-4">
                            <div class="font-medium text-brand-900 text-[14px]">{{ order.customer?.firstName }} {{ order.customer?.lastName }}</div>
                            <div class="text-[12px] text-brand-900/60 font-mono flex items-center gap-1 mt-0.5">
                              <span>{{ getCountryFlag(order.customer?.phone) }}</span> 
                              <span>{{ order.customer?.phone }}</span>
                            </div>
                            @if (order.customer?.email) {
                              <div class="text-[12px] text-brand-900/60 mt-0.5">{{ order.customer?.email }}</div>
                            }
                            @if (order.customer?.phone) {
                              <div class="flex items-center gap-1.5 mt-1.5">
                                <a [href]="getCustomerWhatsAppUrl(order, 'general')" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-full transition-colors">
                                  <mat-icon class="text-[12px]">chat</mat-icon> WhatsApp
                                </a>
                              </div>
                            }
                            @if (order.customer?.notes) {
                              <div class="mt-2 text-[10px] px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-full font-bold inline-flex items-center gap-1 shadow-sm whitespace-nowrap w-fit" title="Click 'Details' to read the full note">
                                <mat-icon class="text-[14px]">edit_note</mat-icon> Note Attached
                              </div>
                            }
                          </td>

                          <!-- Items -->
                          <td class="p-4">
                            <div class="text-[13px] text-brand-900 font-medium">
                              {{ order.items?.length || 0 }} item(s)
                            </div>
                            <div class="text-[12px] text-brand-900/60 max-w-[200px] truncate">
                              @for (item of order.items; track item.id; let isLast = $last) {
                                {{ item.quantity }}x {{ item.name }}{{ isLast ? '' : ', ' }}
                              }
                            </div>
                          </td>

                          <!-- Payment Slip / Reference -->
                          <td class="p-4">
                            @if (order.bankReference) {
                              <span class="inline-flex items-center gap-1 bg-sky-100 text-sky-900 font-mono text-[11px] px-2.5 py-1 rounded-lg font-semibold" title="Customer Transfer Reference">
                                <mat-icon class="text-[13px]">receipt</mat-icon> {{ order.bankReference }}
                              </span>
                            } @else if (order.status === 'slip_uploaded') {
                              <span class="text-[11px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-medium">Slip uploaded</span>
                            } @else {
                              <span class="text-[11px] text-brand-900/50">Awaiting slip</span>
                            }
                          </td>

                          <!-- Total -->
                          <td class="p-4 font-semibold text-brand-900 text-[15px]">
                            LKR {{ order.total?.toLocaleString() }}
                          </td>

                          <!-- Status Dropdown -->
                          <td class="p-4">
                            <select [ngModel]="order.status" (ngModelChange)="updateOrderStatus(order.id, $event)" 
                                    class="text-[12px] font-semibold border rounded-full px-3 py-1 bg-white outline-none cursor-pointer"
                                    [class.border-amber-300]="order.status === 'pending_receipt' || order.status === 'pending_whatsapp'"
                                    [class.text-amber-800]="order.status === 'pending_receipt' || order.status === 'pending_whatsapp'"
                                    [class.bg-amber-50]="order.status === 'pending_receipt' || order.status === 'pending_whatsapp'"
                                    [class.border-sky-300]="order.status === 'slip_uploaded'"
                                    [class.text-sky-800]="order.status === 'slip_uploaded'"
                                    [class.bg-sky-50]="order.status === 'slip_uploaded'"
                                    [class.border-emerald-300]="order.status === 'paid' || order.status === 'sent' || order.status === 'completed'"
                                    [class.text-emerald-800]="order.status === 'paid' || order.status === 'sent' || order.status === 'completed'"
                                    [class.bg-emerald-50]="order.status === 'paid' || order.status === 'sent' || order.status === 'completed'"
                                    [class.border-rose-300]="order.status === 'cancelled'"
                                    [class.text-rose-800]="order.status === 'cancelled'"
                                    [class.bg-rose-50]="order.status === 'cancelled'">
                              <option value="pending_receipt">Pending Slip</option>
                              <option value="slip_uploaded">Slip Uploaded</option>
                              <option value="paid">Payment Verified</option>
                              <option value="sent">Guides Sent</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          <!-- Actions -->
                          <td class="p-4 text-right">
                            <div class="flex items-center justify-end gap-1.5">
                              <button (click)="openOrderDetail(order)" class="btn-secondary !py-1.5 !px-3 text-[12px] flex items-center gap-1" title="View Full Order Details">
                                <mat-icon class="text-[16px]">visibility</mat-icon> Details
                              </button>

                              @if (order.status === 'pending_receipt' || order.status === 'slip_uploaded') {
                                <button (click)="quickVerifySlip(order)" class="btn-primary !bg-emerald-700 hover:!bg-emerald-800 !py-1.5 !px-3 text-[12px] flex items-center gap-1 shadow-sm" title="Quick Verify Slip">
                                  <mat-icon class="text-[14px]">verified</mat-icon> Verify
                                </button>
                              }

                              <button (click)="deleteOrder(order.id)" class="text-rose-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors" title="Delete Order">
                                <mat-icon class="text-[18px]">delete</mat-icon>
                              </button>
                            </div>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="7" class="p-12 text-center text-brand-900/50">
                            <mat-icon class="text-[36px] text-brand-200 mb-2">inbox</mat-icon>
                            <p class="text-[15px] font-medium text-brand-900/70">No orders found matching your criteria.</p>
                            <p class="text-[12px] text-brand-900/50 mt-1">Try changing filters or search terms.</p>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          }

          <!-- Tab Content: Social Videos Reel (TikTok & Facebook) -->
          @if (activeTab() === 'videos') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Video Form -->
              <div class="bg-white p-6 sm:p-8 rounded-[24px] shadow-sm border border-brand-100 h-fit">
                <h3 class="font-serif text-[24px] text-brand-900 mb-6">
                  {{ editingVideoId() ? 'Edit Social Video' : 'Add TikTok / Facebook Video' }}
                </h3>
                
                <form [formGroup]="videoForm" (ngSubmit)="saveVideo()" class="flex flex-col gap-4">
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Video Title / Tip Headline</label>
                    <input type="text" formControlName="title" placeholder="e.g. Saree jacket armhole cutting hack" class="w-full border border-brand-200 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-brand-900">
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Platform</label>
                      <select formControlName="platform" class="w-full border border-brand-200 rounded-xl px-3 py-2 text-[14px] outline-none focus:border-brand-900 bg-white">
                        <option value="tiktok">TikTok</option>
                        <option value="facebook">Facebook</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Estimated Views</label>
                      <input type="text" formControlName="views" placeholder="e.g. 240K" class="w-full border border-brand-200 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-brand-900">
                    </div>
                  </div>

                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Video Web Link</label>
                    <input type="url" formControlName="url" placeholder="https://www.tiktok.com/@swarna/... or Facebook link" class="w-full border border-brand-200 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-brand-900">
                  </div>

                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Cover Image / Thumbnail URL</label>
                    <input type="url" formControlName="thumbnail" placeholder="https://images.unsplash.com/..." class="w-full border border-brand-200 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-brand-900">
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Duration</label>
                      <input type="text" formControlName="duration" placeholder="e.g. 0:58" class="w-full border border-brand-200 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-brand-900">
                    </div>
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Author Name</label>
                      <input type="text" formControlName="author" placeholder="Swarna Herath" class="w-full border border-brand-200 rounded-xl px-4 py-2 text-[14px] outline-none focus:border-brand-900">
                    </div>
                  </div>

                  <div class="flex gap-3 mt-4">
                    <button type="submit" [disabled]="videoForm.invalid || isSavingVideo()" class="btn-primary flex-1 py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50">
                      @if (isSavingVideo()) {
                        <mat-icon class="animate-spin text-[16px]">autorenew</mat-icon> <span>Saving...</span>
                      } @else {
                        <span>{{ editingVideoId() ? 'Update Video' : 'Add to Reel' }}</span>
                      }
                    </button>
                    @if (editingVideoId()) {
                      <button type="button" (click)="cancelEditVideo()" class="btn-secondary py-2.5 px-4">
                        Cancel
                      </button>
                    }
                  </div>
                </form>
              </div>

              <!-- Videos List -->
              <div class="lg:col-span-2 flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-serif text-[24px] text-brand-900">Active Social Reel ({{ videos().length }} Videos)</h3>
                  <span class="text-[13px] text-brand-900/60">Shows as horizontal reel on Home page</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  @for (vid of videos(); track vid.id) {
                    <div class="bg-white p-4 rounded-2xl border border-brand-100 shadow-sm flex gap-4 items-center">
                      <div class="relative w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                        <img [src]="vid.thumbnail" [alt]="vid.title" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                        <span class="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                              [class.bg-slate-900]="vid.platform === 'tiktok'"
                              [class.bg-[#1877F2]]="vid.platform === 'facebook'">
                          {{ vid.platform }}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-[14px] text-brand-900 line-clamp-2 mb-1 leading-snug">{{ vid.title }}</h4>
                        <div class="flex items-center gap-3 text-[12px] text-brand-900/60 mb-3">
                          <span>{{ vid.views }} views</span>
                          <span>{{ vid.duration || '0:45' }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <button (click)="editVideo(vid)" class="text-[12px] font-medium text-brand-700 hover:text-brand-900">Edit</button>
                          <span class="text-brand-200">•</span>
                          <button (click)="deleteVideo(vid.id)" class="text-[12px] font-medium text-red-600 hover:text-red-800">Delete</button>
                          <span class="text-brand-200">•</span>
                          <a [href]="vid.url" target="_blank" rel="noopener noreferrer" class="text-[12px] font-medium text-brand-500 hover:text-brand-700 flex items-center gap-0.5">
                            Open <mat-icon class="text-[13px]">open_in_new</mat-icon>
                          </a>
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <div class="col-span-full bg-white p-8 rounded-2xl text-center text-brand-900/60 border border-brand-100">
                      No custom videos added yet. Default seed videos are currently displayed on the home page reel. Add your first TikTok or Facebook video!
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Tab Content: Bookings -->
          @if (activeTab() === 'bookings') {
            <div class="bg-white rounded-[16px] sm:rounded-[24px] shadow-sm border border-brand-100 overflow-hidden">
              <div class="overflow-x-auto hide-scrollbar">
                <table class="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr class="bg-brand-50 border-b border-brand-100">
                    <th class="p-4 label-md text-brand-900">Date</th>
                    <th class="p-4 label-md text-brand-900">Client</th>
                    <th class="p-4 label-md text-brand-900">Garment</th>
                    <th class="p-4 label-md text-brand-900">Status</th>
                    <th class="p-4 label-md text-brand-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (booking of bookings(); track booking.id) {
                    <tr class="border-b border-brand-50 last:border-0 hover:bg-slate-50">
                      <td class="p-4 text-[14px] text-brand-900/80">{{ booking.createdAt?.toDate() | date:'mediumDate' }}</td>
                      <td class="p-4">
                        <div class="font-medium text-brand-900">{{ booking.customerName }}</div>
                        <div class="text-[12px] text-brand-900/60">{{ booking.phone }}</div>
                      </td>
                      <td class="p-4">
                        <div class="text-brand-900">{{ booking.garmentType }}</div>
                        <div class="text-[12px] text-brand-900/60">Budget: {{ booking.budget }}</div>
                      </td>
                      <td class="p-4">
                        <select [ngModel]="booking.status" (ngModelChange)="updateBookingStatus(booking.id, $event)" class="text-[13px] border border-brand-200 rounded-full px-3 py-1 bg-white outline-none">
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td class="p-4">
                        <button (click)="deleteBooking(booking.id)" class="text-red-500/70 hover:text-red-500 p-2">
                          <mat-icon class="text-[18px]">delete</mat-icon>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="p-8 text-center text-brand-900/50">No consultations found.</td>
                    </tr>
                  }
                </tbody>
              </table>
              </div>
            </div>
          }

          <!-- Tab Content: Courses -->
          @if (activeTab() === 'courses') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Course Form -->
              <div class="lg:col-span-1 bg-white p-6 rounded-[24px] shadow-sm border border-brand-100">
                <h3 class="font-serif text-[24px] text-brand-900 mb-6">{{ editingCourseId() ? 'Edit Course' : 'Add New Course' }}</h3>
                <form [formGroup]="courseForm" (ngSubmit)="saveCourse()" class="flex flex-col gap-4">
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Title</label>
                    <input type="text" formControlName="title" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                  </div>
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Description</label>
                    <textarea formControlName="description" rows="3" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Level</label>
                      <input type="text" formControlName="level" placeholder="e.g. Beginner" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                    </div>
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Duration</label>
                      <input type="text" formControlName="duration" placeholder="e.g. 6 Months" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                    </div>
                  </div>
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Price</label>
                    <input type="text" formControlName="price" placeholder="e.g. LKR 45,000" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                  </div>
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Image URL</label>
                    <input type="text" formControlName="image" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                  </div>
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Badge (Optional)</label>
                    <input type="text" formControlName="badge" placeholder="e.g. Best Seller" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                  </div>
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Features (One per line)</label>
                    <textarea formControlName="features" rows="4" placeholder="Weekly 1-on-1 voice & video reviews&#10;Direct WhatsApp line" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                  </div>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Join Button Text</label>
                      <input type="text" formControlName="btnJoinText" placeholder="e.g. Enroll Now" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                    </div>
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">View Button Text</label>
                      <input type="text" formControlName="btnViewText" placeholder="e.g. View Details" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                    </div>
                    <div>
                      <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Inquire Button Text</label>
                      <input type="text" formControlName="btnInquireText" placeholder="e.g. WhatsApp Us" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                    </div>
                  </div>
                  
                  <div class="flex gap-3 mt-4">
                    <button type="submit" [disabled]="courseForm.invalid || isSavingCourse()" class="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-1.5">
                      @if (isSavingCourse()) {
                        <mat-icon class="animate-spin text-[16px]">autorenew</mat-icon> <span>Saving...</span>
                      } @else {
                        <span>{{ editingCourseId() ? 'Update' : 'Save' }}</span>
                      }
                    </button>
                    @if (editingCourseId()) {
                      <button type="button" (click)="cancelEditCourse()" class="btn-secondary flex-1">Cancel</button>
                    }
                  </div>
                </form>
              </div>

              <!-- Course List -->
              <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">

                @for (course of courses(); track course.id) {
                  <div class="bg-white rounded-[20px] shadow-sm border border-brand-100 overflow-hidden flex flex-col h-[340px]">
                    <img [src]="course.image" [alt]="course.title" class="w-full h-32 object-cover shrink-0" referrerpolicy="no-referrer">
                    <div class="p-5 flex flex-col flex-grow">
                      <h4 class="font-serif text-[18px] leading-tight text-brand-900 mb-1.5 line-clamp-2" [innerHTML]="course.title | formatText"></h4>
                      <p class="text-[13px] text-brand-900/70 mb-2 line-clamp-2" [innerHTML]="course.description | formatText"></p>
                      <div class="mt-auto flex items-center justify-between pt-2 border-t border-brand-50">
                        <div class="text-[14px] font-medium text-brand-900">{{ course.price }}</div>
                        <div class="flex gap-1.5">
                          <button (click)="editCourse(course)" title="Edit Course" class="p-2 text-brand-900/60 hover:text-brand-900 bg-brand-50 rounded-full transition-colors">
                            <mat-icon class="text-[18px]">edit</mat-icon>
                          </button>
                          <button (click)="deleteCourse(course.id)" title="Delete Course" class="p-2 text-red-500/60 hover:text-red-500 bg-red-50 rounded-full transition-colors">
                            <mat-icon class="text-[18px]">delete</mat-icon>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Tab Content: Shop -->
          @if (activeTab() === 'shop') {
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- Shop Form -->
              <div class="lg:col-span-1 bg-white p-6 rounded-[24px] shadow-sm border border-brand-100">
                <h3 class="font-serif text-[24px] text-brand-900 mb-6">{{ editingProductId() ? 'Edit Product' : 'Add New Product' }}</h3>
                <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="flex flex-col gap-4">
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Title</label>
                    <input type="text" formControlName="title" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                  </div>
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Price</label>
                    <input type="text" formControlName="price" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                  </div>
                  <div>
                    <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Image URL</label>
                    <input type="text" formControlName="image" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                  </div>
                  
                  <div class="flex gap-3 mt-4">
                    <button type="submit" [disabled]="productForm.invalid || isSavingProduct()" class="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-1.5">
                      @if (isSavingProduct()) {
                        <mat-icon class="animate-spin text-[16px]">autorenew</mat-icon> <span>Saving...</span>
                      } @else {
                        <span>{{ editingProductId() ? 'Update' : 'Save' }}</span>
                      }
                    </button>
                    @if (editingProductId()) {
                      <button type="button" (click)="cancelEditProduct()" class="btn-secondary flex-1">Cancel</button>
                    }
                  </div>
                </form>
              </div>

              <!-- Product List -->
              <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                @for (product of products(); track product.id) {
                  <div class="bg-white rounded-[24px] shadow-sm border border-brand-100 overflow-hidden flex flex-col">
                    <img [src]="product.image" [alt]="product.title" class="w-full h-48 object-cover" referrerpolicy="no-referrer">
                    <div class="p-6 flex items-center justify-between">
                      <div>
                        <h4 class="font-serif text-[18px] text-brand-900 mb-1">{{ product.title }}</h4>
                        <div class="text-[14px] font-medium text-brand-600">{{ product.price }}</div>
                      </div>
                      <div class="flex gap-2">
                        <button (click)="editProduct(product)" class="p-2 text-brand-900/60 hover:text-brand-900 bg-brand-50 rounded-full transition-colors">
                          <mat-icon class="text-[18px]">edit</mat-icon>
                        </button>
                        <button (click)="deleteProduct(product.id)" class="p-2 text-red-500/60 hover:text-red-500 bg-red-50 rounded-full transition-colors">
                          <mat-icon class="text-[18px]">delete</mat-icon>
                        </button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
          <!-- Tab Content: Content Copy -->
          @if (activeTab() === 'content') {
            <div class="bg-white p-8 rounded-[24px] shadow-sm border border-brand-100 mb-8">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h3 class="font-serif text-[32px] text-brand-900">Website Copy Editor</h3>
                <div class="flex flex-col sm:flex-row gap-3">

                  <button (click)="saveContent()" [disabled]="contentSaving()" class="btn-primary flex items-center gap-1.5 disabled:opacity-50">
                    @if (contentSaving()) {
                      <mat-icon class="animate-spin text-[16px]">autorenew</mat-icon> <span>Saving...</span>
                    } @else {
                      <span>Publish Changes</span>
                    }
                  </button>
                </div>
              </div>

              @if (contentService.loading()) {
                <div class="py-12 text-center text-brand-900/60">Loading content...</div>
              } @else {
                <div class="flex flex-col gap-12">
                  
                  <!-- Official Bank Details & WhatsApp -->
                  <section class="bg-emerald-50/60 p-6 sm:p-8 rounded-[24px] border border-emerald-200/80">
                    <h4 class="font-serif text-[24px] text-emerald-950 mb-1 flex items-center gap-2">
                      <mat-icon class="text-emerald-700">account_balance</mat-icon>
                      Official Bank & WhatsApp Order Details
                    </h4>
                    <p class="text-[13px] text-emerald-900/70 mb-6">
                      These details are shown on Checkout and used to generate WhatsApp payment verification prompts for customers.
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Bank Name</label>
                        <input type="text" [(ngModel)]="draftContent.app.bankName" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 bg-white">
                      </div>
                      <div>
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Account Name</label>
                        <input type="text" [(ngModel)]="draftContent.app.accountName" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 bg-white">
                      </div>
                      <div>
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Account Number</label>
                        <input type="text" [(ngModel)]="draftContent.app.accountNumber" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 bg-white font-mono">
                      </div>
                      <div>
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">Branch</label>
                        <input type="text" [(ngModel)]="draftContent.app.branch" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 bg-white">
                      </div>
                      <div>
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">WhatsApp Number (e.g. 94771234567)</label>
                        <input type="text" [(ngModel)]="draftContent.app.whatsappNumber" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 bg-white font-mono">
                      </div>
                      <div>
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1">WhatsApp Display Text</label>
                        <input type="text" [(ngModel)]="draftContent.app.whatsappDisplay" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 bg-white">
                      </div>
                    </div>
                  </section>

                  <!-- Home Page Content -->
                  <section>
                    <h4 class="font-serif text-[24px] text-brand-900 mb-6 pb-2 border-b border-brand-100">Home Page</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Headline</label>
                        <input type="text" [(ngModel)]="draftContent.home.heroTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Description (Paragraph 1)</label>
                        <textarea [(ngModel)]="draftContent.home.heroDesc" rows="3" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>

                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Description (Paragraph 2)</label>
                        <textarea [(ngModel)]="draftContent.home.heroDesc2" rows="3" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Video Title</label>
                        <input type="text" [(ngModel)]="draftContent.home.videoTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Video Description</label>
                        <textarea [(ngModel)]="draftContent.home.videoDesc" rows="3" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      
                      <!-- Home Bento 1 -->
                      <div class="bg-slate-50 p-4 rounded-xl">
                        <h5 class="font-medium text-brand-900 mb-4">Service Card 1 (Classes)</h5>
                        <input type="text" [(ngModel)]="draftContent.home.bento1Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <textarea [(ngModel)]="draftContent.home.bento1Desc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400"></textarea>
                        <input type="text" [(ngModel)]="draftContent.home.bento1Btn" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>

                      <!-- Home Bento 2 -->
                      <div class="bg-slate-50 p-4 rounded-xl">
                        <h5 class="font-medium text-brand-900 mb-4">Service Card 2 (Custom)</h5>
                        <input type="text" [(ngModel)]="draftContent.home.bento2Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <textarea [(ngModel)]="draftContent.home.bento2Desc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400"></textarea>
                        <input type="text" [(ngModel)]="draftContent.home.bento2Btn" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>

                      <!-- Services Section -->
                      <div class="col-span-full bg-slate-50 p-4 rounded-xl mt-4">
                        <h5 class="font-medium text-brand-900 mb-4">Services Section Intro</h5>
                        <input type="text" [(ngModel)]="draftContent.home.servicesTitle" placeholder="Services Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <textarea [(ngModel)]="draftContent.home.servicesDesc" placeholder="Services Description" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>

                      <div class="col-span-full bg-slate-50 p-4 rounded-xl mt-4 flex flex-col gap-4">
                        <h5 class="font-medium text-brand-900">How it Works (WhatsApp Order)</h5>
                        
                        <div>
                          <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Section Title</label>
                          <input type="text" [(ngModel)]="draftContent.home.howItWorksTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div class="bg-white p-4 rounded-lg border border-brand-100">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 1 Title</label>
                            <input type="text" [(ngModel)]="draftContent.home.howItWorksStep1Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-2 outline-none focus:border-brand-400">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 1 Description</label>
                            <textarea [(ngModel)]="draftContent.home.howItWorksStep1" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                          </div>
                          <div class="bg-white p-4 rounded-lg border border-brand-100">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 2 Title</label>
                            <input type="text" [(ngModel)]="draftContent.home.howItWorksStep2Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-2 outline-none focus:border-brand-400">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 2 Description</label>
                            <textarea [(ngModel)]="draftContent.home.howItWorksStep2" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                          </div>
                          <div class="bg-white p-4 rounded-lg border border-brand-100">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 3 Title</label>
                            <input type="text" [(ngModel)]="draftContent.home.howItWorksStep3Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-2 outline-none focus:border-brand-400">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 3 Description</label>
                            <textarea [(ngModel)]="draftContent.home.howItWorksStep3" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                          </div>
                          <div class="bg-white p-4 rounded-lg border border-brand-100">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 4 Title</label>
                            <input type="text" [(ngModel)]="draftContent.home.howItWorksStep4Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-2 outline-none focus:border-brand-400">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 4 Description</label>
                            <textarea [(ngModel)]="draftContent.home.howItWorksStep4" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                          </div>
                          <div class="bg-white p-4 rounded-lg border border-brand-100">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 5 Title</label>
                            <input type="text" [(ngModel)]="draftContent.home.howItWorksStep5Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-2 outline-none focus:border-brand-400">
                            <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-1.5">Step 5 Description</label>
                            <textarea [(ngModel)]="draftContent.home.howItWorksStep5" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                          </div>
                        </div>
                      </div>

                      <div class="col-span-full mt-4">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Testimonial Quote</label>
                        <textarea [(ngModel)]="draftContent.home.testimonialQuote" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                    </div>
                  </section>

                  <!-- About Page Content -->
                  <section>
                    <h4 class="font-serif text-[24px] text-brand-900 mb-6 pb-2 border-b border-brand-100">About Page</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="col-span-full md:col-span-1">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Title</label>
                        <input type="text" [(ngModel)]="draftContent.about.heroTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full md:col-span-1">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Pill Label</label>
                        <input type="text" [(ngModel)]="draftContent.about.heroPill" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Subheading</label>
                        <textarea [(ngModel)]="draftContent.about.heroDesc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Main Content</label>
                        <textarea [(ngModel)]="draftContent.about.content" rows="12" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-['Noto_Sans_Sinhala']"></textarea>
                      </div>
                    </div>
                  </section>
                  
                  <!-- Courses (Learn) Page Content -->
                  <section>
                    <h4 class="font-serif text-[24px] text-brand-900 mb-6 pb-2 border-b border-brand-100">Courses Page</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Headline</label>
                        <input type="text" [(ngModel)]="draftContent.learn.heroTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Description</label>
                        <textarea [(ngModel)]="draftContent.learn.heroDesc" rows="3" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Why Us Title</label>
                        <input type="text" [(ngModel)]="draftContent.learn.whyTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Why Us Description</label>
                        <textarea [(ngModel)]="draftContent.learn.whyDesc" rows="3" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      <div class="col-span-full bg-slate-50 p-4 rounded-xl">
                        <h5 class="font-medium text-brand-900 mb-4">Main Course Section</h5>
                        <input type="text" [(ngModel)]="draftContent.learn.mainCoursePill" placeholder="Pill Label" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <input type="text" [(ngModel)]="draftContent.learn.mainCourseTitle" placeholder="Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <textarea [(ngModel)]="draftContent.learn.mainCourseDesc" placeholder="Description" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400"></textarea>
                        <input type="text" [(ngModel)]="draftContent.learn.mainCourseBtn1" placeholder="Button 1" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <input type="text" [(ngModel)]="draftContent.learn.mainCourseBtn2" placeholder="Button 2" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">All Classes Title</label>
                        <input type="text" [(ngModel)]="draftContent.learn.allClassesTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                    </div>
                  </section>

                  <!-- Custom Sewing (Sew&Su) Page Content -->
                  <section>
                    <h4 class="font-serif text-[24px] text-brand-900 mb-6 pb-2 border-b border-brand-100">Custom Sewing Page</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Headline</label>
                        <input type="text" [(ngModel)]="draftContent.sewAndSu.heroTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Description</label>
                        <textarea [(ngModel)]="draftContent.sewAndSu.heroDesc" rows="3" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Process Title</label>
                        <input type="text" [(ngModel)]="draftContent.sewAndSu.processTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      
                      <!-- Steps -->
                      <div class="bg-slate-50 p-4 rounded-xl col-span-full md:col-span-1">
                        <h5 class="font-medium text-brand-900 mb-4">Step 1</h5>
                        <input type="text" [(ngModel)]="draftContent.sewAndSu.step1Title" placeholder="Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <textarea [(ngModel)]="draftContent.sewAndSu.step1Desc" placeholder="Description" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      <div class="bg-slate-50 p-4 rounded-xl col-span-full md:col-span-1">
                        <h5 class="font-medium text-brand-900 mb-4">Step 2</h5>
                        <input type="text" [(ngModel)]="draftContent.sewAndSu.step2Title" placeholder="Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <textarea [(ngModel)]="draftContent.sewAndSu.step2Desc" placeholder="Description" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      <div class="bg-slate-50 p-4 rounded-xl col-span-full">
                        <h5 class="font-medium text-brand-900 mb-4">Step 3</h5>
                        <input type="text" [(ngModel)]="draftContent.sewAndSu.step3Title" placeholder="Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <textarea [(ngModel)]="draftContent.sewAndSu.step3Desc" placeholder="Description" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>

                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Form Title</label>
                        <input type="text" [(ngModel)]="draftContent.sewAndSu.formTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                    </div>
                  </section>

                  <!-- Shop Page Content -->
                  <section>
                    <h4 class="font-serif text-[24px] text-brand-900 mb-6 pb-2 border-b border-brand-100">Shop Page</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Headline</label>
                        <input type="text" [(ngModel)]="draftContent.shop.heroTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Description</label>
                        <textarea [(ngModel)]="draftContent.shop.heroDesc" rows="3" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                    </div>
                  </section>

                  <!-- Contact Page Content -->
                  <section>
                    <h4 class="font-serif text-[24px] text-brand-900 mb-6 pb-2 border-b border-brand-100">Contact Page</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="col-span-full md:col-span-1">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Title</label>
                        <input type="text" [(ngModel)]="draftContent.contact.heroTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full md:col-span-1">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Form Title</label>
                        <input type="text" [(ngModel)]="draftContent.contact.formTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                      <div class="col-span-full">
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Hero Description</label>
                        <textarea [(ngModel)]="draftContent.contact.heroDesc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400"></textarea>
                      </div>
                      
                      <div class="bg-slate-50 p-4 rounded-xl col-span-full">
                        <h5 class="font-medium text-brand-900 mb-4">WhatsApp Section</h5>
                        <input type="text" [(ngModel)]="draftContent.contact.whatsappTitle" placeholder="Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400">
                        <textarea [(ngModel)]="draftContent.contact.whatsappDesc" placeholder="Description" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 mb-3 outline-none focus:border-brand-400"></textarea>
                        <input type="text" [(ngModel)]="draftContent.contact.whatsappBtn" placeholder="Button Text" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                    </div>
                  </section>
                  
                  <!-- Other Pages Summary (Sew&Su, Shop, Contact) - Extendable -->
                  <section>
                    <h4 class="font-serif text-[24px] text-brand-900 mb-6 pb-2 border-b border-brand-100">Global & Navigation</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Footer Description</label>
                        <input type="text" [(ngModel)]="draftContent.app.footerBrand" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                       <div>
                        <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Footer Copyright</label>
                        <input type="text" [(ngModel)]="draftContent.app.footerCopy" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400">
                      </div>
                    </div>
                  </section>

                </div>
              }
            </div>
          }

          @if (activeTab() === 'dedicatedCourses') {
            <div class="mb-8 flex items-center justify-between">
              <div>
                <h2 class="font-serif text-[24px] text-brand-900">Dedicated Course Copy</h2>
                <p class="text-brand-900/60 text-[14px]">Manage the content for special dedicated course pages.</p>
              </div>
              <button (click)="saveDedicatedCoursesContent()" [disabled]="isSavingDedicatedCourses()" class="btn-primary flex items-center gap-1.5 disabled:opacity-50">
                @if (isSavingDedicatedCourses()) {
                  <mat-icon class="animate-spin text-[16px]">autorenew</mat-icon> <span>Saving...</span>
                } @else {
                  <mat-icon>save</mat-icon> <span>Save Changes</span>
                }
              </button>
            </div>

            <div class="bg-white rounded-[24px] shadow-sm border border-brand-100 overflow-hidden mb-[32px]">
              <div class="p-6 sm:p-8 flex flex-col gap-6">
                @for (course of courses(); track course.id; let i = $index) {
                  @if (draftContent.dedicatedCourses[course.id]) {
                    <div [class.mt-8]="i > 0">
                      <h3 class="font-serif text-[20px] text-brand-900 mb-[16px] border-b border-brand-100 pb-2">
                        Product/Service {{ (i + 1).toString().padStart(2, '0') }} - {{ course.title }}
                      </h3>
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="col-span-1">
                          <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Pill / Badge</label>
                          <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].pill" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]">
                        </div>
                        <div class="col-span-1">
                          <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Price</label>
                          <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].price" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]">
                        </div>
                        <div class="col-span-full">
                          <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Subtitle</label>
                          <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].subtitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]">
                        </div>
                        <div class="col-span-full">
                          <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Main Title</label>
                          <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].title" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]">
                        </div>
                        <div class="col-span-full">
                          <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Main Bold Description</label>
                          <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].mainDesc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                        </div>
                        <div class="col-span-full">
                          <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Secondary Description</label>
                          <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].subDesc" rows="4" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                        </div>

                        <div class="col-span-full border-t border-brand-100 pt-6 mt-2">
                          <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullets Section Title</label>
                          <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].bulletTitle" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px] mb-6">
                          
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullet 1 Title</label>
                              <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].bullet1Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px] mb-2">
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullet 1 Desc</label>
                              <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].bullet1Desc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                            </div>
                            <div>
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullet 2 Title</label>
                              <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].bullet2Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px] mb-2">
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullet 2 Desc</label>
                              <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].bullet2Desc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                            </div>
                            <div>
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullet 3 Title</label>
                              <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].bullet3Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px] mb-2">
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullet 3 Desc</label>
                              <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].bullet3Desc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                            </div>
                            <div>
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullet 4 Title</label>
                              <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].bullet4Title" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px] mb-2">
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bullet 4 Desc</label>
                              <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].bullet4Desc" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                            </div>
                          </div>
                        </div>

                        <div class="col-span-full border-t border-brand-100 pt-6 mt-2">
                          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="col-span-full">
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Extra Bottom Description</label>
                              <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].bottomDescExtra" rows="2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                            </div>
                            <div>
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bottom Section 1 Title</label>
                              <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].bottomTitle1" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px] mb-2">
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bottom Section 1 Desc</label>
                              <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].bottomDesc1" rows="4" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                            </div>
                            <div>
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bottom Section 2 Title</label>
                              <input type="text" [(ngModel)]="draftContent.dedicatedCourses[course.id].bottomTitle2" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px] mb-2">
                              <label class="block text-[12px] uppercase tracking-wider text-brand-900/70 mb-2">Bottom Section 2 Desc</label>
                              <textarea [(ngModel)]="draftContent.dedicatedCourses[course.id].bottomDesc2" rows="4" class="w-full border border-brand-200 rounded-lg px-4 py-2 outline-none focus:border-brand-400 font-mono text-[13px]"></textarea>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          }

          <!-- Order Details Modal / Drawer -->
          @if (selectedOrder()) {
            <div class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div class="printable-receipt bg-white rounded-[28px] max-w-3xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-100">
                
                <!-- Modal Header -->
                <div class="flex items-start justify-between pb-4 border-b border-brand-100 mb-6">
                  <div>
                    <div class="flex flex-wrap items-center gap-3">
                      <h3 class="font-serif text-[26px] text-brand-900 font-bold">
                        Order #{{ selectedOrder().orderId || selectedOrder().id }}
                      </h3>
                      <span class="text-[12px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
                            [class.bg-amber-100]="selectedOrder().status === 'pending_receipt' || selectedOrder().status === 'pending_whatsapp'"
                            [class.text-amber-800]="selectedOrder().status === 'pending_receipt' || selectedOrder().status === 'pending_whatsapp'"
                            [class.bg-sky-100]="selectedOrder().status === 'slip_uploaded'"
                            [class.text-sky-800]="selectedOrder().status === 'slip_uploaded'"
                            [class.bg-emerald-100]="selectedOrder().status === 'paid' || selectedOrder().status === 'sent' || selectedOrder().status === 'completed'"
                            [class.text-emerald-800]="selectedOrder().status === 'paid' || selectedOrder().status === 'sent' || selectedOrder().status === 'completed'"
                            [class.bg-rose-100]="selectedOrder().status === 'cancelled'"
                            [class.text-rose-800]="selectedOrder().status === 'cancelled'">
                        {{ selectedOrder().status }}
                      </span>
                    </div>
                    <p class="text-[13px] text-brand-900/60 mt-1">
                      Placed on {{ selectedOrder().createdAt?.toDate ? (selectedOrder().createdAt?.toDate() | date:'medium') : (selectedOrder().createdAt | date:'medium') }}
                    </p>
                  </div>
                  <button (click)="closeOrderDetail()" class="no-print text-brand-900/40 hover:text-brand-900 p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>

                <!-- Quick Status Progression Bar -->
                <div class="no-print bg-slate-50 p-4 rounded-2xl border border-brand-100 mb-6">
                  <span class="text-[11px] uppercase tracking-wider text-brand-900/60 font-semibold block mb-2">Order Stage Progression</span>
                  <div class="flex flex-wrap items-center gap-2">
                    <button (click)="updateOrderStatus(selectedOrder().id, 'pending_receipt')" 
                            class="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors border border-amber-200 hover:bg-amber-100 text-amber-900"
                            [class.bg-amber-200]="selectedOrder().status === 'pending_receipt'">
                      1. Awaiting Slip
                    </button>
                    <button (click)="updateOrderStatus(selectedOrder().id, 'slip_uploaded')" 
                            class="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors border border-sky-200 hover:bg-sky-100 text-sky-900"
                            [class.bg-sky-200]="selectedOrder().status === 'slip_uploaded'">
                      2. Slip Uploaded
                    </button>
                    <button (click)="updateOrderStatus(selectedOrder().id, 'paid')" 
                            class="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors border border-emerald-300 hover:bg-emerald-100 text-emerald-900"
                            [class.bg-emerald-200]="selectedOrder().status === 'paid'">
                      3. Payment Verified
                    </button>
                    <button (click)="updateOrderStatus(selectedOrder().id, 'sent')" 
                            class="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors border border-indigo-200 hover:bg-indigo-100 text-indigo-900"
                            [class.bg-indigo-200]="selectedOrder().status === 'sent'">
                      4. Guides Dispatched
                    </button>
                    <button (click)="updateOrderStatus(selectedOrder().id, 'completed')" 
                            class="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors border border-slate-300 hover:bg-slate-200 text-slate-900"
                            [class.bg-slate-300]="selectedOrder().status === 'completed'">
                      5. Completed
                    </button>
                    <button (click)="updateOrderStatus(selectedOrder().id, 'cancelled')" 
                            class="px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors border border-rose-200 hover:bg-rose-100 text-rose-800 ml-auto"
                            [class.bg-rose-200]="selectedOrder().status === 'cancelled'">
                      Cancel Order
                    </button>
                  </div>
                </div>

                <!-- Two-Column Information Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <!-- Customer Details -->
                  <div class="bg-white p-5 rounded-2xl border border-brand-100">
                    <h4 class="font-serif text-[18px] text-brand-900 mb-3 flex items-center gap-2">
                      <mat-icon class="text-brand-600 text-[20px]">person</mat-icon> Customer Details
                    </h4>
                    <div class="space-y-2 text-[14px]">
                      <div>
                        <span class="text-brand-900/60 text-[12px] block">Full Name</span>
                        <span class="font-medium text-brand-900">{{ selectedOrder().customer?.firstName }} {{ selectedOrder().customer?.lastName }}</span>
                      </div>
                      <div>
                        <span class="text-brand-900/60 text-[12px] block">Phone Number</span>
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-medium text-brand-900">{{ selectedOrder().customer?.phone }}</span>
                          @if (selectedOrder().customer?.phone) {
                            <a [href]="'tel:' + selectedOrder().customer?.phone" class="text-[12px] text-brand-600 hover:underline">Call</a>
                          }
                        </div>
                      </div>
                      <div>
                        <span class="text-brand-900/60 text-[12px] block">Email Address</span>
                        <span class="text-brand-900">{{ selectedOrder().customer?.email || 'N/A' }}</span>
                      </div>
                      <div>
                        <span class="text-brand-900/60 text-[12px] block">Delivery / Shipping Address</span>
                        <span class="text-brand-900">
                          {{ selectedOrder().customer?.address || 'Digital Order / Not Provided' }}
                          @if (selectedOrder().customer?.city) { , {{ selectedOrder().customer?.city }} }
                          @if (selectedOrder().customer?.postalCode) { {{ selectedOrder().customer?.postalCode }} }
                        </span>
                      </div>
                      @if (selectedOrder().customer?.notes) {
                        <div class="pt-2">
                          <span class="text-amber-900/80 font-bold text-[12px] uppercase tracking-wider block mb-1 flex items-center gap-1">
                            <mat-icon class="text-[14px]">edit_note</mat-icon> Customer Note
                          </span>
                          <div class="text-amber-900 bg-amber-50 border border-amber-100 p-3 rounded-xl italic break-words whitespace-normal text-[13px]">
                            {{ selectedOrder().customer?.notes }}
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Payment Verification & Bank Ref -->
                  <div class="bg-white p-5 rounded-2xl border border-brand-100 flex flex-col justify-between">
                    <div>
                      <h4 class="font-serif text-[18px] text-brand-900 mb-3 flex items-center gap-2">
                        <mat-icon class="text-brand-600 text-[20px]">account_balance</mat-icon> Payment Reference
                      </h4>
                      <div class="space-y-3">
                        <div class="p-3.5 bg-slate-50 rounded-xl border border-brand-100">
                          <span class="text-[11px] uppercase tracking-wider text-brand-900/60 font-semibold block mb-1">Customer Submitted Reference</span>
                          @if (selectedOrder().bankReference) {
                            <span class="font-mono text-[16px] text-brand-900 font-bold flex items-center gap-1.5 text-emerald-800">
                              <mat-icon class="text-[18px]">verified</mat-icon> {{ selectedOrder().bankReference }}
                            </span>
                          } @else {
                            <span class="text-[13px] text-brand-900/50 italic">No reference provided yet</span>
                          }
                        </div>

                        <div class="no-print">
                          <label class="text-[11px] uppercase tracking-wider text-brand-900/60 font-semibold block mb-1">Private Admin Note</label>
                          <textarea [(ngModel)]="adminNoteInput" placeholder="e.g. Checked slip on WhatsApp, matched CommBank Rs. 25,000 credit on 14/09" rows="2" class="w-full border border-brand-200 rounded-xl p-2.5 text-[13px] outline-none focus:border-brand-900"></textarea>
                          <button (click)="saveAdminNote()" [disabled]="isSavingAdminNote()" class="mt-2 btn-secondary !py-1.5 !px-3 text-[12px] flex items-center gap-1 disabled:opacity-50">
                            @if (isSavingAdminNote()) {
                              <mat-icon class="animate-spin text-[14px]">autorenew</mat-icon> <span>Saving...</span>
                            } @else {
                              <mat-icon class="text-[14px]">save</mat-icon> <span>Save Note</span>
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Ordered Items List -->
                <div class="bg-white p-5 rounded-2xl border border-brand-100 mb-6">
                  <h4 class="font-serif text-[18px] text-brand-900 mb-3">Order Items</h4>
                  <div class="divide-y divide-brand-100">
                    @for (item of selectedOrder().items; track item.id) {
                      <div class="py-3 flex items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                          @if (item.image) {
                            <img [src]="item.image" [alt]="item.name" class="w-12 h-12 object-cover rounded-xl border border-brand-100" referrerpolicy="no-referrer">
                          }
                          <div>
                            <div class="font-medium text-brand-900 text-[14px]">{{ item.name }}</div>
                            <div class="text-[12px] text-brand-900/60">Qty: {{ item.quantity }} &times; LKR {{ item.price?.toLocaleString() }}</div>
                          </div>
                        </div>
                        <div class="font-semibold text-brand-900 text-[14px]">
                          LKR {{ (item.quantity * item.price)?.toLocaleString() }}
                        </div>
                      </div>
                    }
                  </div>
                  <div class="pt-4 mt-2 border-t border-brand-200 flex justify-between items-center text-[16px] font-bold text-brand-900">
                    <span>Grand Total</span>
                    <span class="font-serif text-[20px] text-brand-950">LKR {{ selectedOrder().total?.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- Customer Communication Hub -->
                <div class="no-print bg-brand-50/50 p-5 rounded-2xl border border-brand-100">
                  <span class="text-[11px] uppercase tracking-wider text-brand-900/60 font-semibold block mb-3">WhatsApp Quick Responses</span>
                  <div class="flex flex-wrap gap-2.5">
                    <a [href]="getCustomerWhatsAppUrl(selectedOrder(), 'reminder')" target="_blank" rel="noopener noreferrer" class="btn-secondary !py-2 !px-3 text-[12px] flex items-center gap-1.5 bg-white">
                      <mat-icon class="text-[16px] text-amber-600">notification_important</mat-icon> Send Slip Reminder
                    </a>
                    <a [href]="getCustomerWhatsAppUrl(selectedOrder(), 'paid_confirmation')" target="_blank" rel="noopener noreferrer" class="btn-secondary !py-2 !px-3 text-[12px] flex items-center gap-1.5 bg-white">
                      <mat-icon class="text-[16px] text-emerald-600">check_circle</mat-icon> Confirm Payment Received
                    </a>
                    <a [href]="getCustomerWhatsAppUrl(selectedOrder(), 'guides_sent')" target="_blank" rel="noopener noreferrer" class="btn-secondary !py-2 !px-3 text-[12px] flex items-center gap-1.5 bg-white">
                      <mat-icon class="text-[16px] text-indigo-600">send</mat-icon> Dispatch Guide / Ebook Access
                    </a>
                  </div>
                </div>

              </div>
            </div>
          }

          <!-- Manual Order Modal -->
          @if (isManualOrderOpen()) {
            <div class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div class="bg-white rounded-[28px] max-w-xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-100">
                <div class="flex items-center justify-between pb-4 border-b border-brand-100 mb-6">
                  <div>
                    <h3 class="font-serif text-[24px] text-brand-900 font-bold">Record Order</h3>
                    <p class="text-[13px] text-brand-900/60">Record order placed via WhatsApp chat, phone call, or in-person</p>
                  </div>
                  <button (click)="closeManualOrderModal()" class="text-brand-900/40 hover:text-brand-900 p-2 rounded-full hover:bg-slate-100">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>

                <form [formGroup]="manualOrderForm" (ngSubmit)="saveManualOrder()" class="flex flex-col gap-4">
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">First Name *</label>
                      <input type="text" formControlName="firstName" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900">
                    </div>
                    <div>
                      <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">Last Name</label>
                      <input type="text" formControlName="lastName" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900">
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">Phone Number (WhatsApp) *</label>
                      <input type="text" formControlName="phone" placeholder="0771234567" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900">
                    </div>
                    <div>
                      <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">Email Address</label>
                      <input type="email" formControlName="email" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900">
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">Item Title / Course / Guide *</label>
                    <input type="text" formControlName="itemTitle" placeholder="e.g. Bridal Dress Masterclass or Sewing Guide" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900">
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">Total Price (LKR) *</label>
                      <input type="number" formControlName="totalPrice" placeholder="15000" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900">
                    </div>
                    <div>
                      <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">Delivery Address</label>
                      <input type="text" formControlName="address" placeholder="City or Delivery Address" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900">
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">Initial Status</label>
                    <select formControlName="status" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900 bg-white">
                      <option value="pending_receipt">Awaiting Slip</option>
                      <option value="slip_uploaded">Slip Uploaded</option>
                      <option value="paid">Payment Verified</option>
                      <option value="sent">Guides Sent</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-[11px] uppercase tracking-wider text-brand-900/70 mb-1">Notes / Bank Transfer Slip Ref</label>
                    <textarea formControlName="notes" placeholder="e.g. Paid via FriMi ref #12345" rows="2" class="w-full border border-brand-200 rounded-xl px-3.5 py-2 text-[13px] outline-none focus:border-brand-900"></textarea>
                  </div>

                  <div class="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-brand-100">
                    <button type="button" (click)="closeManualOrderModal()" class="btn-secondary !py-2.5 !px-5 text-[13px]">
                      Cancel
                    </button>
                    <button type="submit" [disabled]="manualOrderForm.invalid || isSavingManualOrder()" class="btn-primary !py-2.5 !px-6 text-[13px] flex items-center gap-1.5 disabled:opacity-50">
                      @if (isSavingManualOrder()) {
                        <mat-icon class="animate-spin text-[16px]">autorenew</mat-icon> <span>Saving...</span>
                      } @else {
                        <mat-icon class="text-[16px]">check</mat-icon> <span>Record Order</span>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class Admin implements OnInit {
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  contentService = inject(ContentService);
  document = inject(DOCUMENT);

  activeTab = signal<'orders' | 'bookings' | 'courses' | 'shop' | 'content' | 'videos' | 'dedicatedCourses'>('orders');

  orders = signal<any[]>([]);
  bookings = signal<any[]>([]);
  courses = signal<any[]>([]);
  products = signal<any[]>([]);
  videos = signal<any[]>([]);

  // Order Management System (OMS) State
  orderStatusFilter = signal<'all' | 'pending_receipt' | 'slip_uploaded' | 'paid' | 'sent' | 'completed' | 'cancelled'>('all');
  orderSearchQuery = signal<string>('');
  orderSortBy = signal<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  selectedOrder = signal<any | null>(null);
  adminNoteInput = signal<string>('');
  isManualOrderOpen = signal<boolean>(false);
  manualOrderForm: FormGroup;
  
  private cdr = inject(ChangeDetectorRef);
  
  isSavingVideo = signal(false);
  isSavingCourse = signal(false);
  isSavingProduct = signal(false);
  isSavingAdminNote = signal(false);
  isSavingManualOrder = signal(false);

  orderMetrics = computed(() => {
    const list = this.orders();
    const totalCount = list.length;
    let awaitingSlipCount = 0;
    let needsReviewCount = 0;
    let verifiedCount = 0;
    let completedCount = 0;
    let totalRevenue = 0;

    for (const ord of list) {
      const st = ord.status || 'pending_receipt';
      if (st === 'pending_receipt' || st === 'pending_whatsapp') {
        awaitingSlipCount++;
      } else if (st === 'slip_uploaded') {
        needsReviewCount++;
      } else if (st === 'paid' || st === 'sent') {
        verifiedCount++;
        totalRevenue += Number(ord.total) || 0;
      } else if (st === 'completed') {
        completedCount++;
        totalRevenue += Number(ord.total) || 0;
      }
    }

    return {
      totalCount,
      awaitingSlipCount,
      needsReviewCount,
      verifiedCount,
      completedCount,
      totalRevenue
    };
  });

  filteredOrders = computed(() => {
    let list = [...this.orders()];
    const filter = this.orderStatusFilter();
    const query = this.orderSearchQuery().toLowerCase().trim();
    const sort = this.orderSortBy();

    if (filter !== 'all') {
      if (filter === 'pending_receipt') {
        list = list.filter(o => o.status === 'pending_receipt' || o.status === 'pending_whatsapp');
      } else {
        list = list.filter(o => o.status === filter);
      }
    }

    if (query) {
      list = list.filter(o => {
        const id = (o.orderId || o.id || '').toLowerCase();
        const fName = (o.customer?.firstName || '').toLowerCase();
        const lName = (o.customer?.lastName || '').toLowerCase();
        const phone = (o.customer?.phone || '').toLowerCase();
        const email = (o.customer?.email || '').toLowerCase();
        const ref = (o.bankReference || '').toLowerCase();
        return id.includes(query) || fName.includes(query) || lName.includes(query) || phone.includes(query) || email.includes(query) || ref.includes(query);
      });
    }

    list.sort((a, b) => {
      if (sort === 'highest') return (b.total || 0) - (a.total || 0);
      if (sort === 'lowest') return (a.total || 0) - (b.total || 0);
      
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (new Date(a.createdAt || 0)).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (new Date(b.createdAt || 0)).getTime();
      if (sort === 'oldest') return timeA - timeB;
      return timeB - timeA;
    });

    return list;
  });

  courseForm: FormGroup;
  editingCourseId = signal<string | null>(null);

  productForm: FormGroup;
  editingProductId = signal<string | null>(null);

  videoForm: FormGroup;
  editingVideoId = signal<string | null>(null);

  draftContent: WebsiteContent = JSON.parse(JSON.stringify(defaultContent));
  contentSaving = signal(false);
  isSavingDedicatedCourses = signal(false);

  constructor() {
    effect(() => {
      if (!this.contentService.loading()) {
        this.draftContent = JSON.parse(JSON.stringify(this.contentService.content()));
      }
    });

    effect(() => {
      const currentCourses = this.courses();
      if (this.draftContent?.dedicatedCourses) {
        currentCourses.forEach(course => {
          if (!this.draftContent.dedicatedCourses[course.id]) {
            this.draftContent.dedicatedCourses[course.id] = {
              pill: '', subtitle: '', title: '', price: '', mainDesc: '', subDesc: '',
              bulletTitle: '', bullet1Title: '', bullet1Desc: '', bullet2Title: '', bullet2Desc: '',
              bullet3Title: '', bullet3Desc: '', bullet4Title: '', bullet4Desc: '',
              bottomDescExtra: '', bottomTitle1: '', bottomDesc1: '', bottomTitle2: '', bottomDesc2: ''
            };
          }
        });
      }
    });

    effect(() => {
      if (this.selectedOrder() || this.isManualOrderOpen()) {
        this.document.body.style.overflow = 'hidden';
      } else {
        this.document.body.style.overflow = '';
      }
    });

    this.manualOrderForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      phone: ['', Validators.required],
      email: [''],
      address: [''],
      itemTitle: ['', Validators.required],
      totalPrice: [15000, [Validators.required, Validators.min(1)]],
      status: ['paid'],
      notes: ['']
    });

    this.courseForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      level: ['', Validators.required],
      duration: ['', Validators.required],
      price: ['', Validators.required],
      image: ['', Validators.required],
      badge: [''],
      features: [''],
      btnJoinText: [''],
      btnViewText: [''],
      btnInquireText: ['']
    });

    this.productForm = this.fb.group({
      title: ['', Validators.required],
      price: ['', Validators.required],
      image: ['', Validators.required],
    });

    this.videoForm = this.fb.group({
      title: ['', Validators.required],
      platform: ['tiktok', Validators.required],
      views: ['150K', Validators.required],
      url: ['', Validators.required],
      thumbnail: ['', Validators.required],
      duration: ['0:50'],
      author: ['Swarna Herath'],
    });
  }

  async saveContent() {
    this.contentSaving.set(true);
    this.cdr.detectChanges();
    try {
      await new Promise(r => setTimeout(r, 800));
      await this.contentService.updateContent(this.draftContent);
    } catch (e) {
      console.error(e);
      alert('Failed to save content');
    }
    this.contentSaving.set(false);
  }

  async saveDedicatedCoursesContent() {
    this.isSavingDedicatedCourses.set(true);
    this.cdr.detectChanges();
    try {
      await new Promise(r => setTimeout(r, 800));
      await this.contentService.updateContent(this.draftContent);
    } catch (e) {
      console.error(e);
      alert('Failed to save content');
    }
    this.isSavingDedicatedCourses.set(false);
  }

  async resetContentToDefaults() {
    if (!confirm('Are you sure you want to reset all website text to the default Sinhala settings? This will overwrite any custom text you have saved.')) return;
    this.contentSaving.set(true);
    try {
      await this.contentService.updateContent(defaultContent);
      this.draftContent = JSON.parse(JSON.stringify(defaultContent));
    } catch (e) {
      console.error(e);
      alert('Failed to reset content');
    }
    this.contentSaving.set(false);
  }

  ngOnInit() {
    // Listen for data
    const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    onSnapshot(ordersQ, (snapshot) => {
      this.orders.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const bookingsQ = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    onSnapshot(bookingsQ, (snapshot) => {
      this.bookings.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const coursesQ = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
    onSnapshot(coursesQ, (snapshot) => {
      this.courses.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const productsQ = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    onSnapshot(productsQ, (snapshot) => {
      this.products.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const videosQ = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    onSnapshot(videosQ, (snapshot) => {
      this.videos.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }

  getCustomerWhatsAppUrl(order: any, templateType: 'general' | 'reminder' | 'paid_confirmation' | 'guides_sent' = 'general'): string {
    const rawPhone = order.customer?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').replace(/^0/, '94');
    const orderRef = order.orderId || order.id?.slice(0, 8);
    const firstName = order.customer?.firstName || 'Valued Customer';
    
    let messageText = '';
    if (templateType === 'reminder') {
      messageText = `Hello ${firstName}, this is Swarna from Su Collection regarding your Order #${orderRef} (LKR ${order.total?.toLocaleString()}). Kindly reply with a screenshot or reference of your bank transfer slip so we can confirm your order and send your guide/materials immediately. Thank you!`;
    } else if (templateType === 'paid_confirmation') {
      messageText = `Hello ${firstName}, great news! We have verified your bank transfer for Order #${orderRef} (LKR ${order.total?.toLocaleString()}). Your payment is fully confirmed. Thank you for trusting Su Collection!`;
    } else if (templateType === 'guides_sent') {
      messageText = `Hello ${firstName}, your guide / course access for Order #${orderRef} is now ready and dispatched! Please find the details enclosed. If you have any questions during your sewing journey, feel free to message me here.`;
    } else {
      messageText = `Hello ${firstName}, this is Swarna from Su Collection regarding your order #${orderRef}. Thank you for choosing us! We are checking your order now.`;
    }

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  }

  openOrderDetail(order: any) {
    this.selectedOrder.set(order);
    this.adminNoteInput.set(order.adminNotes || '');
  }

  closeOrderDetail() {
    this.selectedOrder.set(null);
    this.adminNoteInput.set('');
  }

  async saveAdminNote() {
    const current = this.selectedOrder();
    if (!current) return;
    
    this.isSavingAdminNote.set(true);
    this.cdr.detectChanges();
    try {
      await new Promise(r => setTimeout(r, 800));
      const note = this.adminNoteInput();
      await updateDoc(doc(db, 'orders', current.id), { adminNotes: note });
      this.selectedOrder.update(ord => ({ ...ord, adminNotes: note }));
    } finally {
      this.isSavingAdminNote.set(false);
    }
  }

  async quickVerifySlip(order: any) {
    await updateDoc(doc(db, 'orders', order.id), { status: 'paid' });
    if (this.selectedOrder()?.id === order.id) {
      this.selectedOrder.update(o => ({ ...o, status: 'paid' }));
    }
  }

  async updateSlipStatus(orderId: string, status: 'approved' | 'rejected') {
    await updateDoc(doc(db, 'orders', orderId), {
      slipStatus: status,
      status: status === 'approved' ? 'paid' : 'slip-rejected',
      updatedAt: serverTimestamp()
    });
  }

  getCountryFlag(phone: string): string {
    if (!phone) return '🇱🇰';
    for (const c of COUNTRIES) {
      if (phone.startsWith(c.code)) {
        return c.name.split(' ')[0];
      }
    }
    return '🇱🇰';
  }

  openManualOrderModal() {
    this.manualOrderForm.reset({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      itemTitle: 'Bridal Masterclass Course',
      totalPrice: 25000,
      status: 'paid',
      notes: 'Recorded via WhatsApp direct chat'
    });
    this.isManualOrderOpen.set(true);
  }

  closeManualOrderModal() {
    this.isManualOrderOpen.set(false);
  }

  async saveManualOrder() {
    if (this.manualOrderForm.invalid) return;
    
    this.isSavingManualOrder.set(true);
    this.cdr.detectChanges();
    try {
      await new Promise(r => setTimeout(r, 800));
      const val = this.manualOrderForm.value;
      const orderId = 'SC-' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        orderId,
        customer: {
          firstName: val.firstName,
          lastName: val.lastName || '',
          phone: val.phone,
          email: val.email || '',
          address: val.address || ''
        },
        items: [
          {
            id: 'manual-item-' + Date.now(),
            name: val.itemTitle,
            price: Number(val.totalPrice) || 0,
            quantity: 1
          }
        ],
        total: Number(val.totalPrice) || 0,
        status: val.status || 'paid',
        bankReference: val.notes || 'Direct verification',
        adminNotes: 'Manually logged by admin on ' + new Date().toLocaleDateString(),
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderId), newOrder);
      this.closeManualOrderModal();
    } finally {
      this.isSavingManualOrder.set(false);
    }
  }

  async updateBookingStatus(id: string, status: string) {
    await updateDoc(doc(db, 'bookings', id), { status });
  }

  async deleteBooking(id: string) {
    if (confirm('Are you sure you want to delete this consultation?')) {
      await deleteDoc(doc(db, 'bookings', id));
    }
  }

  // Orders
  async updateOrderStatus(id: string, status: string) {
    await updateDoc(doc(db, 'orders', id), { status });
    if (this.selectedOrder()?.id === id) {
      this.selectedOrder.update(o => ({ ...o, status }));
    }
  }

  async deleteOrder(id: string) {
    if (confirm('Are you sure you want to delete this order?')) {
      await deleteDoc(doc(db, 'orders', id));
    }
  }

  // Videos (Social Reel)
  async saveVideo() {
    if (this.videoForm.invalid) return;
    
    this.isSavingVideo.set(true);
    this.cdr.detectChanges();
    try {
      await new Promise(r => setTimeout(r, 800));
      const data = this.videoForm.value;
      
      if (this.editingVideoId()) {
        await updateDoc(doc(db, 'videos', this.editingVideoId()!), data);
      } else {
        await addDoc(collection(db, 'videos'), { ...data, createdAt: serverTimestamp() });
      }
      this.cancelEditVideo();
    } finally {
      this.isSavingVideo.set(false);
    }
  }

  editVideo(video: any) {
    this.editingVideoId.set(video.id);
    this.videoForm.patchValue(video);
  }

  cancelEditVideo() {
    this.editingVideoId.set(null);
    this.videoForm.reset({
      platform: 'tiktok',
      views: '150K',
      duration: '0:50',
      author: 'Swarna Herath'
    });
  }

  async deleteVideo(id: string) {
    if (confirm('Are you sure you want to delete this video from the reel?')) {
      await deleteDoc(doc(db, 'videos', id));
    }
  }

  // Courses
  async saveCourse() {
    if (this.courseForm.invalid) return;
    
    this.isSavingCourse.set(true);
    this.cdr.detectChanges();
    try {
      await new Promise(r => setTimeout(r, 800));
      const data = this.courseForm.value;
      
      // Convert features text to array
      if (data.features) {
        data.features = data.features.split('\n').map((f: string) => f.trim()).filter((f: string) => f.length > 0);
      } else {
        data.features = [];
      }
      
      if (this.editingCourseId()) {
        await updateDoc(doc(db, 'courses', this.editingCourseId()!), data);
      } else {
        await addDoc(collection(db, 'courses'), { ...data, createdAt: serverTimestamp() });
      }
      this.cancelEditCourse();
    } finally {
      this.isSavingCourse.set(false);
    }
  }

  editCourse(course: any) {
    this.editingCourseId.set(course.id);
    const formData = { ...course };
    if (Array.isArray(formData.features)) {
      formData.features = formData.features.join('\n');
    }
    this.courseForm.patchValue(formData);
  }

  cancelEditCourse() {
    this.editingCourseId.set(null);
    this.courseForm.reset();
  }

  async initializeDefaultCourses() {
    const defaults = [
      {
        id: '100-day-tailoring-business-workbook',
        title: 'Become a Successful Tailoring Entrepreneur in 100 Days',
        subtitle: '100-Day Tailoring Business Workbook (PDF)',
        description: 'ඔයාගේ මැහුම් Skill එකෙන් **තමන්ගේම Business එකක් ගොඩනගන්න**, Product එක තෝරගන්න තැන ඉදන් **Pricing, Online Presence, Content, Orders, Delivery සහ Launch** දක්වා දින 100ක් පුරා Step-by-Step follow කරන්න පුළුවන් Practical Workbook එකක්.',
        level: 'PDF E-BOOK',
        price: 'LKR 690',
        duration: '28 PAGES',
        image: '/images/Workbook.jpeg',
        badge: '',
        features: [
          'Build Your Product & Set Your Price',
          'Build Your Online Business Presence',
          'Create Content & Find Customers',
          'Set Up Orders & Delivery',
          'Launch & Grow Your Business'
        ],
        btnJoinText: 'Get E-Book Now',
        btnViewText: 'විස්තර බලන්න',
        btnInquireText: 'WhatsApp හරහා විමසන්න',
        createdAt: serverTimestamp()
      },
      {
        id: '6-month-tailoring-business-mentorship',
        title: '100-Day Tailoring Business Building Program',
        description: 'Product එකක් හදාගැනීමේ ඉඳන් Pricing, Online Presence, Content, Customer Enquiries, Sales සහ Business Growth දක්වා — ඉගෙනගෙන නවතින්නේ නැතුව, ඔයාගේම Business එකට apply කරගෙන යන්න.',
        level: 'Mentorship',
        price: 'රු. 45,000 (පහසු ගෙවීමේ ක්රමයටද ලබාගත හැක)',
        duration: 'දින 100යි (100 Days)',
        image: 'https://images.unsplash.com/photo-1551893665-f843f600794e?q=80&w=800&auto=format&fit=crop',
        badge: 'Limited Slots',
        features: [
          'Build a Product or Service',
          'Create Your Online Business Presence',
          'Turn Enquiries into Sales & Learn Organic & Paid Growth',
          'Build Your 90-Day Growth Plan'
        ],
        btnJoinText: 'වැඩසටහනට එකතු වන්න',
        btnViewText: 'විස්තර බලන්න',
        btnInquireText: 'WhatsApp හරහා විමසන්න',
        createdAt: serverTimestamp()
      }
    ];

    for (const course of defaults) {
      await setDoc(doc(db, 'courses', course.id), course);
    }
    alert('Default courses initialized successfully!');
  }

  async deleteCourse(id: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteDoc(doc(db, 'courses', id));
    }
  }

  // Products
  async saveProduct() {
    if (this.productForm.invalid) return;
    
    this.isSavingProduct.set(true);
    this.cdr.detectChanges();
    try {
      await new Promise(r => setTimeout(r, 800));
      const data = this.productForm.value;
      
      if (this.editingProductId()) {
        await updateDoc(doc(db, 'products', this.editingProductId()!), data);
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() });
      }
      this.cancelEditProduct();
    } finally {
      this.isSavingProduct.set(false);
    }
  }

  editProduct(product: any) {
    this.editingProductId.set(product.id);
    this.productForm.patchValue(product);
  }

  cancelEditProduct() {
    this.editingProductId.set(null);
    this.productForm.reset();
  }

  async deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  }
}
