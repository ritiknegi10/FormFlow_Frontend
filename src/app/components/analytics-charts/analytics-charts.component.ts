import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from '../../services/response.service';
import { ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-analytics-charts',
  templateUrl: './analytics-charts.component.html',
  styleUrls: ['./analytics-charts.component.scss']
})
export class AnalyticsChartsComponent implements OnInit {
  formId: number | null = null;
  submissionTrends: any[] = [];
  pieCharts: { questionText: string; data: any[] }[] = [];
  filteredPieCharts: { questionText: string; data: any[] }[] = [];
  searchQuery: string = '';
  loading = { trends: false, pieCharts: false };
  errorMessage = '';
  chartColorScheme = {
    name: 'analytics',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4f46e5', '#7c3aed', '#db2777', '#10b981', '#f59e0b']
  };

  constructor(
    private route: ActivatedRoute,
    private formService: FormService,
    private responseService: ResponseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('id'));
      if (this.formId && !isNaN(this.formId)) {
        this.loadData();
      } else {
        this.errorMessage = 'Invalid form ID';
      }
    });
  }

  private loadData(): void {
    if (!this.formId) return;

    this.loading.trends = true;
    this.loading.pieCharts = true;
    this.errorMessage = '';

    // Fetch form and responses concurrently
    Promise.all([
      this.formService.getFormById(this.formId).toPromise(),
      this.responseService.getResponsesByFormId(this.formId).toPromise()
    ]).then(([form, responses]) => {
      this.processSubmissionTrends(responses || []);
      this.processPieCharts(form, responses || []);
      this.loading.trends = false;
      this.loading.pieCharts = false;
    }).catch(err => {
      console.error('Data Error:', err);
      this.loading.trends = false;
      this.loading.pieCharts = false;
      this.errorMessage = 'Failed to load analytics data';
    });
  }

  private processSubmissionTrends(responses: any[]): void {
    const trendMap: { [date: string]: number } = {};

    responses.forEach(response => {
      if (response.submittedAt) {
        const date = new Date(response.submittedAt).toLocaleDateString();
        trendMap[date] = (trendMap[date] || 0) + 1;
      }
    });

    const trendArray = Object.keys(trendMap).map(date => ({
      name: date,
      value: trendMap[date]
    }));

    this.submissionTrends = [
      {
        name: 'Submissions',
        series: trendArray.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      }
    ];
  }

  private processPieCharts(form: any, responses: any[]): void {
    if (!form?.formSchema?.sections) {
      this.pieCharts = [];
      this.filteredPieCharts = [];
      return;
    }

    const questions: any[] = [];
    form.formSchema.sections.forEach((section: any) => {
      if (section.questions) {
        questions.push(...section.questions.map((q: any) => ({
          id: q.id || q.questionText, // Use id or questionText as fallback
          questionText: q.questionText,
          type: q.type,
          options: q.options || []
        })));
      }
    });

    this.pieCharts = questions.map(question => {
      const data = this.generatePieChartData(question, responses);
      return {
        questionText: question.questionText,
        data
      };
    });

    this.filteredPieCharts = [...this.pieCharts];
  }

  private generatePieChartData(question: any, responses: any[]): any[] {
    if (['multipleChoice', 'dropdown'].includes(question.type)) {
      const optionCounts: { [key: string]: number } = {};
      question.options.forEach((option: string) => {
        optionCounts[option] = 0;
      });

      responses.forEach(response => {
        const answer = response.answers?.[question.id];
        if (answer && optionCounts.hasOwnProperty(answer)) {
          optionCounts[answer]++;
        }
      });

      return Object.keys(optionCounts).map(option => ({
        name: option,
        value: optionCounts[option]
      }));
    } else if (question.type === 'checkboxes') {
      const optionCounts: { [key: string]: number } = {};
      question.options.forEach((option: string) => {
        optionCounts[option] = 0;
      });

      responses.forEach(response => {
        const answers = response.answers?.[question.id] || [];
        answers.forEach((answer: string) => {
          if (optionCounts.hasOwnProperty(answer)) {
            optionCounts[answer]++;
          }
        });
      });

      return Object.keys(optionCounts).map(option => ({
        name: option,
        value: optionCounts[option]
      }));
    } else {
      // For text, rating, date, etc., count answered vs. not answered
      let answered = 0;
      let notAnswered = 0;

      responses.forEach(response => {
        const answer = response.answers?.[question.id];
        if (answer && answer !== '') {
          answered++;
        } else {
          notAnswered++;
        }
      });

      return [
        { name: 'Answered', value: answered },
        { name: 'Not Answered', value: notAnswered }
      ];
    }
  }

  filterPieCharts(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredPieCharts = [...this.pieCharts];
      return;
    }

    this.filteredPieCharts = this.pieCharts.filter(chart =>
      chart.questionText.toLowerCase().includes(query)
    );
  }

  goBack(): void {
    this.router.navigate(['/forms']);
  }
}