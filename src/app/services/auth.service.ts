import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl + '/auth';
  private loggedIn = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private redirectUrl: string | null = null;

  isLoggedIn$ = this.loggedIn.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loggedIn.next(!!this.getToken());
    if (this.getToken()) {
      this.loadCurrentUser();
    }
  }

  setRedirectUrl(url: string) {
    this.redirectUrl = url;
  }

  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }

  clearRedirectUrl() {
    this.redirectUrl = null;
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { responseType: 'text' }).pipe(
      tap((token) => {
        this.saveToken(token);
        localStorage.setItem('userEmail', credentials.username);
        this.loggedIn.next(true);
        this.loadCurrentUser();
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: { username: string; password: string; email: string }): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/user-register`, userData);
  }

  verifyOtp(email: string, otp: string) {
    const params = new HttpParams()
      .set('email', email)
      .set('otp', otp);
    return this.http.post(`${this.apiUrl}/user-verify`, null, { params, responseType: 'text' });
  }

  saveToken(token: string) {
    localStorage.setItem('jwt', token);
    this.loggedIn.next(true);
  }

  getToken(): string | null {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('Token is missing');
      return null;
    }
    return token;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userEmail');
    this.loggedIn.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUserEmail(): string | null {
    const token = this.getToken();
    if (token) {
      return localStorage.getItem('userEmail') || null;
    }
    return null;
  }
  getCurrentUserDetails(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
    
    return this.http.get<any>('http://localhost:8080/users/me', { headers }).pipe(
      catchError(error => {
        console.error('Error fetching user details', error);
        return throwError(() => error);
      })
    );
  }
  
  sendOtp(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/send-otp`, { email }, { responseType: 'text' }).pipe(
      catchError((error) => {
        console.error('Network error details:', error);
        if (error.status === 0) {
          throw new Error('Cannot connect to server. Check if backend is running.');
        }
        throw error;
      })
    );
  }

  checkUserByEmail(email: string): Observable<boolean> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.getToken()}`
    });
  
    return this.http.get<boolean>(`${environment.apiUrl}/users/search`, {
            params: new HttpParams().set('email', email),
      headers: headers
    }).pipe(
      catchError(error => {
        if (error.status === 401) this.logout();
        return throwError(() => error);
      })
    );
  }

  verifyOtpAndRegister(data: { 
    email: string, 
    otp: string, 
    username: string, 
    password: string 
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/verify`, data, { 
      responseType: 'text'
    }).pipe(
      catchError(error => {
        console.error('Verification Error:', error);
        return throwError(() => ({
          error: error.error,
          status: error.status,
          message: 'OTP verification failed'
        }));
      })
    );
  }

  loadCurrentUser(): void {
    const token = this.getToken();
    if (!token) {
      console.log('AuthService: No token, skipping loadCurrentUser');
      this.currentUserSubject.next(null);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<User>(`${environment.apiUrl}/users/me`, { headers }).subscribe({
      next: (user) => {
        console.log('AuthService: Loaded user =', user);
        this.currentUserSubject.next(user);
        this.loggedIn.next(true);
      },
      // error: (err) => {
      //   console.error('AuthService: Error loading current user:', {
      //     status: err.status,
      //     statusText: err.statusText,
      //     message: err.message,
      //     error: err.error
      //   });
      //   this.currentUserSubject.next(null);
      //   this.loggedIn.next(false);
      //   localStorage.removeItem('jwt');
      //   localStorage.removeItem('userEmail');
      //   this.router.navigate(['/login']);
      // }.

      error: (err) => {
        console.error('AuthService: Error loading current user:', err);
        if (err.status === 401) {
          this.logout();
        } else {
          this.currentUserSubject.next(null);
        }
      }
    });
  }
}