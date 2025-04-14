import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  message: string = '';
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  
  onSubmit() {
    if (this.forgotForm.valid) {
      const email = this.forgotForm.get('email')?.value;
      const params = new HttpParams().set('email', email);
  
      this.http.post('http://localhost:8080/auth/send-reset-link', null, {
        params,
        responseType: 'text' // explicitly expect plain text (not JSON)
      }).subscribe({
        next: (res) => {
          this.message = res || 'Email sent successfully. Check your inbox.';
          this.error = '';
        },
        error: (err) => {
          this.message = '';
          this.error = err?.error || 'Error sending email. Please try again.';
        }
      });
    }
  }
  
}
