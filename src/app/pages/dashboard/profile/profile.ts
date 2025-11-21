import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  imports: [CommonModule, FormsModule],
})
export class ProfileComponent {
  isEditingProfile = false;
  isChangingPassword = false;

  userData = {
    name: 'Nikhil Panwar',
    email: '',
    role: '',
    avatar: '',
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(private toastr: ToastrService) {}

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  handleSaveProfile() {
    this.toastr.success('Profile updated successfully.', 'Saved');
    this.isEditingProfile = false;
  }

  handleChangePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastr.error("New passwords don't match.", 'Error');
      return;
    }
    this.toastr.success('Password updated successfully.', 'Success');
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.isChangingPassword = false;
  }

  handleLogout() {
    this.toastr.info('You have been logged out.', 'Logout');
  }
}
