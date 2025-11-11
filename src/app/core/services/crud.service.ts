import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface BugItem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
}

export interface TestResult {
  id: string;
  websiteUrl: string;
  executionTime: string;
  duration: string;
  browser: string;
  status: 'passed' | 'failed' | 'processing';
  logs: string[];
  screenshots: { url: string; caption: string }[];
  script: string;
  bugs: BugItem[];
  recommendations: Recommendation[];
}

@Injectable({ providedIn: 'root' })
export class TestService {
  private baseUrl = 'http://localhost:8080/api/test';

  constructor(private http: HttpClient) {}

  /** Fetch all test results */
  getAllResults(): Observable<TestResult[]> {
    return this.http.get<TestResult[]>(`${this.baseUrl}/results`);
  }

  /** Fetch single test by ID */
  getTestById(id: string): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.baseUrl}/result/${id}`);
  }

  /** Trigger a new test */
  generateTest(url: string): Observable<TestResult> {
    return this.http.post<TestResult>(`${this.baseUrl}/generate`, { url });
  }

  deleteResult(id: string): Observable<TestResult> {
    // ✅ user confirmed — proceed with backend API call
    const url = `${this.baseUrl}/delete/${id}`;
    return this.http.delete<TestResult>(url);
  }

}
