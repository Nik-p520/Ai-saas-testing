import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private BASE_URL = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/stats`);
  }

  getComparisonData(): Observable<any> {
    // The backend returns a Map<String, String>, which Angular treats as 'any' or a Record<string, string>
    return this.http.get(`${this.BASE_URL}/comparison`);
  }

  getTrends(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/trends`);
  }

  getDistribution(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/distribution`);
  }
}

