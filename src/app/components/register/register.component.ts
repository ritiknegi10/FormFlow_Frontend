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

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.authService.register({ username: this.username, email: this.email, password: this.password })
      .subscribe({
        next: (response:boolean) => {
          if(response){
            alert("Registration Seccessful")
            this.router.navigate(['/login']);
          }else {
            alert('Registration failed. Try again.');
          }
        },
        error: () => {
          this.errorMessage = "Invalid username or password!";
        }
      });
  }
}