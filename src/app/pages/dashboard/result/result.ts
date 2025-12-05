import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TestService, TestResult } from '../../../core/services/crud.service'; 

@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.html',
})
export class ResultPageComponent implements OnInit {
  testResult: TestResult | null = null;
  loading = false;
  errorMessage = '';
  statusMessage = ''; 
  copied = false;

  // Steps for Progress Bar
  steps = [
    { id: 0, label: 'Initialize Environment', keyword: 'Initializing' },
    { id: 1, label: 'Analyze & Generate Script', keyword: 'Generating' },
    { id: 2, label: 'Launch Cloud Browser', keyword: 'Launching' },
    { id: 3, label: 'Execute Interactions', keyword: 'Executing' },
    { id: 4, label: 'Process Results', keyword: 'Processing' },
    { id: 5, label: 'Finalize Report', keyword: 'Saving' }
  ];
  currentStepIndex = 0;

  constructor(
    private testService: TestService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadResult(id);
    } else {
      this.errorMessage = 'Invalid Test ID. Please try again.';
    }
  }

  loadResult(id: string): void {
    this.loading = true;
    this.testService
      .getTestById(id)
      .pipe(finalize(() => {
        if (!this.statusMessage) this.loading = false; 
      }))
      .subscribe({
        next: (result) => (this.testResult = result),
        error: (err) => {
          console.error('❌ Error fetching test result:', err);
          this.errorMessage = 'Failed to load test result.';
        },
      });
  }

  copyScript(): void {
    const script = this.testResult?.script;
    if (!script) return;
    try {
      navigator.clipboard.writeText(script).then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      });
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  handleRerun(): void {
    const url = this.testResult?.websiteUrl;
    if (!url) return;

    this.loading = true;
    this.errorMessage = '';
    this.statusMessage = 'Initializing Re-run...';
    this.currentStepIndex = 0; 

    this.testService.startTest({ url }).subscribe({
      next: (testId) => {
        this.testService.getTestStream(testId).subscribe({
          next: (event) => {
            if (event.type === 'PROGRESS') {
              this.statusMessage = event.message || 'Processing...';
              this.updateActiveStep(this.statusMessage);
            } else if (event.type === 'COMPLETED' && event.data) {
              this.testResult = event.data;
              this.loading = false;
              this.statusMessage = ''; 
              this.currentStepIndex = this.steps.length; 
            }
          },
          error: (err) => {
            console.error('❌ Stream error:', err);
            this.errorMessage = 'Re-run failed: ' + err;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error starting re-run:', err);
        this.errorMessage = 'Failed to trigger re-run.';
        this.loading = false;
      }
    });
  }

  /** ✅ UPDATED: Trigger Native Print Dialog (Save as PDF) */
  handleDownload(): void {
    window.print();
  }

  private updateActiveStep(message: string) {
    const foundIndex = this.steps.findIndex(step => message.includes(step.keyword));
    if (foundIndex !== -1) {
      if (foundIndex > this.currentStepIndex) {
        this.currentStepIndex = foundIndex;
      }
    }
  }
}