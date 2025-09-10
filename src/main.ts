import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom, isDevMode } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

import { AppComponent } from './app/root/app.component';
import { APP_ROUTES } from './app/routes/app.routes';
import { provideServiceWorker } from '@angular/service-worker';

registerLocaleData(localeIt);

const routes = [
  ...APP_ROUTES,
  { path: '**', redirectTo: 'home' }
];

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    importProvidersFrom(HttpClientModule),
    { provide: LOCALE_ID, useValue: 'it-IT' },
    provideRouter(routes, withPreloading(PreloadAllModules)), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
});
