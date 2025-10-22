import { Component, Input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule,LucideAngularModule],
  templateUrl: './stat-card.html',
})
export class StatCardComponent {
  @Input() title!: string;
  @Input() value!: string | number;
  @Input() icon!: LucideIconData;
  @Input() trend?: string;
  @Input() trendUp?: boolean;
}

