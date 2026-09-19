import {ChangeDetectionStrategy, Component, computed, inject, signal, OnInit} from '@angular/core';
import {RouterLink, ActivatedRoute, Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {db} from '../lib/firebase';
import {doc, getDoc} from 'firebase/firestore';
import {CartService} from './services/cart.service';
import {ContentService} from './services/content.service';
import {Location} from '@angular/common';
import {FormatTextPipe} from './pipes/format-text.pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-course-detail',
  imports: [RouterLink, MatIconModule, FormatTextPipe],
  template: `
    <main class="min-h-screen pt-[120px] pb-[64px] px-6 max-w-[1200px] mx-auto">
      <button (click)="goBack()" class="inline-flex items-center text-brand-900/60 hover:text-brand-900 mb-[40px] transition-colors label-md bg-transparent outline-none cursor-pointer border-none p-0">
        <mat-icon class="mr-2 text-[18px]">arrow_back</mat-icon> Back
      </button>

      @if (loading()) {
        <div class="py-24 flex justify-center">
          <mat-icon class="animate-spin text-brand-900">refresh</mat-icon>
        </div>
      } @else if (course()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-[48px] lg:gap-[64px]">
          <!-- Image -->
          <div class="rounded-[32px] overflow-hidden bg-slate-50 shadow-sm border border-brand-100 aspect-[4/3] relative" [class.md:mt-10]="!!c().dedicatedCourses[course()?.id]?.mainDesc">
            <!-- Common Image Section -->
            <img [src]="course()?.image" [alt]="course()?.title" class="w-full h-full object-cover" loading="lazy" decoding="async" referrerpolicy="no-referrer">
            @if (!c().dedicatedCourses[course()?.id]?.mainDesc) {
              <div class="absolute top-4 left-4 glass-panel text-brand-900 px-4 py-2 rounded-full shadow-sm label-md font-semibold text-[12px] sm:text-[14px]">
                {{ course()?.level }}
              </div>
            } @else {
              <div class="absolute top-4 left-4 glass-panel text-brand-900 px-4 py-2 rounded-full shadow-sm label-md font-semibold text-[12px] sm:text-[14px]">
                {{ c().dedicatedCourses[course()?.id].pill }}
              </div>
            }
          </div>

          <!-- Details -->
          <div class="flex flex-col justify-center">
            @if (!c().dedicatedCourses[course()?.id]?.mainDesc) {
              <!-- Standard Generic Course Details -->
              <div class="flex items-center gap-2 text-brand-600 mb-4 label-md font-medium">
                <mat-icon class="text-[18px]">schedule</mat-icon>
                <span>{{ course()?.duration }}</span>
              </div>
              
              <h1 class="font-serif text-[32px] lg:text-[44px] text-brand-900 leading-tight mb-[16px]">{{ course()?.title }}</h1>
              
              <div class="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-2.5 rounded-full mb-[32px] shadow-sm w-fit">
                <mat-icon class="text-[24px]">local_offer</mat-icon>
                <span class="body-md font-semibold text-[20px] sm:text-[24px]">{{ course()?.price }}</span>
              </div>
              
              <p class="body-md text-brand-900/80 leading-[1.8] mb-[32px] text-[16px] lg:text-[18px]" [innerHTML]="course()?.description | formatText">
              </p>
            } @else {
              <!-- Dedicated Course Top Details -->
              @let dedicatedData = c().dedicatedCourses[course()?.id];
              <div class="body-md font-medium text-brand-900/60 mb-4">{{ dedicatedData.subtitle }}</div>
              <h1 class="font-serif text-[32px] lg:text-[44px] text-brand-900 leading-tight mb-[16px]">{{ dedicatedData.title }}</h1>
              <div class="mb-[32px] flex flex-wrap items-center gap-3">
                <div class="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-2.5 rounded-full shadow-sm w-fit">
                  <mat-icon class="text-[24px]">local_offer</mat-icon>
                  @if (course()?.id === '100-day-tailoring-business-workbook') {
                    <span class="text-emerald-800/60 line-through mr-1 font-normal text-[15px] sm:text-[18px]">LKR 990</span>
                    <span class="body-md font-semibold text-[20px] sm:text-[24px]">LKR 690</span>
                  } @else {
                    <span class="body-md font-semibold text-[20px] sm:text-[24px]">{{ dedicatedData.price.split('(')[0].trim() }}</span>
                  }
                </div>
                @if (dedicatedData.price.includes('(')) {
                  <span class="text-[14px] sm:text-[15px] text-brand-900/60 font-medium">({{ dedicatedData.price.split('(')[1] }}</span>
                }
              </div>
              <p class="body-md font-semibold text-brand-900 leading-[1.8] mb-[16px] text-[16px] lg:text-[18px] font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.mainDesc | formatText"></p>
              <p class="body-md text-brand-900/80 leading-[1.8] mb-[32px] text-[15px] whitespace-pre-wrap font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.subDesc | formatText"></p>
            }

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3" [class.mb-[48px]]="!c().dedicatedCourses[course()?.id]?.mainDesc">
              @if (proceedingId()) {
                <button disabled class="btn-primary flex-1 flex items-center justify-center gap-2 shadow-sm !py-4 opacity-80 cursor-wait">
                  <mat-icon class="animate-spin">sync</mat-icon> Proceeding...
                </button>
              } @else if (cartService.hasItem('course-' + course()?.id)) {
                <button (click)="goToCheckout()" class="btn-primary flex-1 flex items-center justify-center gap-2 shadow-sm !bg-emerald-600 hover:!bg-emerald-700 !py-4">
                  <mat-icon>check_circle</mat-icon> Proceed to Checkout
                </button>
              } @else {
                <button (click)="enroll()" class="btn-primary flex-1 flex items-center justify-center gap-2 shadow-sm !py-4">
                  <mat-icon>{{ course()?.level === 'PDF E-Book' ? 'book' : 'school' }}</mat-icon>
                  {{ course()?.btnJoinText || (course()?.level === 'PDF E-Book' ? 'Get E-Book Now' : 'Enroll Now') }}
                </button>
              }
            </div>
            
            @if (!c().dedicatedCourses[course()?.id]?.mainDesc) {
              <div class="border-t border-brand-100 pt-[32px]">
                <div class="flex items-start gap-[16px] mb-[24px]">
                  <div class="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <mat-icon>verified</mat-icon>
                  </div>
                  <div>
                    <h3 class="font-medium text-brand-900 mb-1">Instant Access</h3>
                    <p class="text-[13px] text-brand-900/60 leading-relaxed">
                      {{ course()?.level === 'PDF E-Book' ? 'Receive the PDF download immediately after payment verification.' : 'Get enrolled instantly upon successful payment.' }}
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start gap-[16px]">
                  <div class="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <mat-icon>support_agent</mat-icon>
                  </div>
                  <div>
                    <h3 class="font-medium text-brand-900 mb-1">Dedicated WhatsApp Support</h3>
                    <p class="text-[13px] text-brand-900/60 leading-relaxed">
                      Have questions? Chat directly with Swarna for personalized assistance and guidance.
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Dedicated Course Full-Width Bottom Sections -->
        @if (c().dedicatedCourses[course()?.id]?.mainDesc) {
          @let dedicatedData = c().dedicatedCourses[course()?.id];
          <div class="mt-8 pt-8 border-t border-brand-100 max-w-4xl mx-auto">
            <h2 class="font-serif text-[28px] lg:text-[32px] text-brand-900 mb-8">{{ dedicatedData.bulletTitle }}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-brand-900"></div>
                  <h3 class="font-semibold text-brand-900 text-[18px]">{{ dedicatedData.bullet1Title }}</h3>
                </div>
                <p class="text-brand-900/80 leading-relaxed text-[15px] pl-3.5 font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bullet1Desc | formatText"></p>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-brand-900"></div>
                  <h3 class="font-semibold text-brand-900 text-[18px]">{{ dedicatedData.bullet2Title }}</h3>
                </div>
                <p class="text-brand-900/80 leading-relaxed text-[15px] pl-3.5 font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bullet2Desc | formatText"></p>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-brand-900"></div>
                  <h3 class="font-semibold text-brand-900 text-[18px]">{{ dedicatedData.bullet3Title }}</h3>
                </div>
                <p class="text-brand-900/80 leading-relaxed text-[15px] pl-3.5 font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bullet3Desc | formatText"></p>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-brand-900"></div>
                  <h3 class="font-semibold text-brand-900 text-[18px]">{{ dedicatedData.bullet4Title }}</h3>
                </div>
                <p class="text-brand-900/80 leading-relaxed text-[15px] pl-3.5 font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bullet4Desc | formatText"></p>
              </div>
              @if (dedicatedData.bullet5Title) {
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-brand-900"></div>
                    <h3 class="font-semibold text-brand-900 text-[18px]">{{ dedicatedData.bullet5Title }}</h3>
                  </div>
                  <p class="text-brand-900/80 leading-relaxed text-[15px] pl-3.5 font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bullet5Desc | formatText"></p>
                </div>
              }
              @if (dedicatedData.bullet6Title) {
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-brand-900"></div>
                    <h3 class="font-semibold text-brand-900 text-[18px]">{{ dedicatedData.bullet6Title }}</h3>
                  </div>
                  <p class="text-brand-900/80 leading-relaxed text-[15px] pl-3.5 font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bullet6Desc | formatText"></p>
                </div>
              }
              @if (dedicatedData.bullet7Title) {
                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-brand-900"></div>
                    <h3 class="font-semibold text-brand-900 text-[18px]">{{ dedicatedData.bullet7Title }}</h3>
                  </div>
                  <p class="text-brand-900/80 leading-relaxed text-[15px] pl-3.5 font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bullet7Desc | formatText"></p>
                </div>
              }
            </div>

            <div class="border-t border-brand-100 pt-12 space-y-12">
              @if (dedicatedData.bottomDescExtra) {
                <p class="text-[15px] font-medium text-brand-900 leading-relaxed mb-8 bg-brand-50 p-4 rounded-xl border border-brand-100 font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bottomDescExtra | formatText"></p>
              }
              
              @if (dedicatedData.bottomTitle1 || dedicatedData.bottomDesc1) {
                <div>
                  @if (dedicatedData.bottomTitle1) {
                    <h3 class="font-serif text-[24px] text-brand-900 mb-4">{{ dedicatedData.bottomTitle1 }}</h3>
                  }
                  @if (dedicatedData.bottomDesc1) {
                    <p class="text-brand-900/80 leading-relaxed text-[15px] whitespace-pre-wrap font-['Noto_Sans_Sinhala']" [innerHTML]="dedicatedData.bottomDesc1 | formatText"></p>
                  }
                </div>
              }
              
              @if (dedicatedData.bottomTitle2 || dedicatedData.bottomDesc2) {
                <div>
                  @if (dedicatedData.bottomTitle2) {
                    <h3 class="font-serif text-[24px] text-brand-900 mb-4">{{ dedicatedData.bottomTitle2 }}</h3>
                  }
                  @if (dedicatedData.bottomDesc2) {
                    <p class="text-brand-900/80 leading-relaxed text-[15px]" [innerHTML]="dedicatedData.bottomDesc2 | formatText"></p>
                  }
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <div class="py-24 text-center">
          <mat-icon class="text-[48px] text-brand-200 mb-4">error_outline</mat-icon>
          <h2 class="font-serif text-[24px] text-brand-900 mb-2">Course Not Found</h2>
          <p class="text-brand-900/60 mb-8">The course or book you are looking for does not exist or has been removed.</p>
          <a routerLink="/learn" class="btn-primary">Browse All Courses</a>
        </div>
      }
    </main>
  `
})
export class CourseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  cartService = inject(CartService);
  contentService = inject(ContentService);
  c = this.contentService.content;
  private location = inject(Location);

  course = signal<any>(null);
  loading = signal(true);
  proceedingId = signal<boolean>(false);

  constructor() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state && nav.extras.state['course']) {
      this.course.set(nav.extras.state['course']);
      this.loading.set(false);
    }
  }


  defaultCourses = [
    {
      id: '100-day-tailoring-business-workbook',
      title: 'Become a Successful Tailoring Entrepreneur in 100 Days',
      subtitle: '100-Day Tailoring Business Workbook (PDF)',
      description: 'ඔයාගේ මැහුම් Skill එකෙන් **තමන්ගේම Business එකක් ගොඩනගන්න**, Product එක තෝරගන්න තැන ඉදන් **Pricing, Online Presence, Content, Orders, Delivery සහ Launch** දක්වා දින 100ක් පුරා Step-by-Step follow කරන්න පුළුවන් Practical Workbook එකක්.',
      level: 'PDF E-BOOK',
      price: 'LKR 690',
      duration: '28 PAGES',
      image: '/images/Workbook.jpeg'
    },
    {
      id: '6-month-tailoring-business-mentorship',
      title: '100-Day Tailoring Business Building Program',
      description: 'Product එකක් හදාගැනීමේ ඉඳන් Pricing, Online Presence, Content, Customer Enquiries, Sales සහ Business Growth දක්වා — ඉගෙනගෙන නවතින්නේ නැතුව, ඔයාගේම Business එකට apply කරගෙන යන්න.',
      level: 'Mentorship',
      price: 'රු. 45,000 (පහසු ගෙවීමේ ක්රමයටද ලබාගත හැක)',
      duration: 'දින 100යි (100 Days)',
      image: 'https://images.unsplash.com/photo-1551893665-f843f600794e?q=80&w=800&auto=format&fit=crop'
    }
  ];

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        if (!this.course()) {
          this.fetchCourse(id);
        }
      } else {
        this.loading.set(false);
      }
    });
  }

  async fetchCourse(id: string) {
    this.loading.set(true);
    try {
      const docRef = doc(db, 'courses', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        let courseId = docSnap.id;
        if (courseId === 'sri-lankan-saree-jacket-master-blueprint' || (typeof data['title'] === 'string' && data['title'].includes('Tailoring Entrepreneur')) || (typeof data['subtitle'] === 'string' && data['subtitle'].includes('Workbook'))) {
          courseId = '100-day-tailoring-business-workbook';
        }
        
        if (courseId === '100-day-tailoring-business-workbook') {
          data['title'] = 'Become a Successful Tailoring Entrepreneur in 100 Days';
          data['subtitle'] = '100-Day Tailoring Business Workbook (PDF)';
          data['price'] = 'LKR 690';
          data['image'] = '/images/Workbook.jpeg';
          data['duration'] = '28 PAGES';
          data['level'] = 'PDF E-BOOK';
        }
        if (courseId === '6-month-tailoring-business-mentorship') {
          data['title'] = '100-Day Tailoring Business Building Program';
          data['duration'] = 'දින 100යි (100 Days)';
          data['description'] = 'Product එකක් හදාගැනීමේ ඉඳන් Pricing, Online Presence, Content, Customer Enquiries, Sales සහ Business Growth දක්වා — ඉගෙනගෙන නවතින්නේ නැතුව, ඔයාගේම Business එකට apply කරගෙන යන්න.';
          data['price'] = 'රු. 45,000 (පහසු ගෙවීමේ ක්රමයටද ලබාගත හැක)';
          data['image'] = '/images/product_Mentorship.png';
        }
        this.course.set({ ...data, id: courseId } as any);
      } else {
        const mockCourse = this.defaultCourses.find(c => c.id === id);
        if (mockCourse) {
          this.course.set(mockCourse);
        }
      }
    } catch (e) {
      console.error(e);
      const mockCourse = this.defaultCourses.find(c => c.id === id);
      if (mockCourse) {
        this.course.set(mockCourse);
      }
    } finally {
      this.loading.set(false);
    }
  }

  enroll() {
    const c = this.course();
    if (!c) return;
    
    this.proceedingId.set(true);
    
    // Convert string price 'Rs. 45,000' to number 45000
    const rawPrice = c.price || '0';
    const numericPrice = Number(rawPrice.replace(/[^0-9]/g, ""));
    
    this.cartService.addItem({
      id: 'course-' + c.id,
      name: c.title,
      price: numericPrice,
      image: c.image || '',
      quantity: 1
    });
    
    setTimeout(() => {
      this.router.navigate(['/checkout']);
    }, 400);
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
  
  goBack() {
    this.location.back();
  }
}
