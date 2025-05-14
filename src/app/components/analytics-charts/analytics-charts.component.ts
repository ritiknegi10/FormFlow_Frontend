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
  selectedForm: any = null;
  responses: any[] = [];
  submissionTrend: { name: string; value: number }[] = [];
  questionResponseData: { [key: string]: { name: string; value: number }[] } = {};
  // Chart configurations
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Submission Date';
  showYAxisLabel = true;
  yAxisLabel = 'Number of Submissions';
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };
  // Line chart specific
  autoScale = true;
  showGridLines = true;
  // Pie chart configurations
  pieGradient = true;
  pieShowLegend = true;
  pieShowLabels = true;
  pieIsDoughnut = false;

  constructor(
    private route: ActivatedRoute,
    private formService: FormService,
    private responseService: ResponseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('id'));
      const currentUrl = this.router.url;
      if (currentUrl.includes('my-responses')) {
        this.loadFormDataSubmissions();
      } else {
        this.loadFormData();
      }
    });
  }

  loadFormData() {
    if (this.formId !== null) {
      this.formService.getFormById(this.formId).subscribe(form => {
        this.selectedForm = form;
      });

      this.responseService.getResponsesByFormId(this.formId).subscribe(responses => {
        this.responses = responses.map(response => {
          try {
            const parsedData = JSON.parse(response.responseData);
            response.isAnonymous = parsedData?.[0]?.isAnonymous ?? false;
          } catch (error) {
            console.error('Error parsing responseData:', error);
            response.isAnonymous = false;
          }
          return response;
        });
        this.processSubmissionTrends();
        this.processQuestionResponses();
      });
    }
  }

  loadFormDataSubmissions() {
    if (this.formId !== null) {
      this.formService.getFormById(this.formId).subscribe(form => {
        this.selectedForm = form;
      });

      this.responseService.getResponsesByFormIdandUser(this.formId).subscribe(responses => {
        this.responses = responses;
        this.processSubmissionTrends();
        this.processQuestionResponses();
      });
    }
  }

  processSubmissionTrends() {
    const trendMap = new Map<string, number>();
    
    this.responses.forEach(response => {
      const date = new Date(response.submittedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      trendMap.set(date, (trendMap.get(date) || 0) + 1);
    });

    // Convert Map to array for ngx-charts and sort by date
    this.submissionTrend = Array.from(trendMap.entries())
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
  }

  processQuestionResponses() {
    // Temporary storage for aggregating responses
    const tempQuestionData: { [key: string]: Map<string, number> } = {};

    this.responses.forEach(response => {
      const questions = this.getQuestions(response);
      
      questions.forEach((question: any) => {
        const questionText = question.question;
        const answer = Array.isArray(question.answers) 
          ? question.answers.join(', ') 
          : question.answers?.toString() || 'No Answer';

        if (!tempQuestionData[questionText]) {
          tempQuestionData[questionText] = new Map<string, number>();
        }

        tempQuestionData[questionText].set(
          answer,
          (tempQuestionData[questionText].get(answer) || 0) + 1
        );
      });
    });

    // Convert to ngx-charts format
    this.questionResponseData = {};
    Object.keys(tempQuestionData).forEach(question => {
      this.questionResponseData[question] = Array.from(
        tempQuestionData[question].entries()
      ).map(([name, value]) => ({
        name,
        value
      }));
    });
  }

  getQuestions(response: any): any[] {
    try {
      const parsed = JSON.parse(response.responseData);
      let allQuestions: any[] = [];
      parsed.forEach((section: any) => {
        if (Array.isArray(section.responses)) {
          allQuestions = allQuestions.concat(section.responses);
        }
      });
      return allQuestions;
    } catch (e) {
      console.warn('Failed to parse responseData in getQuestions:', e);
      return [];
    }
  }}