import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private forms = new BehaviorSubject<any[]>(this.loadForms());
  forms$ = this.forms.asObservable();
  private formsSubject = new BehaviorSubject<any[]>([]);

  addForm(newForm: any) {
    const updatedForms = [...this.forms.getValue(), newForm];
    this.forms.next(updatedForms);
    this.saveForms(updatedForms);
  }
  getLatestForm() {
    const forms = this.formsSubject.value; 
    return forms.length > 0 ? forms[forms.length - 1] : null;
  }
  updateForm(index: number, updatedForm: any) {
    const forms = this.forms.getValue();
    
    updatedForm.questions = updatedForm.questions.map((q: any) =>
      typeof q === 'string' ? { text: q } : q
    );
  
    forms[index] = updatedForm;
    this.forms.next(forms);
    this.saveForms(forms);
    const formsArray = this.formsSubject.getValue();
    formsArray[index] = updatedForm;
    this.formsSubject.next(formsArray);
  }
  
  getResponseByIndex(index: number): any {
    const responses = this.getResponses(); 
    return responses[index] || null;
  }
  getFormsByIndex(index: number) {
    const formsArray = this.formsSubject.getValue();  
    return formsArray[index] || null;
  }

  getResponsesByFormIndex(index: number): any {
    const allResponses = JSON.parse(localStorage.getItem('responses') || '{}');
    console.log("Fetching responses for Form", index, ":", allResponses[index]); 
    return allResponses[index] || [];
  }
  

  

  saveResponse(formIndex: number, responseData: any) {
    let allResponses = JSON.parse(localStorage.getItem('responses') || '{}');
    
    if (!allResponses[formIndex]) {
        allResponses[formIndex] = []; 
    }
    
    allResponses[formIndex].push(responseData); 
    localStorage.setItem('responses', JSON.stringify(allResponses));

    console.log("Updated Responses:", JSON.parse(localStorage.getItem('responses') || '{}')); 
}

getForms() {
  return this.forms; 
}


  getFormByIndex(index: number) {
    const storedForms = JSON.parse(localStorage.getItem('forms') || '[]');
    if (index >= 0 && index < storedForms.length) {
      return storedForms[index]; 
    }
    return null;
  }

  getResponses(): string[] {
    return ["Default Response 1", "Default Response 2"];
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
