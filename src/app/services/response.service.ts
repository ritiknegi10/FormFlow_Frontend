import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {

  private apiUrl = 'http://localhost:8080/responses';
  
  constructor(private http: HttpClient, private router: Router) {}

  getResponsesByFormId(formId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${formId}`);
  }
  
  getUserSubmissions(userId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/my-submissions/${userId}`);
}

}