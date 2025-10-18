import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { ReactiveFormsModule } from '@angular/forms';

export const appConfig = {
  providers: [
    importProvidersFrom(ReactiveFormsModule),   
    provideRouter(appRoutes)            
  ]
};
