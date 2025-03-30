import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = 'http://localhost:8080/auth';



  private loggedIn = new BehaviorSubject<boolean>(false);
  // Add this observable
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Initialize login state
    this.loggedIn.next(!!this.getToken());
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials,{ responseType: 'text' });
  }

  register(userData: { username: string; password: string; email: string }): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/register`, userData);
  }

  saveToken(token: string) {
    localStorage.setItem('jwt', token);
    this.loggedIn.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('jwt');
    this.loggedIn.next(false); 
    this.router.navigate(['/login']);
  }
}