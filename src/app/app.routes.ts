import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/auth/login/login';
import { SignupComponent } from './pages/auth/signup/signup';
import { DASHBOARD_ROUTES } from './routes/dashboard.routes';
import { authGuard } from './guards/auth.guard';
export const appRoutes: Routes = [
    // Landing page
  { path: '', component: LandingComponent, pathMatch: 'full' },

  // Auth pages
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

   {
    path: 'dashboard',
    children: DASHBOARD_ROUTES,
    canActivate: [authGuard]
  },
   


  { path: '**', redirectTo: '' }, // Fallback for unknown routes
];  
