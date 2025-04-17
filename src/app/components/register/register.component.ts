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
  captchaVerified: boolean = false;
  captchaErrorMessage: string = '';
  otp: string = '';
  otpSent: boolean = false;
  isLoading: boolean = false;



  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  
resolvedCaptcha(response: string) {
  this.captchaVerified = !!response;
  this.captchaErrorMessage = '';
  
}

sendOtp() {
  this.isLoading = true;
  if (!this.captchaVerified) {
    this.captchaErrorMessage = "Please verify the captcha before sending OTP.";
    this.isLoading = false;
    return;
  }
  if (!this.email) {
    this.errorMessage = "Email is required";
    this.isLoading = false;
    return;
  }

  this.authService.sendOtp(this.email).subscribe({
      next: () => {
        this.otpSent = true;
        this.errorMessage = '';
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.text || err.error || "Failed to send OTP. Please try again.";
        this.isLoading = false;
      }
    });
  }

onSubmit() {
  this.submitClicked = true;
  this.isLoading = true; 
  if (!this.otpSent) {
    this.sendOtp();
    return;
  }

  if (!this.otp) {
    this.errorMessage = "OTP is required";
    return;
  }

  this.authService.verifyOtpAndRegister({
    username: this.username,
    email: this.email,
    password: this.password,
    otp: this.otp
    }).subscribe({
      // next: (res: any) => {
      //   if (res.message === 'OTP sent successfully') {
      //     localStorage.setItem('otpEmail', this.email); // save email for OTP verification
      //     this.router.navigate(['/otp']);
      //     this.showSuccess = true;
      //   } else {
      //     this.errorMessage = res.message || 'Registration failed.';
      //   }
      // },
      // error: () => {
      //   this.errorMessage = "Registration failed. Please try again.";
      // }
      next: () => {
        this.showSuccess = true;
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (err) => {
        console.error('Full error:', err);
        
        if (err.status === 500) {
          this.errorMessage = "Server error. Please try again later.";
        } else if (err.error?.includes("already exists")) {
          this.errorMessage = "User with this email already exists";
        } else {
          this.errorMessage = err.error?.text || err.message || "Registration failed";
        }
        
        this.isLoading = false;
      }
    });
  }
}
