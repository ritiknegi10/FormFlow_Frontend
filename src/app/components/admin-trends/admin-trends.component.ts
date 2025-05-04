import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';
import { ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-trends',
  templateUrl: './admin-trends.component.html',
  styleUrls: ['./admin-trends.component.scss']
})
export class AdminTrendsComponent implements OnInit {
  userStats: { totalUsers: number; activeUsers: number } = { totalUsers: 0, activeUsers: 0 };
  formStats: { totalForms: number; activeForms: number; assignedForms: number; publicForms: number } = { totalForms: 0, activeForms: 0, assignedForms: 0, publicForms: 0 };
  responseStats: { totalResponses: number } = { totalResponses: 0 };
  userPieData: any[] = [];
  formPieData: any[] = [];
  responseLineData: any[] = [];
  isLoading: boolean = false;
  adminError: string = '';

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

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadTrendsData();
  }

  loadTrendsData(): void {
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
  }

  private handleError(err: any): void {
    console.error('AdminTrends: Error:', err);
    this.adminError = err.message || 'Failed to load data. Please try again.';
    if (err.status === 401) {
      localStorage.removeItem('jwt');
      this.router.navigate(['/login']);
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
  
  private checkLoading(): void {
    this.isLoading = false;
  }
}