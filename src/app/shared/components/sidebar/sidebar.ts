import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, FlaskConical, History, Settings, BarChart3, LucideIconData } from 'lucide-angular';

interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class AppSidebarComponent {
  open = true;

  items: SidebarItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: BarChart3 },
  { title: 'Tests', url: '/dashboard/tests', icon: FlaskConical },
  { title: 'History', url: '/dashboard/history', icon: History },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ];
}
