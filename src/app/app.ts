import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [FormsModule],
  templateUrl: './app.html',
})
export class AppComponent {
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
