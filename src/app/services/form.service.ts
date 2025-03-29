import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  private apiUrl = 'http://localhost:8080/forms';
  
  constructor(private http: HttpClient, private router: Router) {}

  private forms = new BehaviorSubject<any[]>(this.loadForms());
  forms$ = this.forms.asObservable();
  private formsSubject = new BehaviorSubject<any[]>([]);

  addForm(newForm: any) {
    const backendFormat = {
      title: newForm.title,
      description: newForm.description,
      formSchema: JSON.stringify({
        fields: newForm.questions.map((q: any) => ({
          label: q.questionText,
          type: this.mapQuestionType(q.type),
          required: q.required,
          options: q.options.length ? q.options : undefined,
        }))
      })
    }
    console.log(backendFormat)

    this.http.post(`${this.apiUrl}/create`, backendFormat).subscribe(response => {
      console.log("Form saved successfully", response);
    }, error => {
      console.error("Error saving form", error);
    });
  }
  

  private mapQuestionType(type: string): string {
    const typeMapping: { [key: string]: string } = {
      shortText: "text",
      multipleChoice: "select",
      checkboxes: "checkbox",
      dropdown: "select",
      number: "number"
    };
    return typeMapping[type] || "text"; // Default to "text"
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
  return this.http.get<any[]>(`${this.apiUrl}/myCreated`).pipe(
    tap(forms => {
      this.formsSubject.next(forms);
      console.log('API Response:', forms);
    })
  );
}


getFormById(id: number) {
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}

  getResponses(): string[] {
    return ["Default Response 1", "Default Response 2"];
  }

  deleteForm(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      const updatedForms = this.formsSubject.getValue().filter(form => form.id !== id);
      this.formsSubject.next(updatedForms);
    });
  }

  private saveForms(forms: any[]) {
    localStorage.setItem('forms', JSON.stringify(forms));
  }

  private loadForms(): any[] {
    return JSON.parse(localStorage.getItem('forms') || '[]');
  }
}
