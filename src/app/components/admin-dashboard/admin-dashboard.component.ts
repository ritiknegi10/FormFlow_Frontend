import { Component, OnInit } from '@angular/core';
     import { AdminService } from '../../services/admin.service';
     import { User } from '../../models/user.model';
     import { Form } from '../../models/form.model';
     import { Router } from '@angular/router';
     import { ScaleType } from '@swimlane/ngx-charts';

     @Component({
       selector: 'app-admin-dashboard',
       templateUrl: './admin-dashboard.component.html',
       styleUrls: ['./admin-dashboard.component.scss']
     })
     export class AdminDashboardComponent implements OnInit {
       userStats: { totalUsers: number; activeUsers: number } = { totalUsers: 0, activeUsers: 0 };
       formStats: { totalForms: number; activeForms: number; assignedForms: number; publicForms: number } = { totalForms: 0, activeForms: 0, assignedForms: 0, publicForms: 0 };
       responseStats: { totalResponses: number } = { totalResponses: 0 };
       topCreators: User[] = [];
       mostAssignedUsers: User[] = [];
       viewers: User[] = [];
       topRespondedForms: Form[] = [];
       newForms: Form[] = [];
       avgResponsesPerForm: number = 0;
       fileCount: number = 0;
       adminError: string = '';
       isLoading: boolean = false;

       // Chart data
       userPieData: any[] = [];
       formPieData: any[] = [];
       responseLineData: any[] = [];

       // Chart options
       showLegend = true;
       showLabels = true;
       explodeSlices = false;
       doughnut = false;
       colorScheme = {
         name: 'custom',
         selectable: true,
         group: ScaleType.Ordinal,
         domain: ['#4f46e5', '#7c3aed', '#db2777', '#eab308']
       };

       constructor(private adminService: AdminService, private router: Router) { }

       ngOnInit(): void {
         this.loadAllData();
       }

       loadAllData(): void {
         this.isLoading = true;
         this.adminError = '';

         // Load user stats
         this.adminService.getUserStats().subscribe({
           next: (stats) => {
             this.userStats = stats || { totalUsers: 0, activeUsers: 0 };
             this.userPieData = [
               { name: 'Total Users', value: this.userStats.totalUsers },
               { name: 'Active Users', value: this.userStats.activeUsers }
             ];
           },
           error: (err) => this.handleError(err),
           complete: () => this.checkLoading()
         });

         // Load form stats
         this.adminService.getFormStats().subscribe({
           next: (stats) => {
             this.formStats = stats || { totalForms: 0, activeForms: 0, assignedForms: 0, publicForms: 0 };
             this.formPieData = [
               { name: 'Total Forms', value: this.formStats.totalForms },
               { name: 'Active Forms', value: this.formStats.activeForms },
               { name: 'Assigned Forms', value: this.formStats.assignedForms },
               { name: 'Public Forms', value: this.formStats.publicForms }
             ];
           },
           error: (err) => this.handleError(err),
           complete: () => this.checkLoading()
         });

         // Load response stats
         this.adminService.getResponseStats().subscribe({
           next: (stats) => {
             this.responseStats = stats || { totalResponses: 0 };
             // Mock trend data (replace with real API if available)
             this.responseLineData = [
               {
                 name: 'Responses',
                 series: [
                   { name: 'Week 1', value: this.responseStats.totalResponses * 0.2 },
                   { name: 'Week 2', value: this.responseStats.totalResponses * 0.4 },
                   { name: 'Week 3', value: this.responseStats.totalResponses * 0.7 },
                   { name: 'Week 4', value: this.responseStats.totalResponses }
                 ]
               }
             ];
           },
           error: (err) => this.handleError(err),
           complete: () => this.checkLoading()
         });

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