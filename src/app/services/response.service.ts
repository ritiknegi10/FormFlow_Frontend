import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

  submitResponse(formId: number, response: any) {
    console.log(formId)
    return this.http.post(`${this.apiUrl}/submit/${formId}`, JSON.stringify(response)).subscribe(response => {
      console.log("Response saved successfully", response);
    }, error => {
      console.error("Error saving form", error);
    });
  }
  
  getUserSubmissions(userId: number): Observable<any[]> {
    const token = localStorage.getItem('jwt'); // Retrieve token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Add Authorization header
    });
  
    return this.http.get<any[]>(`${this.apiUrl}/my-submissions/${userId}`, { headers });
  }

}