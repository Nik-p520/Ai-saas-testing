import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-test-distribution-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './test-distribution-chart.html',
  styleUrls: ['./test-distribution-chart.css'],
})
export class TestDistributionChart implements AfterViewInit {
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() noData: boolean = false;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  private _distribution: { status: string; count: number }[] = [];
  private chartReady = false;
  private pendingUpdate = false; // queue updates if chart not ready

  @Input() set distribution(value: { status: string; count: number }[]) {
    this._distribution = value || [];
    if (this.chartReady) {
      this.updateChartData();
    } else {
      this.pendingUpdate = true; // mark pending update
    }
  }

  get distribution() {
    return this._distribution;
  }

  pieChartLabels = ['Passed', 'Failed', 'Processing'];

  pieChartData: ChartData<'pie', number[], string> = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [],
        backgroundColor: [],    // will be set after init
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 1,
      },
    ],
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 12 } } },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  ngAfterViewInit(): void {
    this.chartReady = true;
    this.applyColors();
    if (this.pendingUpdate) {
      this.updateChartData();
      this.pendingUpdate = false;
    }
  }

  /** Apply CSS color variables */
  private applyColors() {
    const getCssVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    this.pieChartData.datasets[0].backgroundColor = [
      `hsl(${getCssVar('--success')})`, // Green
      `hsl(${getCssVar('--error')})`,   // Red
      `hsl(${getCssVar('--warning')})`, // Yellow
    ];
  }

  /** Update chart with current distribution data */
  public updateChartData() {
    if (!this.chart) return;

    const counts = this.pieChartLabels.map(label => {
      const match = this._distribution.find(d => d.status.toLowerCase() === label.toLowerCase());
      return match?.count ?? 0;
    });

    this.pieChartData.datasets[0].data = counts;
    this.chart.update();
  }
}
