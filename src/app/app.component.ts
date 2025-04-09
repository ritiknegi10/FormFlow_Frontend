import { Component, HostListener, ElementRef } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'form-flow';
  forms: any[] = [];
  isProfileMenuOpen = false;

  constructor(
    public authService: AuthService,
    private elementRef: ElementRef  // Add ElementRef injection here
  ) {
    this.loadForms();
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileMenuOpen = false;
    }
  }

  

  addForm(newForm: any) {
    this.forms.push(newForm); 
    this.saveForms(); 
  }

  saveForms() {
    localStorage.setItem('forms', JSON.stringify(this.forms));
  }

  loadForms() {
    const storedForms = localStorage.getItem('forms');
    if (storedForms) {
      this.forms = JSON.parse(storedForms);
    }
  }
}
