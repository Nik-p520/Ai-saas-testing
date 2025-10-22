import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppSidebarComponent } from '../../shared/components/sidebar/sidebar';
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, AppSidebarComponent],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayoutComponent {}

