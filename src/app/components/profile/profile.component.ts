import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface UserDetails {
  username: string;
  email: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  userDetails: UserDetails = {
    username: 'Loading...',
    email: 'Loading...'
  };

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserDetails();
  }

  private loadUserDetails(): void {
    this.authService.getCurrentUserDetails().subscribe({
      next: (user: UserDetails) => {
        this.userDetails = user;
      },
      error: (err: any) => {
        console.error('Failed to load user details', err);
        this.userDetails.email = this.authService.getCurrentUserEmail() || 'email@example.com';
      }
    });
  }

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, log out!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
    this.authService.logout();
    this.router.navigate(['/login']);
    Swal.fire('Logged out!', 'You have been successfully logged out.', 'success');
    }
  });
  }
}