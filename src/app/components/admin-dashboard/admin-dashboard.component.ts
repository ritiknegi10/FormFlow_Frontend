import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  allUsers: { email: string; isAdmin: boolean; username: string }[] = [];
  filteredUsers: { email: string; isAdmin: boolean; username: string }[] = [];
  searchTerm: string = '';
  loading = { users: false };
  errorMessage = '';
  isLoading: boolean = false;
  adminError: string = '';
  currentUserEmail: string | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadUsers();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUserEmail = user?.email || null;
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
        this.currentUserEmail = null;
        this.handleError(err);
      }
    });
  }

  loadUsers(): void {
    this.loading.users = true;
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.allUsers = users || [];
        this.filteredUsers = users || []; // Initialize filteredUsers with all users
        this.loading.users = false;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load users';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: this.errorMessage
        });
        this.loading.users = false;
        this.isLoading = false;
        this.handleError(err);
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers = this.allUsers; // Show all users if search is empty
      return;
    }
    this.filteredUsers = this.allUsers.filter(user =>
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term)
    );
  }

  makeAdmin(email: string): void {
    Swal.fire({
      title: 'Confirm Action',
      text: `Make ${email} an admin?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.makeAdmin(email).subscribe({
          next: (message) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: message
            });
            this.allUsers = this.allUsers.map(user =>
              user.email === email ? { ...user, isAdmin: true } : user
            );
            this.filterUsers(); // Update filteredUsers after role change
          },
          error: (err) => {
            this.errorMessage = err.message || 'Failed to make admin';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: this.errorMessage
            });
            this.handleError(err);
          }
        });
      }
    });
  }

  removeAdmin(email: string): void {
    Swal.fire({
      title: 'Confirm Action',
      text: `Remove admin status from ${email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adminService.removeAdmin(email).subscribe({
          next: (message) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: message
            });
            this.allUsers = this.allUsers.map(user =>
              user.email === email ? { ...user, isAdmin: false } : user
            );
            this.filterUsers(); // Update filteredUsers after role change
          },
          error: (err) => {
            this.errorMessage = err.message || 'Failed to remove admin';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: this.errorMessage
            });
            this.handleError(err);
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }

  private handleError(err: any): void {
    console.error('AdminDashboard: Error:', err);
    this.adminError = err.message || 'Failed to load data. Please try again.';
    if (err.status === 401) {
      localStorage.removeItem('jwt');
      this.router.navigate(['/login']);
    }
    this.isLoading = false;
  }
}