import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-test-trends-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './test-trends-chart.html',
})
export class TestTrendsChartComponent implements OnInit {
  lineChartLabels: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  lineChartData: ChartData<'line'> = {
    labels: this.lineChartLabels,
    datasets: [
      {
        data: [12, 19, 15, 25, 22, 18, 16],
        label: 'Tests',
        borderColor: '',          // set in ngOnInit
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '', // set in ngOnInit
        pointHoverRadius: 6,
        tension: 0.4,
      },
    ],
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: {
      mode: 'index',       // show tooltip for all datasets at same x-value
      intersect: false,    // vertical hover line appears even if not exactly on point
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '', // set in ngOnInit
        borderColor: '',     // set in ngOnInit
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        ticks: { color: '', font: { size: 12 } },
        grid: { display: true, drawTicks: false, color: '' },
      },
      y: {
        ticks: { color: '', font: { size: 12 } },
        grid: { display: true, drawTicks: false, color: '' },
      },
    },
  };

ngOnInit(): void {
  const getCssVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const primary = `hsl(${getCssVar('--primary')})`;
  const foreground = `hsl(${getCssVar('--foreground')})`;
  const borderColor = `hsl(${getCssVar('--border')})`;
  const cardBg = `hsl(${getCssVar('--card')})`;
  const mutedForeground = `hsl(${getCssVar('--foreground')})`; // for tooltip text

  // Line & points
  this.lineChartData.datasets[0].borderColor = primary;
  this.lineChartData.datasets[0].pointBackgroundColor = primary;

  // Tooltip
  this.lineChartOptions.plugins!.tooltip!.backgroundColor = cardBg;
  this.lineChartOptions.plugins!.tooltip!.borderColor = borderColor;
  this.lineChartOptions.plugins!.tooltip!.titleColor = foreground;
  this.lineChartOptions.plugins!.tooltip!.bodyColor = foreground;

  // Axis ticks
  this.lineChartOptions.scales!['x']!.ticks!.color = foreground;
  this.lineChartOptions.scales!['y']!.ticks!.color = foreground;

  // Grid lines
  const gridColor = `${borderColor}33`; // 20% opacity
  this.lineChartOptions.scales!['x']!.grid!.color = gridColor;
  this.lineChartOptions.scales!['y']!.grid!.color = gridColor;
}

}
