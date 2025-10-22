import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';
import { LucideAngularModule, FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, } from 'lucide-angular';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    importProvidersFrom(
      LucideAngularModule.pick({ FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, })
    ),
  ],
}).catch((err: unknown) => console.error(err));