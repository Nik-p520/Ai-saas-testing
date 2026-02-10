import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { LucideAngularModule, FlaskConical, History, Settings, BarChart3, LucideIconData } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  
  userName: string = ''; 
  userAvatar: SafeUrl | string = ''; 
  
  // ✅ Loading States for Skeleton
  isLoading = true;       // Backend fetch
  isImageLoading = true;  // Image rendering

  items: SidebarItem[] = [
    { title: 'Dashboard', url: '/dashboard/home', icon: BarChart3 },
    { title: 'Tests', url: '/dashboard/tests', icon: FlaskConical },
    { title: 'History', url: '/dashboard/history', icon: History },
    { title: 'Settings', url: '/dashboard/settings', icon: Settings },
  ];

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.userName = user.displayName || user.email?.split('@')[0] || 'User';
        
        if (user.photoURL) {
           this.userAvatar = user.photoURL;
        }
        
        this.fetchUserPhoto();
      }
    });

    this.authService.photoUrl$.subscribe(signal => {
        if (signal === 'updated') {
            this.fetchUserPhoto();
        }
    });
  }

  fetchUserPhoto() {
    
    if (this.userAvatar) {
        this.isLoading = false;
        this.isImageLoading = false;
        return; 
    }

    this.isLoading = true;
    this.isImageLoading = true; // Reset image loading state
    
    const url = `${(window as any).__env.SPRING_API}/api/user/photo?t=${new Date().getTime()}`;
    
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.userAvatar = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.isLoading = false;
        // Note: We don't set isImageLoading = false here. 
        // We wait for the HTML (load) event.
      },
      error: () => {
        this.isLoading = false;
        this.isImageLoading = false; // No image to load, so stop waiting
      } 
    });
  }

  // ✅ Called when <img> actually renders
  onImageLoad() {
    this.isImageLoading = false;
  }

  toggleSidebar() {
    this.open = !this.open;
    this.toggle.emit();
  }
}