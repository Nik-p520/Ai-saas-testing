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

  // ✅ New Function: Element ko argument mein lega aur scroll karega
  scrollToTop(element: HTMLElement) {
    // Console mein check kar ki function call ho raha hai ya nahi
    // console.log("Scrolling to top...", element);
    
    setTimeout(() => {
      element.scrollTop = 0; // Force scroll to 0
    }, 50); // 50ms ka delay taaki page render ho jaye
  }
}