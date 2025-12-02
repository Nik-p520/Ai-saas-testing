import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, LucideIconData, FlaskConical } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stat-card.html',
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number | null = null;
  @Input() icon: LucideIconData = FlaskConical;
  @Input() trend?: string;
  @Input() trendUp?: boolean;
  // 🔥 NEW INPUT: Property to control red color for negative trends
  @Input() trendDown?: boolean; 
  @Input() error: string | null = null;
  @Input() loading: boolean = false;

  // Expose FlaskConical to the template
  readonly defaultIcon: LucideIconData = FlaskConical;
}