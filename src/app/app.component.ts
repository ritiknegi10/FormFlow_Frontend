import { Component, HostListener, ElementRef, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'form-flow';
  forms: any[] = [];
  isProfileMenuOpen = false;
  formCreatorOrEditor: boolean = false;
  // side drawer
  isDrawerOpen: boolean = false;
  firstRender: boolean = true;
  isVersionView = true;
  hideNavbar = false;

  constructor(
    public authService: AuthService,
    private elementRef: ElementRef,  // Add ElementRef injection here
    private router: Router
  ) {
    this.loadForms();
    this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
            this.formCreatorOrEditor = (event.url?.startsWith('/create') || event.url?.startsWith('/edit'));
            this.isVersionView = /^\/forms\/\d+\/versions\/\d+$/.test(event.url);
            this.hideNavbar = this.formCreatorOrEditor || this.isVersionView;
        });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.firstRender = false;
    }, 0);
  }
  
  // drawer function
  toggleDrawer(){
    this.isDrawerOpen = !this.isDrawerOpen;
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
