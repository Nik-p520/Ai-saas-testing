import './polyfills';
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LucideAngularModule, FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, User, Menu, ChevronLeft } from 'lucide-angular';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideHttpClient(),
    importProvidersFrom(
      BrowserAnimationsModule, // required for Toastr
      ToastrModule.forRoot({
        timeOut: 3000,
        positionClass: 'toast-bottom-right',
        preventDuplicates: true,
        progressBar: true,
      }),
      LucideAngularModule.pick({ FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, User, Menu, ChevronLeft })
    ),
  ],
}).catch((err: unknown) => console.error(err));