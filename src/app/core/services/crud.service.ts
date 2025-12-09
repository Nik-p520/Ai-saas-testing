import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces (Kept from your original file) ---
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
  healthScore?: number;
  script: string;
  bugs: BugItem[];
  recommendations: Recommendation[];
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  // Update this with your actual backend URL
  private apiUrl = 'http://localhost:8080/api/test'; 

  constructor(private http: HttpClient, private zone: NgZone) {}

  // ============================================================
  // 1. EXISTING METHODS (For Dashboard/Results Pages)
  // ============================================================

  /** Fetch all test results */
  getAllResults(): Observable<TestResult[]> {
    return this.http.get<TestResult[]>(`${this.apiUrl}/results`);
  }

  /** Fetch single test by ID */
  getTestById(id: string): Observable<TestResult> {
    return this.http.get<TestResult>(`${this.apiUrl}/result/${id}`);
  }

  /** Delete a result */
  deleteResult(id: string): Observable<void> {
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.delete<void>(url);
  }

  // ============================================================
  // 2. NEW STREAMING METHODS (For "Run Test" Page)
  // ============================================================

  /**
   * Step 1: Trigger the test and get the Test ID immediately.
   * Note: This replaces the old 'generateTest' which waited for the full result.
   */
  startTest(requestData: { url: string; testRequirements?: string; credentials?: any }): Observable<string> {
    // We expect a plain string response (the UUID)
    return this.http.post(`${this.apiUrl}/generate`, requestData, { 
      responseType: 'text' 
    });
  }

  /**
   * Step 2: Subscribe to the Live Stream using Server-Sent Events (SSE).
   * This listens for "PROGRESS", "COMPLETED", or "ERROR" events.
   */
  getTestStream(testId: string): Observable<{ type: string; message?: string; data?: TestResult }> {
    return new Observable(observer => {
      const url = `${this.apiUrl}/stream/${testId}`;
      const eventSource = new EventSource(url);

      // A. Listen for Progress Updates (Text messages)
      eventSource.addEventListener('PROGRESS', (event: any) => {
        this.zone.run(() => {
          observer.next({ type: 'PROGRESS', message: event.data });
        });
      });

      // B. Listen for Completion (Returns the full TestResult object)
      eventSource.addEventListener('COMPLETED', (event: any) => {
        this.zone.run(() => {
          const result: TestResult = JSON.parse(event.data);
          observer.next({ type: 'COMPLETED', data: result });
          observer.complete();
          eventSource.close();
        });
      });

      // C. Listen for Explicit Errors from Backend
      eventSource.addEventListener('ERROR', (event: any) => {
        this.zone.run(() => {
          observer.error(event.data);
          eventSource.close();
        });
      });

      // D. Handle Network Errors
      eventSource.onerror = (error) => {
        this.zone.run(() => {
          if (eventSource.readyState !== 0) {
            observer.error('Connection lost');
            eventSource.close();
          }
        });
      };

      // Cleanup when component unsubscribes
      return () => {
        eventSource.close();
      };
    });
  }
}