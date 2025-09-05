import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { NoopInterceptor } from './NoopInterceptor';
import { CacheInterceptorService } from './CacheInterceptor';
import { AuthInterceptor } from './AuthInterceptor';
import { HttpErrorInterceptor } from './HttpErrorInterceptor ';

/** Http interceptor providers in outside-in order */

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptorService, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true }
];