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
import { Subscription } from 'rxjs';

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

  // -----------------------
  // UI State
  // -----------------------
  statCards: any[] = [];
  trends: { day: string; count: number }[] = [];
  distribution: { status: string; count: number }[] = [];

  // Loading / error / no-data
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

  // -----------------------
  // Chart References
  // -----------------------
  @ViewChild(TestTrendsChartComponent) trendsChart!: TestTrendsChartComponent;
  @ViewChild(TestDistributionChart) distributionChart!: TestDistributionChart;

  constructor(
    private dashboardService: DashboardService,
    private ws: DashboardWebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadTrends();
    this.loadDistribution();
    this.listenWebSocket();
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  // -----------------------
  // WebSocket Live Updates
  // -----------------------
  private listenWebSocket(): void {

    // Stats live updates
    this.subs.push(
      this.ws.stats$.subscribe(stats => {
        
        if (stats) {
          this.updateStatsUI(stats);
          this.errorStats = null;
          this.cdr.detectChanges();
        }
      })
    );

    // Trends live updates
    this.subs.push(
      this.ws.trends$.subscribe(data => {
        
        if (data && data.length > 0) {
          this.trends = [...data];
          if (this.trendsChart) this.trendsChart.trends = [...data];
          this.errorTrends = null;
          this.noDataTrends = false;
          this.cdr.markForCheck();
        }
      })
    );

    // Distribution live updates
    this.subs.push(
      this.ws.distribution$.subscribe(data => {
        
        if (data && data.length > 0) {
          this.distribution = [...data];
          if (this.distributionChart) this.distributionChart.distribution = [...data];
          this.errorDistribution = null;
          this.noDataDistribution = false;
          this.cdr.markForCheck();
        }
      })
    );
  }

  // -----------------------
  // REST API Load
  // -----------------------

  private loadStats(): void {
  this.loadingStats = true;
  this.errorStats = null;
  this.statCards = []; // Clear old cards while loading

  this.dashboardService.getStats().subscribe({
    next: (stats) => {
      this.loadingStats = false;

      if (!stats || Object.keys(stats).length === 0) {
        this.errorStats = 'No stats available';
      } else {
        this.errorStats = null;
        this.updateStatsUI(stats);
      }

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Stats API Error:', err);
      this.loadingStats = false;
      this.errorStats = 'Failed to load stats';
      this.statCards = [];
      this.cdr.detectChanges();
    },
  });
}

  private loadTrends(): void {
    this.loadingTrends = true;
    this.errorTrends = null;
    this.noDataTrends = false;

    this.dashboardService.getTrends().subscribe({
      next: res => {
        if (!res || res.length === 0) {
          this.noDataTrends = true;
        } else {
          this.trends = [...res];
          if (this.trendsChart) this.trendsChart.trends = [...res];
        }

        this.loadingTrends = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Trends API Error:', err);
        this.errorTrends = 'Failed to load trends.';
        this.loadingTrends = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadDistribution(): void {
    this.loadingDistribution = true;
    this.errorDistribution = null;
    this.noDataDistribution = false;

    this.dashboardService.getDistribution().subscribe({
      next: res => {
        if (!res || res.length === 0) {
          this.noDataDistribution = true;
        } else {
          this.distribution = [...res];
          if (this.distributionChart) this.distributionChart.distribution = [...res];
        }

        this.loadingDistribution = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Distribution API Error:', err);
        this.errorDistribution = 'Failed to load distribution.';
        this.loadingDistribution = false;
        this.cdr.detectChanges();
      },
    });
  }

  // -----------------------
  // Stats UI Update
  // -----------------------
  private updateStatsUI(stats: any): void {
    const cards = [
      { title: 'Total Tests', value: stats.totalTests, icon: FlaskConical, trend: '+12% from last week', trendUp: true },
      { title: 'Avg Test Time', value: stats.averageTestTime?.toFixed(1) + 's', icon: Timer, trend: '-0.3s faster', trendUp: true },
      { title: 'Success Rate', value: stats.successRate?.toFixed(1) + '%', icon: CheckCircle2, trend: '+2.1% improvement', trendUp: true },
      { title: 'Active Tests', value: stats.activeTests, icon: TrendingUp, trend: 'Currently running', trendUp: true },
    ];
    this.statCards = [...cards];
  }
}
