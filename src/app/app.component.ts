import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'form-flow';
  forms: any[] = []; 

  constructor(public authService: AuthService) {
    this.loadForms();
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
