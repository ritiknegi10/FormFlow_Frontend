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
  isLoading: boolean = false;
  submitClicked: boolean = false;
  captchaErrorMessage: string = '';
  private recaptchaToken: string = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  resolvedCaptcha(token: string): void {
    this.recaptchaToken = token;
    this.captchaErrorMessage = '';
  }

  onSubmit() {
    this.submitClicked = true;
    
    if (!this.recaptchaToken) {
      this.captchaErrorMessage = 'Please complete the CAPTCHA';
      return;
    }

    if (this.forgotForm.valid && this.recaptchaToken) {
      this.isLoading = true;
      const email = this.forgotForm.get('email')?.value;
      const params = new HttpParams()
        .set('email', email)
        .set('recaptcha', this.recaptchaToken);

      this.http.post('http://localhost:8080/auth/send-reset-link', null, {
        params,
        responseType: 'text'
      }).subscribe({
        next: (res) => {
          this.message = res || 'Password reset link sent. Check your email.';
          this.error = '';
          this.isLoading = false;
        },
        error: (err) => {
          this.message = '';
          this.error = err?.error || 'Error sending reset link. Please try again.';
          this.isLoading = false;
          this.recaptchaToken = '';
        }
      });
    }
  }
}