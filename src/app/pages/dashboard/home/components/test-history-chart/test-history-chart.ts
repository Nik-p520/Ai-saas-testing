import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, XCircle, Clock } from 'lucide-angular';
import { Router, ActivatedRoute } from '@angular/router';
import { TestService, TestResult } from '../../../../../core/services/crud.service';

@Component({
  selector: 'app-test-history-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './test-history-chart.html',
})
export class TestHistoryTableComponent implements OnInit, OnChanges {
  @Input() filter: string = '';
  @Input() limit: number | null = null; // 👈 NEW (limit results if provided)
  @Input() showViewAllButton: boolean = false; // 👈 For dashboard “View All” button
  @Input() fullHeight: boolean = false;
  
  testResults: TestResult[] = [];
  filteredResults: TestResult[] = [];
  loading = false;
  errorMessage = '';

  // ✅ Icons
  CheckCircle2 = CheckCircle2;
  XCircle = XCircle;
  Clock = Clock;

  constructor(
    private testService: TestService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  showDeleteConfirm = false;
  selectedTestId: string | null = null;

  ngOnInit(): void {
    this.loadAllResults();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filter'] && this.testResults.length > 0) {
      this.applyFilter();
    }
  }

  /** 🔹 Fetch all test results */
  loadAllResults(): void {
    this.loading = true;
    this.testService.getAllResults().subscribe({
      next: (data) => {
        console.log('✅ All test history loaded:', data);

        this.testResults = (data || []).sort((a, b) => {
          const timeA = new Date(a.executionTime || 0).getTime();
          const timeB = new Date(b.executionTime || 0).getTime();
          return timeB - timeA; // 👈 newest first
        });
        
        this.applyFilter(true);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching test history:', err);
        this.errorMessage = 'Failed to load test history.';
        this.loading = false;
      },
    });
  }

  /** 🔍 Apply search filter */
  applyFilter(initial = false): void {
    const query = this.filter?.toLowerCase().trim();
    let results = this.testResults;

    if (!initial && query) {
      results = results.filter(
        (item) =>
          item.websiteUrl?.toLowerCase().includes(query) ||
          item.status?.toLowerCase().includes(query)
      );
    }

    // 👇 Apply limit if given (dashboard)
    this.filteredResults = this.limit ? results.slice(0, this.limit) : results;
  }

  /** 🖱️ When user clicks test row */
  onTestClick(test: TestResult): void {
    if (test?.id) {
      console.log('Navigating to result page for:', test.id);
      this.router.navigate(['/dashboard/result', test.id]);
    } else {
      alert('No test ID found for navigation.');
    }
  }

  confirmDelete(test: TestResult): void {
  this.selectedTestId = test.id;
  this.showDeleteConfirm = true;
}

 deleteConfirmed(): void {
  if (!this.selectedTestId) return;

  this.testService.deleteResult(this.selectedTestId).subscribe({
    next: () => {
      this.testResults = this.testResults.filter((t) => t.id !== this.selectedTestId);
      this.applyFilter();
      this.showDeleteConfirm = false;
      this.selectedTestId = null;
    },
    error: (err: any) => {
      console.error('Delete failed:', err);
      this.showDeleteConfirm = false;
      alert('Failed to delete test.');
    },
  });
}

cancelDelete(): void {
  this.showDeleteConfirm = false;
  this.selectedTestId = null;
}


  /** 🌐 View All button → Go to history page */
  goToHistory(): void {
    this.router.navigate(['/dashboard/history']);
  }
}
