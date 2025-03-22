import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private forms = new BehaviorSubject<any[]>(this.loadForms());
  forms$ = this.forms.asObservable();

  addForm(newForm: any) {
    const updatedForms = [...this.forms.getValue(), newForm];
    this.forms.next(updatedForms);
    this.saveForms(updatedForms);
  }

  updateForm(index: number, updatedForm: any) {
    const forms = this.forms.getValue();
    
    updatedForm.questions = updatedForm.questions.map((q: any) =>
      typeof q === 'string' ? { text: q } : q
    );
  
    forms[index] = updatedForm;
    this.forms.next(forms);
    this.saveForms(forms);
  }
  
  getFormByIndex(index: number) {
    const storedForms = JSON.parse(localStorage.getItem('forms') || '[]');
    if (index >= 0 && index < storedForms.length) {
      return storedForms[index]; 
    }
    return null;
  }

  deleteForm(index: number) {
    const forms = this.forms.getValue();
    if (index >= 0 && index < forms.length) {
      forms.splice(index, 1); 
      this.forms.next([...forms]); 
      this.saveForms(forms); 
    }
  }

  private saveForms(forms: any[]) {
    localStorage.setItem('forms', JSON.stringify(forms));
  }

  private loadForms(): any[] {
    return JSON.parse(localStorage.getItem('forms') || '[]');
  }
}
