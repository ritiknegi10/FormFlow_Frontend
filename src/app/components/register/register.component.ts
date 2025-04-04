import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  submitClicked = false;
  showSuccess: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.submitClicked = true;

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        if (res.message === 'OTP sent successfully') {
          localStorage.setItem('otpEmail', this.email); // save email for OTP verification
          this.router.navigate(['/otp']);
          this.showSuccess = true;
        } else {
          this.errorMessage = res.message || 'Registration failed.';
        }
      },
      error: () => {
        this.errorMessage = "Registration failed. Please try again.";
      }
    });
  }
}
