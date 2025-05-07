import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { Form } from '../../models/form.model';

@Component({
  selector: 'app-admin-miscellaneous',
  templateUrl: './admin-miscellaneous.component.html',
  styleUrls: ['./admin-miscellaneous.component.scss']
})
export class AdminMiscellaneousComponent implements OnInit {
  topCreators: User[] = [];
  mostAssignedUsers: User[] = [];
  viewers: User[] = [];
  topRespondedForms: Form[] = [];
  newForms: Form[] = [];
  avgResponsesPerForm: number = 0;
  fileCount: number = 0;
  isLoading: boolean = false;
  adminError: string = '';

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadMiscellaneousData();
  }

  loadMiscellaneousData(): void {
    this.isLoading = true;
    this.adminError = '';

    // Load top creators
    this.adminService.getTopFormCreators().subscribe({
      next: (users) => this.topCreators = users || [],
      error: (err) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load users with most assignments
    this.adminService.getUsersWithMostAssignments().subscribe({
      next: (users) => this.mostAssignedUsers = users || [],
      error: (err) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load viewers
    this.adminService.getAllViewers().subscribe({
      next: (users) => this.viewers = users || [],
      error: (err) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load top responded forms
    this.adminService.getTopRespondedForms().subscribe({
      next: (forms) => this.topRespondedForms = forms || [],
      error: (err) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load new forms
    this.adminService.getNewFormsThisWeek().subscribe({
      next: (forms) => this.newForms = forms || [],
      error: (err) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load average responses per form
    this.adminService.getAvgResponsesPerForm().subscribe({
      next: (avg) => this.avgResponsesPerForm = avg || 0,
      error: (err) => this.handleError(err),
      complete: () => this.checkLoading()
    });

    // Load file count
    this.adminService.getFileCount().subscribe({
      next: (count) => this.fileCount = count || 0,
      error: (err) => this.handleError(err),
      complete: () => this.checkLoading()
    });
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
  
  private handleError(err: any): void {
    console.error('AdminMiscellaneous: Error:', err);
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