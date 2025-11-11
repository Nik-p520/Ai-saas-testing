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
        borderColor: '#c8a57a', // warm gold line
        backgroundColor: 'rgba(200, 165, 122, 0.15)', // soft fill under curve
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#e2c39b', // lighter point
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#f5e6d3',
        tension: 0.4,
      },
    ],
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    hover: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#2b1d1f', // dark tooltip
        borderColor: '#8b5e3c',
        borderWidth: 1,
        cornerRadius: 8,
        titleColor: '#f5e6d3',
        bodyColor: '#f5e6d3',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#f5e6d3',
          font: { size: 12, family: 'Poppins' },
        },
        grid: {
          display: true,
          drawTicks: false,
          color: 'rgba(245, 230, 211, 0.1)', // faint gridlines
        },
      },
      y: {
        ticks: {
          color: '#f5e6d3',
          font: { size: 12, family: 'Poppins' },
        },
        grid: {
          display: true,
          drawTicks: false,
          color: 'rgba(245, 230, 211, 0.1)',
        },
      },
    },
  };

  ngOnInit(): void {
    // Optional: dynamically adjust with CSS vars if you add them later
  }
}
