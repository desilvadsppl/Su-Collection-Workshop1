import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {provideRouter, withInMemoryScrolling} from '@angular/router';
import {routes} from './app.routes';
import {ContentService} from './services/content.service';

export function initializeApp(contentService: ContentService) {
  return () => contentService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(), 
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [ContentService],
      multi: true
    }
  ]
};
