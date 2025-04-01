// user-forms-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ResponseService } from '../../services/response.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-forms-list',
  templateUrl: './user-forms-list.component.html',
  styleUrls: ['./user-forms-list.component.scss']
})
export class UserFormsListComponent implements OnInit {
  submittedForms: any[] = [];
  noSubmissions: boolean = false;

  constructor(
    private responseService: ResponseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSubmissions();
  }
  private getCurrentUser(): { userId: number } | null {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Token is missing');
      return null;
    }
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.userId) {
        console.error('Invalid token payload:', payload);
        return null;
      }
      return { userId: payload.userId };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
  
  private loadSubmissions() {
    // const currentUser = this.getCurrentUser();
    // if (!currentUser) {
    //   this.router.navigate(['/login']);
    //   return;
    // }
  
    this.responseService.getUserSubmissions(2).subscribe({
      next: (data) => {
        this.submittedForms = data.map((form: any) => ({
          formId: form.id,
          formTitle: form.title,
          submissionDate: form.submissionDate,
        }));
        this.noSubmissions = this.submittedForms.length === 0;
      },
      error: (error) => {
          console.error('Error fetching submissions:', error);
      }
    });
  }
  
  
  viewResponse(formId: number) {
    this.router.navigate([`/form-response/${formId}`]);
  }
}
