import { Component, HostListener, ElementRef } from '@angular/core';
import { AuthService } from './services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'form-flow';
  forms: any[] = [];
  isProfileMenuOpen = false;
  formCreatorOrEditor: boolean = false;

  constructor(
    public authService: AuthService,
    private elementRef: ElementRef,  // Add ElementRef injection here
    private router: Router
  ) 
  {
    this.loadForms();
    this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
            // hide app component on /create
            this.formCreatorOrEditor = (event.url === '/create' || event.url?.startsWith('/edit'));
        });
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
