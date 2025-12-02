import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html'
})
export class SignupComponent {
  isLoading = false;
  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { email, password, confirmPassword, name } = this.signupForm.value;

    if (password !== confirmPassword) {
      alert("Passwords match nahi ho rahe bhai!");
      return;
    }

    this.isLoading = true;

    // Firebase Signup Call
    this.authService.signup(email, password, name).subscribe({
      next: () => {
        this.isLoading = false;
        alert("Account ban gaya! Dashboard pe ja raha hoon.");
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        alert("Gadbad ho gayi: " + err.message);
      }
    });
  }
  
  googleLogin() {
    this.authService.loginWithGoogle().subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => alert(e.message)
    });
  }
}