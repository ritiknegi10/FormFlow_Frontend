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


  constructor(
    private authService: AuthService,
    private router: Router
  ) {}


  
resolvedCaptcha(response: string) {
  this.captchaVerified = !!response;
  this.captchaErrorMessage = '';
  
}

sendOtp() {
  if (!this.captchaVerified) {
    this.captchaErrorMessage = "Please verify the captcha before sending OTP.";
    return;
  }
  if (!this.email) {
    this.errorMessage = "Email is required";
    return;
  }
  
  this.authService.sendOtp(this.email).subscribe({
    next: () => {
      this.otpSent = true;
      this.errorMessage = '';
    },
    error: (err) => {
      this.errorMessage = err.error || "Failed to send OTP. Please try again.";
    }
  });
}


onSubmit() {
  this.submitClicked = true;
    
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
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage = err.error || "Registration failed. Please check your OTP";
      }
    });
  }
}
