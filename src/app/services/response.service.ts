import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {

  private apiUrl = 'http://localhost:8080/responses';
  
  constructor(private http: HttpClient, private router: Router) {}

  getResponsesByFormId(formId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${formId}`);
  }

  submitResponse(formId: number, response: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit/${formId}`, response).pipe(
      catchError(error => {
        console.error('Submission error:', error);
        return throwError(() => error);
      })
    );
  }

  getUserSubmissions(): Observable<any[]> {
    const token = localStorage.getItem('jwt'); // Retrieve token
    // const headers = new HttpHeaders({
    //   'Authorization': `Bearer ${token}` // Add Authorization header
    // });
  
    return this.http.get<any[]>(`${this.apiUrl}/my-submissions/`);
  }

  getResponsesByFormIdandUser(formId: number){
    return this.http.get<any[]>(`${this.apiUrl}/my-submissions/${formId}`);
  }

}