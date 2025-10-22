import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tests.html',
})
export class Tests{
  websiteUrl: string = '';
  username: string = '';
  password: string = '';
  isTestingInProgress: boolean = false;
  websiteUrlTouched: boolean = false; // track if input was touched

  handleTest() {
    this.websiteUrlTouched = true;

    if (!this.websiteUrl || this.websiteUrl.trim() === '') {
      return; // show red required error instead of alert
    }

    this.isTestingInProgress = true;

    // Simulate test execution
    setTimeout(() => {
      alert(`Test started for ${this.websiteUrl}` +
        (this.username ? ` with username "${this.username}"` : '') +
        (this.password ? ` and password provided` : '')
      );
      console.log('Testing URL:', this.websiteUrl, this.username, this.password);
      this.isTestingInProgress = false;
    }, 1000);
  }
}
