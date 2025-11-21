import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-test-trends-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './test-trends-chart.html',
})
export class TestTrendsChartComponent implements AfterViewInit {
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() noData: boolean = false;
  
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private _trends: { day: string; count: number }[] = [];
  private chartReady = false;
  private pendingUpdate = false;

  @Input() set trends(value: { day: string; count: number }[]) {
    this._trends = value || [];
    if (this.chartReady) {
      this.updateChartData();
    } else {
      this.pendingUpdate = true;
    }
  }

  get trends() {
    return this._trends;
  }

  lineChartLabels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  lineChartData: ChartData<'line'> = {
    labels: this.lineChartLabels,
    datasets: [
      {
        data: [],
        label: 'Tests',
        borderColor: '#c8a57a',
        backgroundColor: 'rgba(200, 165, 122, 0.15)',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#e2c39b',
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#f5e6d3',
        tension: 0.4,
      },
    ],
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  ngAfterViewInit() {
    this.chartReady = true;
    if (this.pendingUpdate) {
      this.updateChartData();
      this.pendingUpdate = false;
    }
  }

  /** Update chart data safely */
  public updateChartData() {
    if (!this.chart) return;

    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = dayOrder.map(
      day => this._trends.find(t => t.day === day)?.count || 0
    );

    this.lineChartData.datasets[0].data = counts;
    this.chart.update();
    this.pendingUpdate = false;
  }
}
