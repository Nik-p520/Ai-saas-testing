import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestHistoryTableComponent } from '../home/components/test-history-chart/test-history-chart';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, TestHistoryTableComponent],
  templateUrl: './history.html',
})
export class History {
  searchQuery: string = '';
}
