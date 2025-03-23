
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.login();
    this.router.navigate(['/']);
  }
}