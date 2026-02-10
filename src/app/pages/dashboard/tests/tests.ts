import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
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

  private streamSubscription?: Subscription;

  isTestingInProgress: boolean = false;
  websiteUrlTouched: boolean = false;
  errorMessage: string = '';
  statusMessage: string = '';

  // ✅ NEW: Define the specific steps for the Progress Bar
  // The 'keyword' helps us match the backend message to the UI step
  steps = [
    { id: 0, label: 'Initialize Environment', keyword: 'Initializing' },
    { id: 1, label: 'Analyze & Generate Script', keyword: 'Generating' },
    { id: 2, label: 'Launch Cloud Browser', keyword: 'Launching' },
    { id: 3, label: 'Execute Interactions', keyword: 'Executing' },
    { id: 4, label: 'Process Results', keyword: 'Processing' },
    { id: 5, label: 'Finalize Report', keyword: 'Saving' }
  ];
  
  // Tracks the active step index (0 to 5)
  currentStepIndex = 0;

  constructor(private testService: TestService, private router: Router) {}

  handleTest() {
    if (this.isTestingInProgress) return;

    this.websiteUrlTouched = true;

    if (!this.websiteUrl.trim()) {
      this.errorMessage = 'Website URL is required.';
      return;
    }

    if (this.streamSubscription) {
        this.streamSubscription.unsubscribe();
    }

    this.errorMessage = '';
    this.isTestingInProgress = true;
    this.statusMessage = 'Initializing test environment...';
    this.currentStepIndex = 0; // Reset step

    const requestData = {
      url: this.websiteUrl,
      credentials: {
        username: this.username,
        password: this.password
      }
    };

    this.testService.startTest(requestData).subscribe({
      next: (testId) => {
        this.listenToProgress(testId);
      },
      error: (err) => {
        console.error('❌ Error starting test:', err);
        this.errorMessage = 'Failed to start test. Please try again.';
        this.isTestingInProgress = false;
      },
    });
  }

  listenToProgress(testId: string): void {
    this.testService.getTestStream(testId).subscribe({
      next: (event: any) => {
        if (event.type === 'PROGRESS') {
          this.statusMessage = event.message || 'Processing...';
          
          // ✅ UPDATE STEP: Check which keyword matches the incoming message
          this.updateActiveStep(this.statusMessage);

        } else if (event.type === 'COMPLETED' && event.data) {
          console.log('✅ Test Result Received:', event.data);
          this.currentStepIndex = this.steps.length; // Mark all done
          this.router.navigate(['/dashboard/result', event.data.id]);
        }
      },
      error: (err: any) => {
        console.error('Stream Error:', err);
        this.errorMessage = 'Connection lost during test execution.';
        this.isTestingInProgress = false;
      }
    });
  }

  // Helper to move the progress bar forward
  private updateActiveStep(message: string) {
    const foundIndex = this.steps.findIndex(step => message.includes(step.keyword));
    if (foundIndex !== -1) {
      // Only move forward, never backward
      if (foundIndex > this.currentStepIndex) {
        this.currentStepIndex = foundIndex;
      }
    }
  }
}