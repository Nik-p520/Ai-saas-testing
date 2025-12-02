import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { LucideAngularModule, FlaskConical, History, Settings, BarChart3, LucideIconData } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // Import Sanitizer

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
export class AppSidebarComponent implements OnInit {
  @Output() toggle = new EventEmitter<void>();
  open = true;
  
  userName: string = 'User'; 
  userAvatar: SafeUrl | string = ''; // ✅ Update Type

  items: SidebarItem[] = [
    { title: 'Dashboard', url: '/dashboard/home', icon: BarChart3 },
    { title: 'Tests', url: '/dashboard/tests', icon: FlaskConical },
    { title: 'History', url: '/dashboard/history', icon: History },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer // ✅ Inject Sanitizer
  ) {}

  ngOnInit() {
    // 1. Listen for User Details (Name Update)
    this.authService.user$.subscribe(user => {
      if (user) {
        // ✅ Name Update Logic
        this.userName = user.displayName || user.email?.split('@')[0] || 'User';

        // Default Firebase photo
        if (!this.userAvatar) {
           this.userAvatar = user.photoURL || '';
        }
        
        // Backend se bhi photo fetch kar lo (Initial Load)
        this.fetchUserPhoto();
      }
    });

    // 2. Listen for Photo Updates (Real-time sync from Profile Component)
    this.authService.photoUrl$.subscribe(signal => {
        if (signal === 'updated') {
            this.fetchUserPhoto(); // Refresh photo
        }
    });
  }

  // ✅ Fetch Photo (Blob) & Sanitize
  fetchUserPhoto() {
    const url = `http://localhost:8080/api/user/photo?t=${new Date().getTime()}`;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        // ✅ Bypass Security for Blob URL
        this.userAvatar = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: () => {} 
    });
  }

  toggleSidebar() {
    this.open = !this.open;
    this.toggle.emit();
  }
}