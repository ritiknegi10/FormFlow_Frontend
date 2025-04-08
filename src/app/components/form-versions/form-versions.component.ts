import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { FormService } from '../../services/form.service';

@Component({
  selector: 'app-form-versions',
  templateUrl: './form-versions.component.html',
  styleUrls: ['./form-versions.component.scss']
})
export class FormVersionsComponent implements OnInit {

  form!: FormGroup;
  formIndex!: number;
  versionNumber!: number;
  selectedVersion!: number;
  versions: number[] = [];
  currentFormVersion!: any;
  ratingOptions: number[] = [3, 4, 5, 6, 7, 8, 9, 10];

  constructor( private route: ActivatedRoute, private fb: FormBuilder, private formService: FormService, private router: Router ) {}
  
  ngOnInit() {
    this.route.paramMap.subscribe(params => {

      this.formIndex = Number(params.get("formId"));
      this.versionNumber = Number(params.get("formVersion"));
      this.loadVersions();
      
    })
  }

  loadVersions() {
    //console.log("getting form versions...");
    this.formService.getFormVersions(this.formIndex).subscribe((formVersions) => {
      
      if(!formVersions) {
        console.error("No versions found", formVersions);
        return;
      }
      const versionsList: any = formVersions; 
      console.log(versionsList);

      // initialise and sort array of version numbers 
      this.versions = versionsList.map((vers: any) => vers.version).sort((a: number, b: number) => b-a); 
      
      //select latest version and load form
      this.selectedVersion = this.versions[0]; 
      this.loadFormVersion(this.selectedVersion);
    });
  }

  loadFormVersion(version: number) {
    this.formService.getFormByVersion(this.formIndex, version).subscribe((versionData) => {
      if(!versionData) {
        console.error("Version not found", versionData);
        return;
      }

      const formSchema = JSON.parse(versionData.formSchema);
      const questions = formSchema.fields;
      //console.log(questions);
      
      this.form = this.fb.group({
        title: new FormControl(versionData.title || ''),
        description: new FormControl(versionData.description || ''),
        questions: this.fb.array(questions.map((q: any) => {
          return this.createQuestionGroup(q);
        })),
      }); 
      this.form.disable();
      this.currentFormVersion = versionData;
      console.log(this.currentFormVersion);
    });
  }

  createQuestionGroup(question: any): FormGroup {
    const questionGroup = this.fb.group({ 
      questionText: new FormControl(question.label || ''),
      type: new FormControl(question.type || 'shortText'),
      required: new FormControl(question.required || false),
      options: this.fb.array(question.options ? question.options.map((opt: any) => new FormControl(opt)) : []),
      rating: new FormControl(question.rating || 5)
    });
    return questionGroup;
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }
  getOptions(question: any): FormArray {
      return question.get('options') as FormArray;
  }

  onVersionChange() {
    this.loadFormVersion(this.selectedVersion);
  }

  cloneVersion() {
    this.router.navigate([`/edit/${this.currentFormVersion.id}`]);
  }

}
