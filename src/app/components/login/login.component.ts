import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  submitClicked: boolean = false;
  captchaVerified: boolean = false;
  captchaErrorMessage: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}
  
  resolvedCaptcha(response: string) {
    this.captchaVerified = !!response;
    this.captchaErrorMessage = '';
    
  }

  onSubmit() {
    this.submitClicked = true;
    if (!this.captchaVerified) {
      this.captchaErrorMessage = "Please verify the captcha before proceeding.";
      return;
    }

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (token: string) => {
          console.log('token', token)
          this.authService.saveToken(token);
          const redirectUrl = this.authService.getRedirectUrl();
          if (redirectUrl) {
            this.authService.clearRedirectUrl();  // prevent future unwanted redirects
            this.router.navigateByUrl(redirectUrl);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: () => {
          this.errorMessage = "Invalid username or password!";
        }
      });
  }
}