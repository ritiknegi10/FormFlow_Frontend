import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  token: string = '';
  isLoading: boolean = false;
  submitClicked: boolean = false;
  message: string = '';
  error: string = '';
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordsMatchValidator });

    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  togglePasswordView(state: boolean, event: Event) {
    event.preventDefault();
    this.showPassword = state;
  }

  onSubmit() {
    this.submitClicked = true;
    
    if (this.resetForm.valid) {
      this.isLoading = true;
      const newPassword = this.resetForm.get('newPassword')?.value;
      const headers = new HttpHeaders().set('Reset-Token', this.token);

      this.http.post('http://localhost:8080/auth/reset-password', 
        { newPassword: newPassword }, 
        { headers: headers, responseType: 'text' }
      ).subscribe({
        next: (response) => {
          this.message = response || 'Password reset successfully!';
          this.error = '';
          setTimeout(() => this.router.navigate(['/auth/login']), 2000);
        },
        error: (err) => {
          this.message = '';
          this.error = err.error?.message || 'Error resetting password. Please try again.';
          
          if (err.status === 200) { // Handle empty response
            this.message = 'Password reset successfully!';
            setTimeout(() => this.router.navigate(['/auth/login']), 2000);
          }
        },
        complete: () => {
          this.isLoading = false;
          this.resetForm.reset();
        }
      });
    }
  }
}