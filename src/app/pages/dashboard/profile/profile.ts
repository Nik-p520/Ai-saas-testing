import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
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
  
  // ✅ Data Loading State (Fetching from Backend)
  isLoadingData = true;
  
  // ✅ Image Loading State (Fetching actual bytes for <img>)
  isImageLoading = true;

  userData: {
    name: string;
    email: string;
    role: string;
    avatar: SafeUrl | string;
  } = {
    name: '',
    email: '',
    role: '',
    avatar: '', 
  };

  passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };

  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userData.name = user.displayName || 'User'; 
        this.userData.email = user.email || '';
        this.userData.role = 'Administrator';
        
        if (user.photoURL) {
             this.userData.avatar = user.photoURL;
        }
        
        this.fetchUserPhoto();
      }
    });
  }

  fetchUserPhoto() {
    this.isLoadingData = true;
    const url = `http://localhost:8080/api/user/photo?t=${new Date().getTime()}`;
    
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.userData.avatar = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        this.isLoadingData = false;
        // Note: isImageLoading ko abhi false mat karo, HTML mein (load) event karega
      },
      error: () => {
        // Backend photo nahi hai, to loading band kar do
        this.isLoadingData = false;
        this.isImageLoading = false; // Koi image load nahi honi, to false kar do
      }
    });
  }

  // ✅ Image Load Event Handler (HTML se call hoga)
  onImageLoad() {
    this.isImageLoading = false; // Ab image dikha do
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        this.toastr.error('Max file size is 5MB.', 'Error');
        return;
      }

      // Reset Loading States
      this.isLoadingData = true;
      this.isImageLoading = true;
      
      this.toastr.info('Uploading...', 'Please wait');

      const formData = new FormData();
      formData.append('file', file);

      this.http.post('http://localhost:8080/api/user/upload-photo', formData, { responseType: 'text' }).subscribe({
        next: () => {
          this.toastr.success('Photo updated!', 'Success');
          
          const objectURL = URL.createObjectURL(file);
          this.userData.avatar = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.authService.updatePhotoState(objectURL);
          
          this.isLoadingData = false;
          // Local file hai to turant load ho jayegi, par safe side ke liye:
          setTimeout(() => this.isImageLoading = false, 100); 
        },
        error: (err) => {
          this.toastr.error('Upload failed.', 'Error');
          this.isLoadingData = false;
          this.isImageLoading = false;
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