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
import { Subscription, forkJoin } from 'rxjs'; 

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

  private currentStats: any = {};
  private comparisonData: Record<string, string> = {}; 

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
    this.loadInitialData();
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
          this.currentStats = stats; 
          this.renderStatsCards();    
          this.errorStats = null;
        }
      })
    );
    
    // Comparison live updates
    this.subs.push(
      this.ws.comparison$.subscribe((comps: Record<string, string>) => {
        if (comps) {
          this.comparisonData = comps; 
          this.renderStatsCards();     
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
  // REST API Load (Initial Data)
  // -----------------------

  private loadInitialData(): void {
    this.loadingStats = true;
    this.errorStats = null;
    this.statCards = [];

    this.subs.push(
      forkJoin({
        stats: this.dashboardService.getStats(),
        comparison: this.dashboardService.getComparisonData() 
      }).subscribe({
        next: ({ stats, comparison }) => {
          this.loadingStats = false;
          
          this.currentStats = stats;
          this.comparisonData = comparison;
          
          if (!stats || Object.keys(stats).length === 0) {
            this.errorStats = 'No stats available';
          } else {
            this.errorStats = null;
            this.renderStatsCards(); 
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Initial Load API Error:', err);
          this.loadingStats = false;
          this.errorStats = 'Failed to load initial dashboard stats.';
          this.statCards = [];
          this.cdr.detectChanges();
        },
      })
    );
    
    this.loadTrends();
    this.loadDistribution();
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
  // Stats UI Update (Consolidated Renderer)
  // -----------------------
  private isTrendUp(trendValue: string | undefined): boolean {
    // Correctly identifies positive trends (faster is positive for time)
    return trendValue ? trendValue.startsWith('+') || trendValue.includes('faster') : false;
}

  // Inside DashboardComponent.ts -> renderStatsCards()

private renderStatsCards(): void {
    const stats = this.currentStats;
    const comps = this.comparisonData; 

    if (!stats || Object.keys(stats).length === 0) {
        this.statCards = [];
        return;
    }
    
    // Clean the successRate trend string
    const successTrendRaw = comps['successRate'] || 'N/A';
    const successTrend = successTrendRaw.replace(/\s?%\s?/g, '%').trim(); 

    // --- Defensive Cleanup for Success Rate Value ---
    const rawSuccessRate = stats.successRate;
    let successRateValue = '';
    
    if (rawSuccessRate !== null && rawSuccessRate !== undefined) {
        // 1. Convert to string and strip any existing % or non-numeric/non-dot characters
        const cleanRateString = String(rawSuccessRate).replace(/[^0-9.]/g, '');
        
        // 2. Convert back to number, format, and add the single desired '%'
        successRateValue = Number(cleanRateString).toFixed(1) + '%';
    } else {
        successRateValue = 'N/A';
    }
    // --- End Defensive Cleanup ---


    const cards = [
        { 
            title: 'Total Tests', 
            // Fix 1: Removed redundant '%' from Total Tests value (it's a count, not a percentage).
            value: String(stats.totalTests), 
            icon: FlaskConical, 
            trend: comps['totalTests'] || 'N/A', 
            trendUp: this.isTrendUp(comps['totalTests']) 
        },
        { 
            title: 'Avg Test Time', 
            // Fix 2: Correct DTO field name (assuming averageTestTime is correct) and remove space.
            value: stats.averageTime?.toFixed(1) + 's', 
            icon: Timer, 
            trend: comps['averageTime']?.replace(/\ss\sfaster/g, 's faster').trim() || 'N/A', 
            trendUp: this.isTrendUp(comps['averageTime']) 
        },
        { 
            title: 'Success Rate', 
            // 🔥 FINAL FIX: Use the defensively cleaned and formatted value
            value: successRateValue, 
            icon: CheckCircle2, 
            trend: successTrend, 
            trendUp: this.isTrendUp(successTrend) 
        },
        { 
            title: 'Active Tests', 
            value: stats.activeTests, 
            icon: TrendingUp, 
            trend: 'Currently running', 
            trendUp: true 
        },
    ];
    
    this.statCards = [...cards];
    this.cdr.detectChanges(); 
}
}