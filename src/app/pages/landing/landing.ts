import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class LandingComponent {
  websiteUrl: string = '';
  username: string = '';
  password: string = '';
  isMenuOpen: boolean = false;
  isTestingInProgress: boolean = false;

  handleTest() {
    if (!this.websiteUrl) {
      alert('Please enter a website URL');
      return;
    }

    this.isTestingInProgress = true;

    setTimeout(() => {
      this.isTestingInProgress = false;
      alert('Test completed! (Demo mode)');
    }, 2000);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
