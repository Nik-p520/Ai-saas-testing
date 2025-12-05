import {
  FlaskConical,
  Timer,
  CheckCircle2,
  TrendingUp
} from 'lucide-angular';

import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from './components/stat-card/stat-card';
import { TestDistributionChart } from './components/test-distribution-chart/test-distribution-chart';
import { TestHistoryTableComponent } from './components/test-history-chart/test-history-chart';
import { TestTrendsChartComponent } from './components/test-trends-chart/test-trends-chart';

import { DashboardService } from '../../../core/services/Dahboard.service';
import { DashboardWebSocketService } from '../../../core/services/dashboard-websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription, forkJoin, of, timer } from 'rxjs'; 
import { catchError, filter, take, retry, delay, switchMap } from 'rxjs/operators'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    TestDistributionChart,
    TestHistoryTableComponent,
    TestTrendsChartComponent
  ],
  templateUrl: './home.html',
})
export class DashboardComponent implements OnInit, OnDestroy {

  userName: string = 'User';
  statCards: any[] = [];
  trends: { day: string; count: number }[] = [];
  distribution: { status: string; count: number }[] = [];

  private currentStats: any = {};
  private comparisonData: Record<string, string> = {}; 

  // ✅ ADDED: Missing loading properties
  loadingUser = true;      // For the "Hello User" header
  loadingHistory = true;   // For the Table
  
  loadingStats = false;
  loadingTrends = false;
  loadingDistribution = false;

  errorStats: string | null = null;
  errorTrends: string | null = null;
  errorDistribution: string | null = null;

  noDataStats = false;
  noDataTrends = false;
  noDataDistribution = false;

  private subs: Subscription[] = [];

  @ViewChild(TestTrendsChartComponent) trendsChart!: TestTrendsChartComponent;
  @ViewChild(TestDistributionChart) distributionChart!: TestDistributionChart;

