import { FlaskConical, Timer, CheckCircle2, TrendingUp, XCircle, Clock, } from 'lucide-angular';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCardComponent } from './components/stat-card/stat-card';
import { TestDistributionChart } from './components/test-distribution-chart/test-distribution-chart';
import { TestHistoryTableComponent } from './components/test-history-chart/test-history-chart';
import { TestTrendsChartComponent } from './components/test-trends-chart/test-trends-chart'



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatCardComponent, TestDistributionChart, TestHistoryTableComponent, TestTrendsChartComponent ],

  templateUrl: './home.html',
})
export class DashboardComponent {
 
  statCards = [
    {
      title: 'Total Tests',
      value: '158',
      icon: FlaskConical,
      trend: '+12% from last week',
      trendUp: true,
    },
    {
      title: 'Avg Test Time',
      value: '2.1s',
      icon: Timer,
      trend: '-0.3s faster',
      trendUp: true,
    },
    {
      title: 'Success Rate',
      value: '80.4%',
      icon: CheckCircle2,
      trend: '+2.1% improvement',
      trendUp: true,
    },
    {
      title: 'Active Tests',
      value: '8',
      icon: TrendingUp,
      trend: 'Currently running',
      trendUp: true,
    },
  ];
}

