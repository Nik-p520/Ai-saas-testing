import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/auth/login/login';
import { SignupComponent } from './pages/auth/signup/signup';
export const appRoutes: Routes = [
  { path: '', component: LandingComponent },
  {
    path: 'login', // login page
    component: LoginComponent
  },
  { path: 'signup', component: SignupComponent },
  {
    path: '**', // fallback for unknown routes
    redirectTo: ''
  }
];  
