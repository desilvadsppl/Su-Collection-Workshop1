import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // {
  //   path: 'shop/:id',
  //   renderMode: RenderMode.Server,
  // },
  {
    path: 'admin-portal-su',
    renderMode: RenderMode.Server,
  },
  {
    path: 'learn/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'cart',
    renderMode: RenderMode.Server,
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
