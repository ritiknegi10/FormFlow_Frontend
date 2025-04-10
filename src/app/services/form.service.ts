import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';
import { Observable } from 'rxjs';

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
          type: q.type,
          required: q.required,
          options: q.options.length ? q.options : undefined,
          rating: q.rating ? q.rating : 5
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
      shortText: "shortText",
      paragraph: "paragraph",
      multipleChoice: "multipleChoice",
      checkboxes: "checkboxes",
      dropdown: "dropdown",
      rating: "rating",
      date:"date",
      time:"time"
    };
    return typeMapping[type] || "shortText"; // Default to "shortText"
  }

  getLatestForm() {
    const forms = this.formsSubject.value; 
    return forms.length > 0 ? forms[forms.length - 1] : null;
  }
  updateForm(id: number, updatedForm: any): Observable<any>{ 
    const backendFormat = {
      title: updatedForm.title,
      description: updatedForm.description,
      formSchema: JSON.stringify({
        fields: updatedForm.questions.map((q: any) => ({
          label: q.questionText,
          type: q.type,
          required: q.required,
          options: q.options.length ? q.options : undefined,
        }))
      })
    };
    console.log(backendFormat);
    console.log('Final backendFormat before HTTP POST:', backendFormat);  
  console.log(`Posting to URL: ${this.apiUrl}/edit/${id}`);

    return this.http.post(`${this.apiUrl}/edit/${id}`, backendFormat);
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
      //console.log('API Response:', forms);
    })
  );
}


getFormById(id: number) {
  console.log(`${this.apiUrl}/${id}`);
  return this.http.get<any>(`${this.apiUrl}/${id}`);
}

getFormVersions(formId: number) {
  return this.http.get<any>(`${this.apiUrl}/${formId}/versions`);
}

getFormByVersion(formId: number, version: number) {
  return this.http.get<any>(`${this.apiUrl}/${formId}/versions/${version}`);
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
