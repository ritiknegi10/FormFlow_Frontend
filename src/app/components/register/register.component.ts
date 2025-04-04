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
  showSuccess: boolean = false;
  submitClicked = false; 
  captchaVerified: boolean = false;
  captchaErrorMessage: string = '';


  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

//   onSubmit() {
//     this.authService.register({ username: this.username, email: this.email, password: this.password })
//       .subscribe({
//         next: (response:boolean) => {
//           if(response){
//             alert("Registration Seccessful")
//             this.router.navigate(['/']);
//           }else {
//             alert('Registration failed. Try again.');
//           }
//         },
//         error: () => {
//           this.errorMessage = "Invalid username or password!";
//         }
//       });
//   }
// }

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
  
  this.authService.register({ 
    username: this.username,
    email: this.email,
    password: this.password 
  }).subscribe({
    next: (response: boolean) => {
      if(response) {
        // Auto-login after successful registration
        this.authService.login({
          username: this.username,
          password: this.password
        }).subscribe({
          next: (token) => {
            this.authService.saveToken(token);
            this.showSuccess = true;
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 2000);
          },
          error: () => {
            this.errorMessage = "Auto-login failed. Please login manually.";
          }
        });
      } else {
        this.errorMessage = "Registration failed. Please try again.";
      }
    },
    error: () => {
      this.errorMessage = "Registration failed. Please check your details.";
    }
  });
}
}






