import './polyfills';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app'; // Path check kar lena (kabhi 'app/app' hota hai, kabhi 'app/app.component')
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));