  constructor(
    private dashboardService: DashboardService,
    private ws: DashboardWebSocketService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadingUser = true; // Start loading user
    this.loadingStats = true;
    this.loadingTrends = true;
    this.loadingDistribution = true;
    this.loadingHistory = true; // Start loading table

    // 🛑 STEP 1: Wait for User + Add Small Delay
    this.authService.user$.pipe(
      filter(user => !!user),
      take(1),
      delay(500) 
    ).subscribe(async user => {
      if (user) {
        const fullName = user.displayName || user.email?.split('@')[0] || 'User';
        this.userName = fullName.split(' ')[0];
        
        // ✅ STOP LOADING USER (Skeleton disappears)
        this.loadingUser = false; 
        this.cdr.detectChanges();

        try {
            await user.getIdToken(true); 
            console.log("✅ Token Fresh & Ready. Fetching Data...");
            this.loadInitialData();
            this.listenWebSocket();
        } catch (e) {
            console.error("Token Refresh Failed", e);
            this.loadingUser = false; // Ensure loading stops even on error
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  private listenWebSocket(): void {
    this.subs.push(
      this.ws.stats$.subscribe(stats => {
        if (stats) { this.currentStats = stats; this.renderStatsCards(); }
      })
    );
    this.subs.push(
      this.ws.comparison$.subscribe(comps => {
        if (comps) { this.comparisonData = comps; this.renderStatsCards(); }
      })
    );
    this.subs.push(
      this.ws.trends$.subscribe(data => {
        if (data && data.length > 0) {
          this.trends = [...data];
          if (this.trendsChart) this.trendsChart.trends = [...data];
          this.cdr.detectChanges();
        }
      })
    );
    this.subs.push(
      this.ws.distribution$.subscribe(data => {
        if (data && data.length > 0) {
          this.distribution = [...data];
          if (this.distributionChart) this.distributionChart.distribution = [...data];
          this.cdr.detectChanges();
        }
      })
    );
  }

  // -----------------------
  // REST API Load (Robust Retry Logic)
  // -----------------------
  private loadInitialData(): void {
    this.errorStats = null;
    this.errorTrends = null;
    this.errorDistribution = null;

    console.log("🚀 Starting Data Fetch with Auto-Retry...");

    this.subs.push(
      forkJoin({
        stats: this.dashboardService.getStats().pipe(
            retry({ count: 3, delay: 1000 }), 
            catchError(err => { console.error('Stats Failed', err); return of({}); })
        ),
        comparison: this.dashboardService.getComparisonData().pipe(
            retry({ count: 3, delay: 1000 }),
            catchError(err => { console.error('Comp Failed', err); return of({}); })
        ),
        trends: this.dashboardService.getTrends().pipe(
            retry({ count: 3, delay: 1000 }),
            catchError(err => { console.error('Trends Failed', err); return of([]); })
        ),
        distribution: this.dashboardService.getDistribution().pipe(
            retry({ count: 3, delay: 1000 }),
            catchError(err => { console.error('Dist Failed', err); return of([]); })
        )
      }).subscribe({
        next: (results) => {
          console.log("✅ Data Loaded Successfully:", results);

          // 1. Stats
          this.currentStats = results.stats;
          this.comparisonData = results.comparison;
          this.renderStatsCards();
          this.loadingStats = false;

          // 2. Trends
          if (!results.trends || results.trends.length === 0) {
            this.noDataTrends = true;
            this.trends = [];
          } else {
            this.noDataTrends = false;
            this.trends = results.trends.map((t: any) => ({
                day: t.day || t.date || t.label || '', 
                count: t.count || t.value || 0
            }));
          }
          this.loadingTrends = false;

          // 3. Distribution
          if (!results.distribution || results.distribution.length === 0) {
            this.noDataDistribution = true;
            this.distribution = [];
          } else {
            this.noDataDistribution = false;
            this.distribution = results.distribution.map((d: any) => ({
                status: d.status || d.name || 'Unknown',
                count: d.count || d.value || 0
            }));
          }
          this.loadingDistribution = false;

          // 4. History (Table)
          // Since we don't have a separate API call here for history, 
          // we assume the table component manages itself or we stop loading here.
          this.loadingHistory = false; 

          // 5. Force UI Render
          this.cdr.detectChanges();

          // 6. Final Push for Charts
          setTimeout(() => {
             if (this.trendsChart) this.trendsChart.trends = [...this.trends];
             if (this.distributionChart) this.distributionChart.distribution = [...this.distribution];
             this.cdr.detectChanges();
          }, 100);
        },
        error: (err) => {
          console.error("❌ Final Load Error:", err);
          this.loadingStats = false;
          this.loadingTrends = false;
          this.loadingDistribution = false;
          this.loadingHistory = false; // Stop loading on error
          this.cdr.detectChanges();
        }
      })
    );
  }

  private isTrendUp(trendValue: string | undefined): boolean {
      return trendValue ? trendValue.startsWith('+') || trendValue.includes('faster') : false;
  }
  private isTrendDown(trendValue: string | undefined): boolean {
      return trendValue ? trendValue.startsWith('-') || trendValue.includes('slower') || trendValue.includes('worse') : false;
  }
  private renderStatsCards(): void {
    const stats = this.currentStats;
    const comps = this.comparisonData; 
    if (!stats || Object.keys(stats).length === 0) { this.statCards = []; return; }
    
    const successTrend = comps['successRate'] || 'N/A';
    const totalTestsTrend = comps['totalTests'] || 'N/A';
    const avgTimeTrend = comps['averageTime'] || 'N/A';
    const rawSuccessRate = stats.successRate;
    let successRateValue = rawSuccessRate !== null && rawSuccessRate !== undefined 
        ? Number(String(rawSuccessRate).replace(/[^0-9.]/g, '')).toFixed(1) + '%' 
        : 'N/A';

    this.statCards = [
        { title: 'Total Tests', value: String(stats.totalTests), icon: FlaskConical, trend: totalTestsTrend, trendUp: this.isTrendUp(totalTestsTrend), trendDown: this.isTrendDown(totalTestsTrend) },
        { title: 'Avg Test Time', value: stats.averageTime?.toFixed(1) + 's', icon: Timer, trend: avgTimeTrend, trendUp: this.isTrendUp(avgTimeTrend), trendDown: this.isTrendDown(avgTimeTrend) },
        { title: 'Success Rate', value: successRateValue, icon: CheckCircle2, trend: successTrend, trendUp: this.isTrendUp(successTrend), trendDown: this.isTrendDown(successTrend) },
        { title: 'Active Tests', value: stats.activeTests, icon: TrendingUp, trend: 'Currently running', trendUp: true, trendDown: false },
    ];
    this.cdr.detectChanges(); 
  }
}