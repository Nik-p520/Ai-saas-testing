import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { takeUntil,retry } from 'rxjs/operators';
import { TestService } from '../../../core/services/crud.service';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tests.html',
})
export class Tests implements OnDestroy {
  websiteUrl: string = '';
  username: string = '';
  password: string = '';

  private streamSubscription?: Subscription; // ✅ Tracks the active stream
  private destroy$ = new Subject<void>();

  isTestingInProgress: boolean = false;
  websiteUrlTouched: boolean = false;
  errorMessage: string = '';
  statusMessage: string = '';

  steps = [
    { id: 0, label: 'Initialize Environment', keyword: 'Initializing' },
    { id: 1, label: 'Analyze & Generate Script', keyword: 'Generating' },
    { id: 2, label: 'Launch Cloud Browser', keyword: 'Launching' },
    { id: 3, label: 'Execute Interactions', keyword: 'Executing' },
    { id: 4, label: 'Process Results', keyword: 'Processing' },
    { id: 5, label: 'Finalize Report', keyword: 'Saving' }
  ];
  
  currentStepIndex = 0;

  constructor(private testService: TestService, private router: Router) {}

  handleTest() {
    // 🛑 STOP: Agar pehle se test chal raha hai toh naya start mat karo
    if (this.isTestingInProgress) return;

    this.websiteUrlTouched = true;
    if (!this.websiteUrl.trim()) {
      this.errorMessage = 'Website URL is required.';
      return;
    }

    // ✅ Clean up purani stream agar koi bachi ho (429 prevention)
    if (this.streamSubscription) {
        this.streamSubscription.unsubscribe();
    }

    this.errorMessage = '';
    this.isTestingInProgress = true;
    this.statusMessage = 'Initializing test environment...';
    this.currentStepIndex = 0;

    const requestData = {
      url: this.websiteUrl,
      credentials: { username: this.username, password: this.password }
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
    this.streamSubscription = this.testService.getTestStream(testId)
      .pipe(
        // ✅ The "Connection Lost" Fix: 
        // If the stream errors due to a network glitch, wait 2s and try again (up to 3 times).
        retry({ count: 3, delay: 2000 }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (event: any) => {
          if (event.type === 'PROGRESS') {
            this.statusMessage = event.message || 'Processing...';
            this.updateActiveStep(this.statusMessage);
          } else if (event.type === 'COMPLETED' && event.data) {
            console.log('✅ Test Result Received:', event.data);
            this.currentStepIndex = this.steps.length;
            this.isTestingInProgress = false;
            this.router.navigate(['/dashboard/result', event.data.id]);
          }
        },
        error: (err: any) => {
          // This only triggers if ALL retries fail
          console.error('Fatal Stream Error:', err);
          this.errorMessage = 'Connection lost permanently. Please check your network and try again.';
          this.isTestingInProgress = false;
        }
      });
  }

  private updateActiveStep(message: string) {
    const foundIndex = this.steps.findIndex(step => message.includes(step.keyword));
    if (foundIndex !== -1 && foundIndex > this.currentStepIndex) {
        this.currentStepIndex = foundIndex;
    }
  }

  // ✅ Clean up when leaving the page
  ngOnDestroy() {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
    }
  }
}