import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle2, XCircle, Clock } from 'lucide-angular';

interface TestResult {
  id: string;
  url: string;
  status: 'passed' | 'failed' | 'running';
  duration: string;
  timestamp: string;
}

@Component({
  selector: 'app-test-history-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './test-history-chart.html',
})
export class TestHistoryTableComponent {
  // ✅ Make filter an Input
  @Input() filter: string = '';

  mockTests: TestResult[] = [
    { id: '1', url: 'https://example.com', status: 'passed', duration: '2.3s', timestamp: '2 mins ago' },
    { id: '2', url: 'https://test-site.com', status: 'passed', duration: '1.8s', timestamp: '15 mins ago' },
    { id: '3', url: 'https://demo.app', status: 'failed', duration: '3.1s', timestamp: '1 hour ago' },
    { id: '4', url: 'https://staging.web', status: 'running', duration: '-', timestamp: 'Just now' },
    { id: '5', url: 'https://prod.site', status: 'passed', duration: '2.1s', timestamp: '3 hours ago' },
  ];

  // Icons for template
  CheckCircle2 = CheckCircle2;
  XCircle = XCircle;
  Clock = Clock;
}
