import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../services/form.service';
import { ResponseService } from '../../services/response.service';
import Swal from 'sweetalert2';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-sharelink',
  templateUrl: './sharelink.component.html',
  styleUrls: ['./sharelink.component.scss']
})
export class SharelinkComponent implements OnInit {
    formId!:number;
    currentSectionIndex: number = 0;
    loadedForm: FormGroup;
    formSchema: any;
    sections: any[] = [];
    uploadedFiles: boolean[][] = [];
    uploadedFileNames: string[][] = [];
    invalidtype:boolean[][]=[];
    invalidsize:boolean[][]=[];
    submitClicked:boolean=false;
    nextSectionData: { [key: number]: number } = {};
    isFormLoaded: boolean = false;
    responses: { [sectionIndex: number]: { [questionIndex: number]: any } } = {};
    hoverRating: number = 0;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private formService: FormService,
        private router: Router,
        private responseService: ResponseService
    ) {
        this.loadedForm = this.fb.group({
            title: 'Untitled Form',
            description: '',
            sections: this.fb.array([])
        });
    }

    ngOnInit() {
        this.formId = Number(this.route.snapshot.paramMap.get('id'));
        if(this.formId){
            this.formService.checkFormAccess(this.formId).subscribe({
                next: (response: string) => {
                    if(response==='Access granted'){
                        console.log('Access granted! Proceeding with form submission.');
                    }
                },
                error: (error) => {  
                    if (error.status === 404)
                        this.router.navigate(['/error', 404]);
                    else if (error.status === 403)
                        this.router.navigate(['/error', 403]);
                    else if (error.status === 409)
                        this.router.navigate(['/error', 409]); //!---***---
                }
            });

            this.formService.getFormById(this.formId).subscribe({
                next: (form) => {
                    this.loadedForm.patchValue({
                        title: form.title,
                        description: form.description,
                    });
                    // console.log("form decription: ", form.description);
                    // console.log("original schema: ", form.formSchema);
                    this.formSchema = typeof form.formSchema === 'string'
                                    ? JSON.parse(form.formSchema)
                                    : form.formSchema;
                    this.sections = this.formSchema.sections;
                    this.uploadedFiles = this.sections.map(section =>
                      section.questions.map(() => false)
                    );
                    this.uploadedFileNames = this.sections.map(section =>
                      section.questions.map(() => '')
                    );
                    this.invalidsize = this.sections.map(section =>
                      section.questions.map(() => false)
                    );
                    this.invalidtype = this.sections.map(section =>
                      section.questions.map(() => false)
                    );

                    // console.log("loaded form: ", this.loadedForm);
                    // console.log("form schema: ", this.formSchema);
                    // console.log("sections: ", this.sections);

                    this.sections.forEach((section, sIdx) => {
                        this.nextSectionData[sIdx] = section.nextSection;
                        // console.log("Section questions", section.questions);

                        this.responses[sIdx] = {};
                        section.questions.forEach((question: any, qIdx: number) => {
                            // initialising response as empty string
                            if(question.type === 'checkboxes'){
                                this.responses[sIdx][qIdx] = {}
                                question.options.forEach((option: any) => {
                                    this.responses[sIdx][qIdx][option.label] = false
                                });
                            }
                            else if(question.type === 'multipleChoiceGrid' || question.type === 'checkboxGrid'){
                                this.responses[sIdx][qIdx] = {}
                                if(question.type === 'checkboxGrid'){
                                    question.rows.forEach((row: any) => {
                                        this.responses[sIdx][qIdx][row] = {}
                                        question.columns.forEach((column: any) => {
                                            this.responses[sIdx][qIdx][row][column] = false;
                                        });
                                    });
                                }
                            }
                            else{
                                this.responses[sIdx][qIdx] = '';
                            }
                        });
                    });
                    // console.log("responses", this.responses);
                    // console.log("next section data: ", this.nextSectionData);

                    this.isFormLoaded = true;
                }
            });
        }
        else{
            console.log("no form id found in route")
        }
    }

    gotoNextSection(sIdx: number = this.currentSectionIndex) {

        //* question required or not
        // for (let qIdx = 0; qIdx < this.sections[sIdx].questions.length; qIdx++) {
        //     const question = this.sections[sIdx].questions[qIdx]
        //     if(question.required && (!this.responses[sIdx] || this.responses[sIdx][qIdx] === '' || this.responses[sIdx][qIdx] == null)){
        //         return;
        //     }
        // }


        this.currentSectionIndex = this.nextSectionData[this.currentSectionIndex];
        window.scroll(0,0);
    }
    onFileSelected(event: Event, sectionIndex: number, qIdx: number): void {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;
    
      const file = input.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB
    
      if (!allowedTypes.includes(file.type)) {
        this.invalidtype[sectionIndex][qIdx] = true;
        input.value = '';
        return;
      }
    
      if (file.size > maxSize) {
        this.invalidsize[sectionIndex][qIdx] = true;
        input.value = '';
        return;
      }
    
      this.invalidtype[sectionIndex][qIdx] = false;
      this.invalidsize[sectionIndex][qIdx] = false;
    
      this.uploadedFileNames[sectionIndex][qIdx] = file.name;
      this.uploadedFiles[sectionIndex][qIdx] = true;
    
      this.formService.uploadFile(file).subscribe({
        next: (fileUrl: string) => {
          console.log('File uploaded, URL:', fileUrl);
          this.responses[sectionIndex][qIdx] = fileUrl;
        },
        error: (err) => {
          console.error('File upload failed:', err);
          this.uploadedFiles[sectionIndex][qIdx] = false;
          alert('Failed to upload file.');
        }
      });
    }
    onDeleteFile(sectionIndex: number, qIdx: number): void {
      const fileUrl = this.responses?.[sectionIndex]?.[qIdx];
      this.uploadedFiles[sectionIndex][qIdx] = false;
      this.uploadedFileNames[sectionIndex][qIdx] = '';
      if (this.responses?.[sectionIndex]) {
        this.responses[sectionIndex][qIdx] = '';
      }
      if (fileUrl) {
        this.formService.deleteFile(fileUrl).subscribe({
          next: () => {
            console.log('File deleted from backend');
          },
          error: (err) => {
            console.error('Error deleting file:', err);
          }
        });
      }
    }

    gotoPreviousSection() {
        if(this.currentSectionIndex > 0) {
            this.currentSectionIndex--;
            window.scroll(0,0);
        }
    }

    getratingRange(question: any): number[]{
        const range: number[] = [];
        for(let i=1; i<=question.rating; i++)
            range.push(i)
        return range;
    }

    setRating(rate: number, qIdx: number){
        this.responses[this.currentSectionIndex][qIdx] = rate;
    }

    clearRating(qIdx: number){
        this.responses[this.currentSectionIndex][qIdx] = 0;
    }

    getScaleRange(question: any): number[]{
        const range: number[] = [];
        for(let i=question.startValue; i<=question.endValue; i++)
            range.push(i);
        return range;
    }

    setLinearScale(i: number, qIdx: number){
        this.responses[this.currentSectionIndex][qIdx] = i;
    }

    setMultiplechoiceGridResponse(row: string, column: string, qIdx: number){
        this.responses[this.currentSectionIndex][qIdx][row] = column;
    }

    onAnswerSelected(option: any, question: any) {
        if (!question.sectionBasedonAnswer) return;

        const gotoSectionIndex = option.goToSection;
        if (gotoSectionIndex !== undefined && gotoSectionIndex !== -1) {
            this.nextSectionData[this.currentSectionIndex] = gotoSectionIndex;
            // console.log(`Setting next section to ${gotoSectionIndex} based on option ${option.label}`);
        }
        if(gotoSectionIndex === -1) {
            console.log("submit form section");
        }
    }

    confirmClearForm(formRef: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will erase all answers from your form, and cannot be undone',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, clear form',
        }).then((result) => {
            if (result.isConfirmed) {
                this.clearForm(formRef);
            }
        });
    }

    clearForm(formRef: any) {
        formRef.resetForm();
    }

    onSubmit(){

      this.submitClicked=true;
        const mappedResponse = this.sections.map((section: any, sIdx: number) => {
            const questions = section.questions.map((question: any, qidx: number) => {
                return{
                    questiontext: question.questionText,
                    response: this.responses[sIdx][qidx]
                };
            });
            return{
                section: section.sectionTitle,
                index: sIdx,
                questions
            };
        });
        this.responseService.submitResponse(this.formId, JSON.stringify(mappedResponse)).subscribe({
            next: (res) => {
                console.log('Response submitted successfully', res);
                this.router.navigate(['/submit', this.loadedForm.get('title')?.value], { replaceUrl: true });
            },
            error: (err) => {
                console.error('Submission error:', err)
                this.router.navigate(['/error', err.status]);
            }
        });
    }
}