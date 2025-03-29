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
  submitClicked = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.submitClicked = true;

    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: (token: string) => {
          console.log('token', token)
          this.authService.saveToken(token);
          this.router.navigate(['/']);
        },
        error: () => {
          this.errorMessage = "Invalid username or password!";
        }
      });
  }
}