import { Component, OnInit, HostListener, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
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
export class ResultPageComponent implements OnInit, AfterViewInit, OnDestroy {
  testResult: TestResult | null = null;
  
  // State variables
  loading = false; // Controls the Stepper (Re-run)
  fetching = false; // Controls Simple Spinner (History Load)
  
  errorMessage = '';
  statusMessage = ''; 
  copied = false;

  // Modal State
  selectedImage: any = null;
  isZoomed = false;
  zoomOrigin = 'center center';

  // ✅ ANIMATION STATE
  animatedScore = 0; // Starts at 0, animates to real score
  private observer: IntersectionObserver | null = null;

  // ✅ REFERENCE TO METER ELEMENT
  @ViewChild('scoreMeter') scoreMeter!: ElementRef;

  // Circle Gauge Config
  readonly circleRadius = 45;
  readonly circleCircumference = 2 * Math.PI * this.circleRadius;

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

  // ✅ SETUP OBSERVER
  ngAfterViewInit() {
    this.setupIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  loadResult(id: string): void {
    this.fetching = true; 
    this.testService.getTestById(id)
      .pipe(finalize(() => { this.fetching = false; }))
      .subscribe({
        next: (result) => {
          this.testResult = result;
          // Re-attach observer since DOM changes after data load
          setTimeout(() => this.setupIntersectionObserver(), 100); 
        },
        error: (err) => { 
          console.error(err); 
          this.errorMessage = 'Failed to load test result.'; 
        },
      });
  }

  // ✅ INTERSECTION OBSERVER LOGIC
  private setupIntersectionObserver() {
    if (!this.scoreMeter || this.observer) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.testResult?.healthScore) {
          this.animateScore(this.testResult.healthScore);
          this.observer?.disconnect(); // Stop observing once triggered
        }
      });
    }, { threshold: 0.5 }); // Trigger when 50% visible

    this.observer.observe(this.scoreMeter.nativeElement);
  }

  // ✅ SMOOTH NUMBER ANIMATION (0 -> Target)
  private animateScore(target: number) {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        this.animatedScore = target;
        clearInterval(timer);
      } else {
        this.animatedScore = Math.round(current);
      }
    }, duration / steps);
  }

  // ✅ UPDATED: Use animatedScore instead of static score
  calculateStrokeDashOffset(): number {
    const progress = this.animatedScore / 100;
    return this.circleCircumference * (1 - progress);
  }

  // ==========================================================
  // ZOOM & MODAL LOGIC
  // ==========================================================

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
              // Trigger animation for new result
              setTimeout(() => {
                if (this.testResult?.healthScore) this.animateScore(this.testResult.healthScore);
              }, 500);
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