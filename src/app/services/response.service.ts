import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

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
}