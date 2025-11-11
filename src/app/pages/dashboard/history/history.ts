import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestService, TestResult } from '../../../core/services/crud.service'; // ✅ Import service
import { TestHistoryTableComponent } from '../home/components/test-history-chart/test-history-chart';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TestHistoryTableComponent],
  templateUrl: './history.html',
})
export class History implements OnInit {
  searchQuery: string = '';
  testResults: TestResult[] = [];
  loading = false;
  errorMessage = '';

  constructor(private testService: TestService) {}

  ngOnInit(): void {
    this.loadAllResults();
  }

  /** ✅ Fetch all test results from backend */
  loadAllResults(): void {
    this.loading = true;
    this.testService.getAllResults().subscribe({
      next: (results) => {
        this.testResults = results;
        console.log('✅ All Test Results:', results);
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Failed to load results:', err);
        this.errorMessage = 'Failed to load test history.';
        this.loading = false;
      },
    });
  }

  /** 🔍 Optional search filter */
  get filteredResults(): TestResult[] {
    const query = this.searchQuery.toLowerCase();
    return this.testResults.filter(
      (r) =>
        r.websiteUrl.toLowerCase().includes(query) ||
        r.status.toLowerCase().includes(query)
    );
  }
}
