import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from 'src/app/services/response.service';

@Component({
  selector: 'app-analytics-charts',
  templateUrl: './analytics-charts.component.html',
  styleUrls: ['./analytics-charts.component.scss']
})
export class AnalyticsChartsComponent implements OnInit {
  formId: number | null = null;
  selectedForm: any = null;  
  responses: any[] = [];  
  submissionTrend: any[] = [];
  questionResponseData: any = {};

  constructor(private route: ActivatedRoute, private formService: FormService, private responseService: ResponseService, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.formId = Number(params.get('id')); 
      const currentUrl = this.router.url;
      if (currentUrl.includes('my-responses')){
        this.loadFormDataSubmissions()
      }else{
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
        this.responses = responses;
        this.processSubmissionTrend();
        this.processQuestionResponses();
      });
    }
  }

  loadFormDataSubmissions(){
    if (this.formId !== null) {
      this.formService.getFormById(this.formId).subscribe(form => {
        this.selectedForm = form;
      });
  
      this.responseService.getResponsesByFormIdandUser(this.formId).subscribe(responses => {
        this.responses = responses;
        console.log(responses)
      });
    }
  }

  processSubmissionTrend() {
    const trendMap: { [date: string]: number } = {};
    
    this.responses.forEach(response => {
      const date = new Date(response.submittedAt).toLocaleDateString();
      trendMap[date] = (trendMap[date] || 0) + 1;
    });
  
    const trendArray = Object.keys(trendMap).map(date => ({
      name: date,
      value: trendMap[date]
    }));
  
    this.submissionTrend = [
      {
        name: 'Submissions',
        series: trendArray
      }
    ];
  }
  

  processQuestionResponses() {
    const responseCounts: { [key: string]: { [option: string]: number } } = {};
    
    this.responses.forEach(response => {
      try {
        const responseData = JSON.parse(response.responseData);
        Object.keys(responseData).forEach(key => {
          if (!responseCounts[key]) {
            responseCounts[key] = {};
          }
          const answer = responseData[key];
          responseCounts[key][answer] = (responseCounts[key][answer] || 0) + 1;
        });
      } catch (error) {
        console.error("Error parsing responseData:", error);
      }
    });

    this.questionResponseData = Object.keys(responseCounts).map(question => ({
      question,
      data: Object.keys(responseCounts[question]).map(option => ({
        name: option,
        value: responseCounts[question][option]
      }))
    }));
  }
}
