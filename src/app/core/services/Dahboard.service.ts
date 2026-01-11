import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private BASE_URL = `${environment.springApi}/api/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/stats`);
  }

  getComparisonData(): Observable<any> {
    // The backend returns a Map<String, String>, which Angular treats as 'any' or a Record<string, string>
    return this.http.get(`${this.BASE_URL}/comparisons`);
  }

  getTrends(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/trends`);
  }

  getDistribution(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/distribution`);
  }
}

