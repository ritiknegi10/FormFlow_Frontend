import { HttpClient , HttpHeaders, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private apiUrl = 'http://localhost:8080/auth';



  private loggedIn = new BehaviorSubject<boolean>(false);
  private redirectUrl: string | null = null;

setRedirectUrl(url: string) {
  this.redirectUrl = url;
}

getRedirectUrl(): string | null {
  return this.redirectUrl;
}

clearRedirectUrl() {
  this.redirectUrl = null;
}

  // Add this observable
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Initialize login state
    this.loggedIn.next(!!this.getToken());
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { responseType: 'text' }).pipe(
      tap((token) => {
        this.saveToken(token);
        localStorage.setItem('userEmail', credentials.username);
        this.loggedIn.next(true);
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
  this.loggedIn.next(true); // Update login state
}


  // Update existing getToken() method
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
    this.loggedIn.next(false); 
    this.router.navigate(['/login']);
  }

  getCurrentUserEmail(): string | null {
    const token = this.getToken();
    if (token) {
      return localStorage.getItem('userEmail') || null;
    }
    return null;
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
  
    return this.http.get<boolean>(`http://localhost:8080/users/search`, {
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
  }}