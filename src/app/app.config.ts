import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router'; // ✅ Added 'withInMemoryScrolling'
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LucideAngularModule, FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, User, Menu, ChevronLeft } from 'lucide-angular';

import { appRoutes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Routes (with Scroll Fix)
    provideRouter(
      appRoutes,
      // 👇 Ye magic line page ko hamesha Top par le jayegi
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),

    // 2. HTTP Client
    provideHttpClient(withInterceptors([authInterceptor])),

    // 3. Baaki Libraries
    importProvidersFrom(
      ReactiveFormsModule,
      BrowserAnimationsModule,
      
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
        progressBar: true,
      }),
      
      LucideAngularModule.pick({ 
        FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, User, Menu, ChevronLeft 
      })
    )
  ]
};