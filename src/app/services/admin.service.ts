import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Form } from '../models/form.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('AdminService: No token available');
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserStats(): Observable<{ totalUsers: number; activeUsers: number }> {
    const headers = this.getHeaders();
    return this.http.get<{ totalUsers: number; activeUsers: number }>(`${this.apiUrl}/admin/stats/users`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching user stats:', err);
        return throwError(() => new Error('Failed to fetch user stats'));
      })
    );
  }

  getFormStats(): Observable<{ totalForms: number; activeForms: number; assignedForms: number; publicForms: number }> {
    const headers = this.getHeaders();
    return this.http.get<{ totalForms: number; activeForms: number; assignedForms: number; publicForms: number }>(
      `${this.apiUrl}/admin/stats/forms`, { headers }
    ).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching form stats:', err);
        return throwError(() => new Error('Failed to fetch form stats'));
      })
    );
  }

  getResponseStats(): Observable<{ totalResponses: number }> {
    const headers = this.getHeaders();
    return this.http.get<{ totalResponses: number }>(`${this.apiUrl}/admin/stats/responses`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching response stats:', err);
        return throwError(() => new Error('Failed to fetch response stats'));
      })
    );
  }

  getTopFormCreators(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/admin/top-creators`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching top creators:', err);
        return throwError(() => new Error('Failed to fetch top creators'));
      })
    );
  }

  getUsersWithMostAssignments(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/admin/most-assigned`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching users with most assignments:', err);
        return throwError(() => new Error('Failed to fetch users with most assignments'));
      })
    );
  }

  getAllViewers(): Observable<User[]> {
    const headers = this.getHeaders();
    return this.http.get<User[]>(`${this.apiUrl}/admin/viewers`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching viewers:', err);
        return throwError(() => new Error('Failed to fetch viewers'));
      })
    );
  }

  getTopRespondedForms(): Observable<Form[]> {
    const headers = this.getHeaders();
    return this.http.get<Form[]>(`${this.apiUrl}/admin/most-responded-forms`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching top responded forms:', err);
        return throwError(() => new Error('Failed to fetch top responded forms'));
      })
    );
  }

  getNewFormsThisWeek(): Observable<Form[]> {
    const headers = this.getHeaders();
    return this.http.get<Form[]>(`${this.apiUrl}/admin/new-forms`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching new forms:', err);
        return throwError(() => new Error('Failed to fetch new forms'));
      })
    );
  }

  getAvgResponsesPerForm(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${this.apiUrl}/admin/avg-responses-per-form`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching average responses per form:', err);
        return throwError(() => new Error('Failed to fetch average responses per form'));
      })
    );
  }

  getFileCount(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${this.apiUrl}/admin/file-count`, { headers }).pipe(
      catchError(err => {
        console.error('AdminService: Error fetching file count:', err);
        return throwError(() => new Error('Failed to fetch file count'));
      })
    );
  }
}