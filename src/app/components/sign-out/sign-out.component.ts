import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html'
})
export class SignOutComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  confirmLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  cancelLogout() {
    this.router.navigate(['/']); 
  }
}