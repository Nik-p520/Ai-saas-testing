import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppSidebarComponent } from '../../shared/components/sidebar/sidebar';
import { LucideAngularModule } from 'lucide-angular'; 
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, AppSidebarComponent, LucideAngularModule],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayoutComponent {
  open = true;

  toggleSidebar() {
    this.open = !this.open;
  }
}

