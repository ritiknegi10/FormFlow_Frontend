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

  constructor(private route: ActivatedRoute, 
              private fb: FormBuilder, 
              private formService: FormService, 
              private router: Router ) {
      this.form = this.fb.group({
        title: '',
        description: '',
        sections: this.fb.array([])
      });
  }
  
  ngOnInit() {
    window.scrollTo(0, 0);
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
      // console.log(versionsList);

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

        //console.log(questions);

        this.form.patchValue({
            title: versionData.title,
            descriptio: versionData.description
        });

        const formSchema = JSON.parse(versionData.formSchema);
        // console.log("form schema");
        // console.log(formSchema)

        const sectionsArray = (formSchema.sections || []).map((section: any) => {
            const questions = section.questions.map((field:any) =>{
                return this.fb.group({
                    questionText: field.questionText,
                    questionDescription: '',
                    type: field.type,
                    required: field.required,
                    options: this.fb.array(
                        (field.options || []).map((option: any) => 
                            this.fb.group({
                                label: option.label,
                                goToSection: option.goToSection || null
                            })
                        )
                    ),
                    rating: field.rating || 5,
                    startValue: [field.startValue ?? 0],
                    endValue: [field.endValue ?? 5],
                    rows: this.fb.array(field.rows || []),         
                    columns: this.fb.array(field.columns || []),   
                    fileUrl: [field.fileUrl || ''], 
                    sectionBasedonAnswer: field.sectionBasedonAnswer || false
                });
            });
            return this.fb.group({
                sectionTitle: section.sectionTitle,
                sectionDescription: section.sectionDescription,
                nextSection: section.nextSection,
                questions: this.fb.array(questions)
            });
        });

        this.form.setControl('sections', this.fb.array(sectionsArray));
        
        // this.form = this.fb.group({
        //   title: new FormControl(versionData.title || ''),
        //   description: new FormControl(versionData.description || ''),
        //   sections: this.fb.array(formSchema.sections.map((s: any) => {
        //     return this.createSectionGroup(s);
        //   })),
        // });

        this.form.disable();
        this.currentFormVersion = versionData;
        // console.log("current form version")
        // console.log(this.currentFormVersion);
    });
  }

  get sections(): FormArray{
    return this.form.get('sections') as FormArray;
  }

  getQuestionsControl(section: any): FormArray{
    return section.get('questions') as FormArray;
  }

  getOptions(question: any): FormArray{
    return question.get('options') as FormArray;
  }

  getStarsArray(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  onVersionChange() {
    this.loadFormVersion(this.selectedVersion);
  }

  cloneVersion() {
    this.router.navigate([`/edit/${this.currentFormVersion.id}`]);
  }

}
