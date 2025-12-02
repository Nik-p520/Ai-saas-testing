import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LucideAngularModule, FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, User, Menu, ChevronLeft } from 'lucide-angular';

import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor'; // Tera Token Interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Routes
    provideRouter(appRoutes),

    // 2. HTTP Client (INTERCEPTOR KE SAATH)
    // Ye line sabse zaroori hai. Isse Authorization header judega.
    provideHttpClient(withInterceptors([authInterceptor])),

    // 3. Baaki Saare Libraries
    importProvidersFrom(
      ReactiveFormsModule,
      BrowserAnimationsModule, // Toastr ke liye zaroori
      
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
        progressBar: true,
      }),
      
      // Saare Icons yahan load kar lo
      LucideAngularModule.pick({ 
        FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, User, Menu, ChevronLeft 
      })
    )
  ]
};