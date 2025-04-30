// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FormService } from '../../services/form.service';
// import { ResponseService } from 'src/app/services/response.service';


// @Component({
//   selector: 'app-view-response',
//   templateUrl: './view-response.component.html',
//   styleUrls: ['./view-response.component.scss']
// })
// export class ViewResponseComponent implements OnInit {
//   formId: number | null = null;
//   selectedForm: any = null;  
//   responses: any[] = [];  
//   submissionTrend: any[] = [];
//   questionResponseData: any = {};

//   constructor(private route: ActivatedRoute, private formService: FormService, private responseService: ResponseService, private router: Router) {}

//   ngOnInit() {
//     this.route.paramMap.subscribe(params => {
//       this.formId = Number(params.get('id')); 
//       const currentUrl = this.router.url;
//       if (currentUrl.includes('my-responses')){
//         this.loadFormDataSubmissions()
//       }else{
//         this.loadFormData();
//       }
//     });
//   }

//   loadFormData() {
//     if (this.formId !== null) {
//       this.formService.getFormById(this.formId).subscribe(form => {
//         this.selectedForm = form;
//       });
  
//       this.responseService.getResponsesByFormId(this.formId).subscribe(responses => {
//         this.responses = responses;
//       });
//     }
//   }

//   loadFormDataSubmissions(){
//     if (this.formId !== null) {
//       this.formService.getFormById(this.formId).subscribe(form => {
//         this.selectedForm = form;
//       });
  
//       this.responseService.getResponsesByFormIdandUser(this.formId).subscribe(responses => {
//         this.responses = responses;
//         console.log(responses)
//       });
//     }
//   }
//   getKeys(response: any): string[] {
//     try {
//       return Object.keys(JSON.parse(response.responseData));
//     } catch (error) {
//       console.error("Error parsing responseData:", error);
//       return [];
//     }
//   }

  
  
//   getValue(response: any, key: string): string {
//     try {
//       const value = JSON.parse(response.responseData)[key];
  
//       if (value === null || value === undefined || value === '') return '-';
  
//       if (Array.isArray(value)) {
//         return `[ ${value.map(v => `"${v}"`).join(', ')} ]`;
//       }
  
//       if (typeof value === 'object') {
//         return JSON.stringify(value, null, 2); 
//       }
  
//       return value.toString();
//     } catch (error) {
//       console.error("Error parsing responseData:", error);
//       return '-';
//     }
//   }
  
// }
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from 'src/app/services/response.service';


@Component({
  selector: 'app-view-response',
  templateUrl: './view-response.component.html',
  styleUrls: ['./view-response.component.scss']
})
export class ViewResponseComponent implements OnInit {
  formId: number | null = null;
  selectedForm: any = null;  
  responses: any[] = [];  
  submissionTrend: any[] = [];
  questionResponseData: any = {};

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
        this.responses = responses;
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
        console.log(responses);
      });
    }
  }

  

  getQuestions(response: any): any[] {
    try {
      const parsed = JSON.parse(response.responseData);
      if (Array.isArray(parsed)) {
        // If responseData is a list of sections with questions
        return parsed.flatMap(section => section.questions || []);
      } else if (parsed.questions) {
        // If responseData is a single section with questions
        return parsed.questions;
      }
      return [];
    } catch (error) {
      console.error('Error parsing responseData:', error);
      return [];
    }
  }
  
  formatResponse(response: any): string {
    if (response === null || response === undefined || response === '') return '–';
  
    if (Array.isArray(response)) {
      return `[ ${response.map(r => `"${r}"`).join(', ')} ]`;
    }
  
    if (typeof response === 'object') {
      return JSON.stringify(response, null, 2);
    }
  
    return response.toString();
  }
  searchQuery: string = '';

filteredResponses() {
  if (!this.searchQuery) return this.responses;

  const query = this.searchQuery.toLowerCase();
  return this.responses.filter(response =>
    (response.respondentUsername || '').toLowerCase().includes(query) ||
    (response.respondentEmail || '').toLowerCase().includes(query)
  );
}
}


