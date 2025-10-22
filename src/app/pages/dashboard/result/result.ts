import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  RotateCw,
  Download,
  AlertCircle,
  Bug,
  Terminal,
  Lightbulb,
  CheckCircle2,
  Camera,
  Code,
  Copy,
} from 'lucide-angular';

interface BugItem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
}

interface TestResult {
  id: string;
  websiteUrl: string;
  executionTime: Date;
  duration: string;
  browser: string;
  status: 'passed' | 'failed' | 'processing';
  logs: string[];
  screenshots: { url: string; caption: string }[];
  script: string;
  bugs: BugItem[];
  recommendations: Recommendation[];
}

@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './result.html',
})
export class ResultPageComponent {
  // Icons
  RotateCw = RotateCw;
  Download = Download;
  AlertCircle = AlertCircle;
  Bug = Bug;
  Terminal = Terminal;
  Lightbulb = Lightbulb;
  CheckCircle2 = CheckCircle2;
  Camera = Camera;
  Code = Code;
  Copy = Copy;

  copied = false;
  isLoading = false;

  testResult: TestResult = this.getMockTestResult();

  getMockTestResult(): TestResult {
    return {
      id: 'AI-TEST-001',
      websiteUrl: 'https://example.com',
      executionTime: new Date(),
      duration: '22.8s',
      browser: 'Chromium 120.0',
      status: 'passed',
      logs: [
        '[10:12:01] Starting AI test runner...',
        '[10:12:03] Opening https://example.com/login',
        '[10:12:05] Filling login form...',
        '[10:12:06] Submitting credentials...',
        '[10:12:08] ✅ User redirected to dashboard',
        '[10:12:09] Capturing screenshot...',
        '[10:12:10] ✓ Test completed successfully',
      ],
      screenshots: [
  {
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    caption: 'Home Page',
  },
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    caption: 'Signup Form',
  },
],

      script: `
import { test, expect } from '@playwright/test';

test('Verify login functionality', async ({ page }) => {
  await page.goto('https://example.com/login');
  await expect(page).toHaveTitle(/Login/);
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('https://example.com/dashboard');
});
      `.trim(),
      bugs: [
        {
          id: 'bug-1',
          title: 'Footer overlap on mobile',
          description: 'The footer overlaps the login button on small screens.',
          severity: 'medium',
        },
        {
          id: 'bug-2',
          title: 'Unresponsive header',
          description:
            'Header menu does not collapse correctly on small screens.',
          severity: 'high',
        },
      ],
      recommendations: [
        {
          id: 'rec-1',
          title: 'Add lazy loading for images',
          description:
            'Use loading="lazy" for offscreen images to improve performance.',
          impact: 'high',
          category: 'Performance',
        },
        {
          id: 'rec-2',
          title: 'Improve error handling',
          description:
            'Add user-friendly messages for failed form submissions.',
          impact: 'medium',
          category: 'UX',
        },
      ],
    };
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  copyScript() {
    navigator.clipboard.writeText(this.testResult.script).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }

  handleRerun() {
    this.isLoading = true;
    this.testResult.status = 'processing';
    setTimeout(() => {
      this.isLoading = false;
      this.testResult.status = 'passed';
    }, 3000);
  }

  handleDownload() {
    alert('Downloading report (demo mode)...');
  }
}
