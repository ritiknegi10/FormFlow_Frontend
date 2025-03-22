import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login();
    this.router.navigate(['/']);
  }
}