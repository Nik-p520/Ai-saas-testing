import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TestService, TestResult } from '../../../core/services/crud.service';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tests.html',
})
export class Tests {
  websiteUrl: string = '';
  username: string = '';
  password: string = '';
  isTestingInProgress: boolean = false;
  websiteUrlTouched: boolean = false;
  testResult?: TestResult;
  errorMessage: string = '';

  constructor(private testService: TestService, private router: Router) {} // ✅ Inject Router

  handleTest() {
    this.websiteUrlTouched = true;

    if (!this.websiteUrl.trim()) {
      this.errorMessage = 'Website URL is required.';
      return;
    }

    this.errorMessage = '';
    this.isTestingInProgress = true;

    this.testService.generateTest(this.websiteUrl).subscribe({
      next: (result) => {
        this.testResult = result;
        console.log('✅ Test Result Received:', result);
        this.isTestingInProgress = false;

        // ✅ Redirect to the result page using the generated ID
        this.router.navigate(['/dashboard/result', result.id]);
      },
      error: (err) => {
        console.error('❌ Error starting test:', err);
        this.errorMessage = 'Failed to start test. Please try again.';
        this.isTestingInProgress = false;
      },
    });
  }
}
