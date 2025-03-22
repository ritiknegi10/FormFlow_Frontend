import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login(); // Auto-login after registration
    this.router.navigate(['/']);
  }
}