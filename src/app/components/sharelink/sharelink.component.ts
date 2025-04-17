import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from 'src/app/services/response.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-sharelink',
  templateUrl: './sharelink.component.html',
  styleUrls: ['./sharelink.component.scss']
})
export class SharelinkComponent implements OnInit {
  formId!: number;
  formData: any;
  formIndex!: number;
  answers: any[] = [];
  parsedFormSchema: any = { fields: [] };
  submitClicked: boolean=false;
  touchedFields: boolean[] = [];
  uploadedFiles: boolean[] = [];
  uploadedFileNames: string[] = [];
  invalidtype:boolean[]=[];
  invalidsize:boolean[]=[];




  constructor(private route: ActivatedRoute, private formService: FormService, private router: Router, private responseService: ResponseService) { }

  

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const formId = Number(params.get('id'));
      if (formId !== null) {
        this.formService.getFormById(Number(formId)).subscribe(form => {
          this.formData = form;
          this.formId = formId;
          this.formData.formSchema = JSON.parse(this.formData.formSchema); 
          this.formData.formSchema.fields.forEach((field: any, index: number) => {
            if (field.type === 'linearscale') {
              // Set fallback values if not defined
              field.startValue = field.startValue ?? 0;
              field.endValue = field.endValue ?? 5;
            }
          });
          
          this.answers = this.formData.formSchema.fields.map((field: any) => {
            if (field.type === 'multipleChoiceGrid') {
              return new Array(field.rows.length).fill(null);  
            }else if (field.type === 'checkboxGrid') {
                return new Array(field.rows.length).fill(null).map(() => []);
            } else {
              return null;
            }
          });
          
          console.log("Fetched Form Data:", this.formData);
        });
      }
    });
  }

  updateCheckbox(index: number, option: string, event: any) {
    if (!this.answers[index]) {
      this.answers[index] = [];
    }
    if (event.target.checked) {

      this.answers[index].push(option);
    } else {

      this.answers[index] = this.answers[index].filter((item: string) => item !== option);
    }
  }
  isGridQuestionInvalid(i: number, question: any): boolean {
    if (!question || !question.required || !Array.isArray(this.answers[i])) return false;
    return (this.submitClicked || this.touchedFields[i]) && this.answers[i].some((val: any) => val === null);
  }
   
  
  isCheckboxGridInvalid(i: number, question: any): boolean {
    if (!question || !question.required || !Array.isArray(this.answers[i])) return false;
    return (this.submitClicked || this.touchedFields[i]) &&
           this.answers[i].some((row: any) => !Array.isArray(row) || row.length === 0);
  }
  
  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
  
    const file = input.files[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;
  
    if (!allowedTypes.includes(file.type)) {
      this.invalidtype[index]= true;
      input.value = '';
      return;
    }
  
    if (file.size > maxSize) {
      this.invalidsize[index]=true;
      input.value = '';
      return;
    }
    this.invalidsize[index]=false;
    this.invalidtype[index]= false;


    //const fileUrl = URL.createObjectURL(file);
    //console.log(fileUrl);
    this.uploadedFileNames[index] = file.name;
    this.uploadedFiles[index] = true;
    //this.answers[index] = fileUrl;
    this.formService.uploadFile(file).subscribe({
      next: (fileUrl: string) => {
        console.log('File uploaded, URL:', fileUrl);
        this.answers[index] = fileUrl; 
      }
      // error: (err) => {
      //   console.error('File upload failed:', err);
      //   this.uploadedFiles[index] = false;
      //   alert('Failed to upload file.');
      // }
    });
    
  }
  
  onDeleteFile(index: number): void { 
    this.uploadedFiles[index] = false;
    this.uploadedFileNames[index] = '';
    const fileUrl = this.answers[index];
    this.answers[index]='';
    this.formService.deleteFile(fileUrl).subscribe({
      next: () => {
        console.log('File deleted from backend');
      },
      error: (err) => {
        console.error('Error deleting file:', err);
      }
    });
  }
  
  
  


  // Handle ratings
  ratingValue = 0;
  ratingStars(n: number): Array<number> {
    // console.log("in ratingStars function");
    // console.log(n);
    return Array(n);
  }
  updateRatingValue(n: number) {
    console.log(n);
    this.ratingValue = n;
  }

  markAsTouched(index: number) {
    this.touchedFields[index] = true;
  }

  toggleCheckbox(questionIndex: number, rowIndex: number, column: string): void {
  const current: string[] = this.answers[questionIndex][rowIndex] || [];

  if (current.includes(column)) {
    this.answers[questionIndex][rowIndex] = current.filter((item: string) => item !== column);
  } else {
    this.answers[questionIndex][rowIndex] = [...current, column];
  }
} 
  
  submitForm() {
    this.submitClicked=true;
    const missingAnswers = this.formData.formSchema.fields.some((question: any, index: number) => {
      return question.required && (this.answers[index] === null || this.answers[index] === '' ||
        (Array.isArray(this.answers[index]) && this.answers[index].length === 0));
    });

    const hasUnansweredGrid = this.formData.formSchema.fields.some((question: any, index: number) => {
      if (!question.required) return false;

      if (question.type === 'multipleChoiceGrid') {
        return Array.isArray(this.answers[index]) && this.answers[index].some((val: any) => val === null);
      }
      if (question.type === 'checkboxGrid') {
        return Array.isArray(this.answers[index]) && this.answers[index].some((row: any) => !Array.isArray(row) || row.length === 0);
      }
      return false;
    });
    
    
    if (missingAnswers || hasUnansweredGrid ) {
      return;
    }

  
    console.log(this.answers)
    const mappedResponse = this.formData.formSchema.fields.reduce((acc: Record<string, any>, field: any, index: number) => {
      const answer = this.answers[index];
      if (answer !== null && answer !== undefined) {
        acc[field.label] = Array.isArray(answer) ? answer : answer.toString(); // Keep arrays, convert others to strings
      }
      return acc;
    }, {});

    Swal.fire({
      icon: 'success',
      title: 'Form Submitted!',
      text: 'Your responses have been recorded successfully.',
      confirmButtonColor: '#4CAF50', // Green color
    });    
    this.responseService.submitResponse(this.formId, mappedResponse);
    this.router.navigate(['/submit', this.formData.title]);
  }



}
