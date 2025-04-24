import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service'; 
import { User } from '../../models/user.model'; 
import { Form } from '../../models/form.model'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  userStats: { totalUsers: number; activeUsers: number } | null = null;
  formStats: { totalForms: number; activeForms: number; assignedForms: number; publicForms: number } | null = null;
  responseStats: { totalResponses: number } | null = null;
  topCreators: User[] = [];
  mostAssignedUsers: User[] = [];
  viewers: User[] = [];
  topRespondedForms: Form[] = [];
  newForms: Form[] = [];
  avgResponsesPerForm: number = 0;
  fileCount: number = 0;
  adminError: string = '';
  isLoading: boolean = false;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.adminError = '';

    // Load user stats
    this.adminService.getUserStats().subscribe({
      next: (stats: { totalUsers: number; activeUsers: number }) => this.userStats = stats,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load form stats
    this.adminService.getFormStats().subscribe({
      next: (stats: { totalForms: number; activeForms: number; assignedForms: number; publicForms: number }) => this.formStats = stats,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load response stats
    this.adminService.getResponseStats().subscribe({
      next: (stats: { totalResponses: number }) => this.responseStats = stats,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load top creators
    this.adminService.getTopFormCreators().subscribe({
      next: (users: User[]) => this.topCreators = users,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load users with most assignments
    this.adminService.getUsersWithMostAssignments().subscribe({
      next: (users: User[]) => this.mostAssignedUsers = users,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load viewers
    this.adminService.getAllViewers().subscribe({
      next: (users: User[]) => this.viewers = users,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load top responded forms
    this.adminService.getTopRespondedForms().subscribe({
      next: (forms: Form[]) => this.topRespondedForms = forms,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load new forms
    this.adminService.getNewFormsThisWeek().subscribe({
      next: (forms: Form[]) => this.newForms = forms,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load average responses per form
    this.adminService.getAvgResponsesPerForm().subscribe({
      next: (avg: number) => this.avgResponsesPerForm = avg,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load file count
    this.adminService.getFileCount().subscribe({
      next: (count: number) => this.fileCount = count,
      error: (err: any) => this.handleError(err),
      complete: () => this.checkLoading()
    });
  }

  private handleError(err: any): void {
    console.error('AdminDashboard: Error:', err);
    this.adminError = err.message || 'Failed to load data. Please try again.';
    if (err.status === 401) {
      localStorage.removeItem('jwt');
      this.router.navigate(['/login']);
    }
  }

  private checkLoading(): void {
    this.isLoading = false;
  }
}