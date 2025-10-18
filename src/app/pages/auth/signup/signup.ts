import { Component } from '@angular/core';
import { FormBuilder,ReactiveFormsModule,FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html'
})
export class SignupComponent {
  isLoading = false;
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }
  

  async onSubmit() {
    
    this.signupForm.markAllAsTouched(); 

    if (this.signupForm.invalid) {
    return; // errors will now be visible
  }
  
    const { password, confirmPassword } = this.signupForm.value;
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password!.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      alert('✅ Account created! Welcome to Testee');
      this.router.navigate(['/']);
      this.isLoading = false;
    }, 1000);
  }
}

