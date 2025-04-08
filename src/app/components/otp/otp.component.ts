import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss']
})
export class OtpComponent {
  otpDigits: string[] = ['', '', '', '', '', ''];
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  moveFocus(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    if (value.length === 1 && index < 5) {
      const nextInput = input.parentElement.children[index + 1];
      if (nextInput) nextInput.focus();
    } else if (value.length === 0 && index > 0 && event.inputType === 'deleteContentBackward') {
      const prevInput = input.parentElement.children[index - 1];
      if (prevInput) prevInput.focus();
    }
  }

  onVerifyOtp() {
    const otp = this.otpDigits.join('');
    const email = localStorage.getItem('otpEmail');

    if (!email || otp.length < 6) {
      this.errorMessage = "Please enter all 6 digits.";
      return;
    }

    this.authService.verifyOtp(email, otp).subscribe({
      next: (res: string) => {
        if (res === 'User Verified Successfully') {
          alert('OTP verified successfully!');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = res;
        }
      },
      error: () => {
        this.errorMessage = "OTP verification failed.";
      }
    });
  }
}
