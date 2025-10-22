import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-test-distribution-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './test-distribution-chart.html',
  styleUrls: ['./test-distribution-chart.css']
})
export class TestDistributionChart implements OnInit {

  pieChartLabels: string[] = ['Passed', 'Failed', 'Running'];

  pieChartData: ChartData<'pie', number[], string> = {
    labels: this.pieChartLabels,
    datasets: [
      {
        data: [127, 23, 8],
        backgroundColor: [], // will set in ngOnInit
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 1
      },
    ],
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
  };

  ngOnInit(): void {
    // Read Tailwind CSS variables at runtime
    const getCssVar = (name: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    this.pieChartData.datasets[0].backgroundColor = [
      `hsl(${getCssVar('--success')})`, // Passed
      `hsl(${getCssVar('--error')})`,   // Failed
      `hsl(${getCssVar('--warning')})`, // Running
    ];
  }
}
