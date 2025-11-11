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
  copied = false;

  constructor(
    private testService: TestService,
    private route: ActivatedRoute // ✅ get ID from URL
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // ✅ fetch id from /result/:id
    if (id) {
      this.loadResult(id);
    } else {
      this.errorMessage = 'Invalid Test ID. Please try again.';
    }
  }

  /** ✅ Load result by ID */
  loadResult(id: string): void {
    this.loading = true;
    this.testService
      .getTestById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (result) => (this.testResult = result),
        error: (err) => {
          console.error('❌ Error fetching test result:', err);
          this.errorMessage = 'Failed to load test result.';
        },
      });
  }

  /** ✅ Copy test script */
  copyScript(): void {
    const script = this.testResult?.script;
    if (!script) return;

    navigator.clipboard.writeText(script).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  /** ✅ Re-run the same test */
  handleRerun(): void {
    const url = this.testResult?.websiteUrl;
    if (!url) return;

    this.loading = true;
    this.testService
      .generateTest(url)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (newResult) => (this.testResult = newResult),
        error: (err) => {
          console.error('❌ Error re-running test:', err);
          this.errorMessage = 'Failed to re-run test.';
        },
      });
  }

  /** ✅ Download JSON report */
  handleDownload(): void {
    const result = this.testResult;
    if (!result) return;

    const data = JSON.stringify(result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `test-result-${result.id ?? 'report'}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
}
