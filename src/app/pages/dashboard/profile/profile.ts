import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
// ✅ Import Sanitizer
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  imports: [CommonModule, FormsModule],
})
export class ProfileComponent implements OnInit {
  isEditingProfile = false;
  isChangingPassword = false;
  isLoggingOut = false; 

  userData: {
    name: string;
    email: string;
    role: string;
    avatar: SafeUrl | string; // ✅ Type Update kiya
  } = {
    name: 'Loading...',
    email: 'Loading...',
    role: 'Administrator',
    avatar: '', 
  };

  passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer // ✅ Inject Sanitizer
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userData.name = user.displayName || 'User'; 
        this.userData.email = user.email || '';
        
        // Default Firebase photo (String)
        this.userData.avatar = user.photoURL || ''; 
        
        // DB se custom photo fetch karo
        this.fetchUserPhoto();
      }
    });
  }

  // ✅ 1. Backend se Photo laana (Blob -> SafeUrl)
  fetchUserPhoto() {
    // Cache busting (?t=...) taaki nayi photo turant dikhe
    const url = `http://localhost:8080/api/user/photo?t=${new Date().getTime()}`;
    
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        // 🛡️ Angular Security Bypass
        this.userData.avatar = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: () => {
        console.log("Custom photo not found, using default.");
      }
    });
  }

  // ✅ 2. Upload Logic
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      // Size Check (5MB)
      if (file.size > 5 * 1024 * 1024) { 
        this.toastr.error('Max file size is 5MB.', 'Error');
        return;
      }

      this.toastr.info('Uploading...', 'Please wait');

      const formData = new FormData();
      formData.append('file', file);

      // API Call
      this.http.post('http://localhost:8080/api/user/upload-photo', formData, { responseType: 'text' }).subscribe({
        next: () => {
          this.toastr.success('Photo updated successfully!', 'Success');
          
          // Turant Preview dikhane ke liye
          const objectURL = URL.createObjectURL(file);
          this.userData.avatar = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          
          // Sidebar ko update karne ke liye ek signal bhej sakte ho (optional)
          this.authService.updatePhotoState("updated"); 
        },
        error: (err) => {
          this.toastr.error('Upload failed.', 'Error');
          console.error(err);
        }
      });
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  }

  handleSaveProfile() {
    this.toastr.success('Profile updated locally.', 'Saved');
    this.isEditingProfile = false;
  }

  handleLogout() { this.isLoggingOut = true; }
  
  confirmLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggingOut = false;
        this.router.navigate(['']);
      }
    });
  }
  
  cancelLogout() { this.isLoggingOut = false; }
  
  handleChangePassword() { 
      this.toastr.info('Feature coming soon!', 'Info');
      this.isChangingPassword = false;
  }
}