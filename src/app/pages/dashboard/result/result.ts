import { Component, OnInit, HostListener } from '@angular/core';
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
  
  // ✅ STATE SEPARATION
  loading = false; // Controls the Stepper (Re-run)
  fetching = false; // Controls Simple Spinner (History Load)
  
  errorMessage = '';
  statusMessage = ''; 
  copied = false;

  // Modal State
  selectedImage: any = null;
  isZoomed = false;
  zoomOrigin = 'center center';

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
    if (id) this.loadResult(id);
    else this.errorMessage = 'Invalid Test ID.';
  }

  loadResult(id: string): void {
    // ✅ FIX: Use 'fetching' instead of 'loading'
    this.fetching = true; 
    
    this.testService.getTestById(id)
      .pipe(finalize(() => { 
        this.fetching = false; 
      }))
      .subscribe({
        next: (result) => (this.testResult = result),
        error: (err) => { 
          console.error(err); 
          this.errorMessage = 'Failed to load test result.'; 
        },
      });
  }

  // ... (Keep Toggle/Zoom Logic same as before) ...
  toggleZoom(event: MouseEvent) {
    event.stopPropagation();
    if (this.isZoomed) { this.isZoomed = false; this.zoomOrigin = 'center center'; } 
    else { this.updateZoomPosition(event); this.isZoomed = true; }
  }

  onMouseMove(event: MouseEvent) { if (this.isZoomed) this.updateZoomPosition(event); }

  private updateZoomPosition(event: MouseEvent) {
    const element = event.target as HTMLElement;
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.zoomOrigin = `${x}% ${y}%`;
  }

  openImageModal(shot: any): void {
    this.selectedImage = shot;
    this.isZoomed = false;
    this.zoomOrigin = 'center center';
    document.body.style.overflow = 'hidden'; 
  }

  closeImageModal(): void {
    this.selectedImage = null;
    this.isZoomed = false;
    document.body.style.overflow = ''; 
  }

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler(event: any): void {
    if (this.selectedImage) this.closeImageModal();
  }

  copyScript(): void {
    const script = this.testResult?.script;
    if (!script) return;
    try {
      navigator.clipboard.writeText(script).then(() => {
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      });
    } catch (err) { console.error(err); }
  }

  handleRerun(): void {
    const url = this.testResult?.websiteUrl;
    if (!url) return;

    // ✅ FIX: Only use 'loading' for Re-runs
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
            this.errorMessage = 'Re-run failed: ' + err;
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = 'Failed to trigger re-run.';
        this.loading = false;
      }
    });
  }

  handleDownload(): void { window.print(); }

  private updateActiveStep(message: string) {
    const foundIndex = this.steps.findIndex(step => message.includes(step.keyword));
    if (foundIndex !== -1 && foundIndex > this.currentStepIndex) {
      this.currentStepIndex = foundIndex;
    }
  }
}