import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // ✅ throwError add kiya
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';


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
  private apiUrl = `${environment.springApi}/api/test`;

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
    return this.http.delete<void>(url).pipe(
      catchError(err => {
        // Agar pehle hi delete ho chuka hai (404), toh use error mat samjho
        if (err.status === 404) {
          console.warn("Item already deleted or not found.");
          return []; 
        }
        return throwError(() => err);
      })
    );
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
 // ... getAllResults, getTestById, deleteResult wahi rahenge

  getTestStream(testId: string): Observable<{ type: string; message?: string; data?: TestResult }> {
    return new Observable(observer => {
      const url = `${this.apiUrl}/stream/${testId}`;
      const eventSource = new EventSource(url);

      // 1. Progress Updates
      eventSource.addEventListener('PROGRESS', (event: any) => {
        this.zone.run(() => observer.next({ type: 'PROGRESS', message: event.data }));
      });

      // 2. Completion - Connection yahan close hona chahiye
      eventSource.addEventListener('COMPLETED', (event: any) => {
        this.zone.run(() => {
          try {
            const result = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            observer.next({ type: 'COMPLETED', data: result });
            eventSource.close(); // ✅ Success cleanup
            observer.complete();
          } catch (e) {
            console.error('Parse error:', e);
            eventSource.close();
            observer.error('Invalid result format');
          }
        });
      });

      // 3. Error Handling - 429 prevention
      eventSource.onerror = () => {
        this.zone.run(() => {
          console.log("Cleaning up zombie connection..."); //
          eventSource.close(); // ✅ Error cleanup
          observer.error('Connection lost');
        });
      };

      // 4. TEARDOWN: Jab frontend unsubscribe karega
      return () => {
        if (eventSource.readyState !== 2) { // 2 = CLOSED
          eventSource.close();
        }
      };
    });
  }

}