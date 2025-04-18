import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, forkJoin, map, of, switchMap, tap, throwError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = 'http://localhost:8080/forms';
  private forms = new BehaviorSubject<any[]>([]);
  forms$ = this.forms.asObservable();
  private formsSubject = new BehaviorSubject<any[]>([]);

  constructor(private http: HttpClient, private router: Router) {
    this.loadForms();
  }

  private loadForms(): any[] {
    const forms = JSON.parse(localStorage.getItem('forms') || '[]');
    this.forms.next(forms);
    return forms;
  }

  private saveForms(forms: any[]): void {
    localStorage.setItem('forms', JSON.stringify(forms));
    this.forms.next(forms);
  }

  addForm(newForm: any): void {
    const allQuestions: any[] = [];
    
    if (newForm.formSchema && newForm.formSchema.sections) {
      newForm.formSchema.sections.forEach((section: any) => {
        if (section.questions) {
          allQuestions.push(...section.questions.map((q: any) => ({
            label: q.questionText,
            type: q.type,
            required: q.required,
            options: q.options?.length ? q.options : undefined,
            rating: q.rating ?? 5,
            startValue: q.startValue ?? 0,
            endValue: q.endValue ?? 5,
            rows: q.rows?.length ? q.rows : undefined,
            columns: q.columns?.length ? q.columns : undefined,
            fileUrl: q.fileUrl
          })));
        }
      });
    }

    const backendFormat = {
      title: newForm.title,
      description: newForm.description,
      formSchema: JSON.stringify({
        sections: newForm.formSchema.sections
      })
    };

    this.http.post(`${this.apiUrl}/create`, backendFormat).subscribe({
      next: (response) => console.log("Form saved successfully", response),
      error: (error) => console.error("Error saving form", error)
    });
  }

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`http://localhost:8080/upload`, formData, { responseType: 'text' });
  }

  deleteFile(fileUrl: string): Observable<any> {
    const params = new HttpParams().set('url', fileUrl);
    return this.http.delete(`http://localhost:8080/upload/delete`, { params, responseType: 'text' });
  }

  updateForm(id: number, updatedForm: any): Observable<any> {
    const backendFormat = {
      title: updatedForm.title,
      description: updatedForm.description,
      formSchema: JSON.stringify({
        sections: updatedForm.formSchema.sections
      })
    };

    return this.http.post(`${this.apiUrl}/edit/${id}`, backendFormat);
  }

  getForms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/myCreated`).pipe(
      tap(forms => this.formsSubject.next(forms))
    );
  }

  getFormById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getFormVersions(formId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${formId}/versions`);
  }

  getFormByVersion(formId: number, version: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${formId}/versions/${version}`);
  }

  deleteForm(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      const updatedForms = this.formsSubject.getValue().filter(form => form.id !== id);
      this.formsSubject.next(updatedForms);
    });
  }

  getResponses(): string[] {
    return ["Default Response 1", "Default Response 2"];
  }

  getResponseByIndex(index: number): any {
    const responses = this.getResponses();
    return responses[index] || null;
  }

  getFormsByIndex(index: number): any {
    const formsArray = this.formsSubject.getValue();
    return formsArray[index] || null;
  }

  getResponsesByFormIndex(index: number): any {
    const allResponses = JSON.parse(localStorage.getItem('responses') || '{}');
    return allResponses[index] || [];
  }

  saveResponse(formIndex: number, responseData: any): void {
    let allResponses = JSON.parse(localStorage.getItem('responses') || '{}');
    if (!allResponses[formIndex]) {
      allResponses[formIndex] = [];
    }
    allResponses[formIndex].push(responseData);
    localStorage.setItem('responses', JSON.stringify(allResponses));
  }

  getAssignedForms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/assigned`).pipe(
      catchError(error => {
        console.error('Error fetching assigned forms:', error);
        return of([]);
      })
    );
  }

  getAssignedUsers(formId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${formId}/assigned-users`).pipe(
      catchError(error => {
        console.error('Error fetching assigned users:', error);
        return of([]);
      })
    );
  }

  checkUserSubmission(formId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/${formId}/submitted`);
  }

  assignUsersToForm(formId: number, userEmails: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${formId}/assign`, userEmails);
  }

  // Helper method to maintain question type consistency
  private mapQuestionType(type: string): string {
    const typeMapping: { [key: string]: string } = {
      shortText: "shortText",
      paragraph: "paragraph",
      multipleChoice: "multipleChoice",
      checkboxes: "checkboxes",
      dropdown: "dropdown",
      rating: "rating",
      date: "date",
      time: "time",
      linearscale: "linearscale",
      multipleChoiceGrid: "multipleChoiceGrid",
      checkboxGrid: "checkboxGrid",
      file: "file"
    };
    return typeMapping[type] || "shortText";
  }
}