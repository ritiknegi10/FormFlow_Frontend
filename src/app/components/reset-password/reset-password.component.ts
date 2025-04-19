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

  onSubmit() {
    if (this.resetForm.valid) {
      const newPassword = this.resetForm.get('newPassword')?.value;
      const headers = new HttpHeaders().set('Reset-Token', this.token);

      this.http.post('http://localhost:8080/auth/reset-password', 
        { newPassword: newPassword }, 
        { headers: headers, responseType: 'text' } 
      ).subscribe({
        next: (response) => {
          alert('Password reset successful!');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          // Handle cases where the backend responds with 200 but no body
          if (err.status === 200) {
            alert('Password reset successful!');
            this.router.navigate(['/auth/login']);
          } else {
            console.error(err);
            alert('Error resetting password: ' + (err.error?.message || 'Please try again'));
          }
        }
      });
    }
  }
}
