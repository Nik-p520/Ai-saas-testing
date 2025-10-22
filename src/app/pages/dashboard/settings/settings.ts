import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './settings.html',
})
export class Settings {
  // Form fields
  apiKey: string = '';
  autoRunTests: boolean = false;
  emailNotifications: boolean = false;
  screenshotOnFailure: boolean = true;

  saveApiKey() {
    console.log('API Key saved:', this.apiKey);
  }
}

