import {Routes} from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home').then(m => m.Home) },
  { path: 'learn', loadComponent: () => import('./learn').then(m => m.Learn) },
  { path: 'learn/6-month-tailoring-business-mentorship', loadComponent: () => import('./mentorship').then(m => m.Mentorship) },
  { path: 'learn/:id', loadComponent: () => import('./course-detail').then(m => m.CourseDetail) },
  // { path: 'sew-and-su', loadComponent: () => import('./sew-and-su').then(m => m.SewAndSu) },
  // { path: 'shop', loadComponent: () => import('./shop').then(m => m.Shop) },
  // { path: 'shop/:id', loadComponent: () => import('./product-detail').then(m => m.ProductDetail) },
  { path: 'cart', loadComponent: () => import('./cart').then(m => m.Cart) },
  { path: 'checkout', loadComponent: () => import('./checkout').then(m => m.Checkout) },
  { path: 'success', loadComponent: () => import('./success').then(m => m.Success) },
  { path: 'track-order', loadComponent: () => import('./track-order').then(m => m.TrackOrder) },
  { path: 'about', loadComponent: () => import('./about').then(m => m.About) },
  { path: 'contact', loadComponent: () => import('./contact').then(m => m.Contact) },
  { path: 'admin-portal-su', loadComponent: () => import('./admin').then(m => m.Admin) },
];
