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
  deadline: string = '';
  minDateTime: string = '';

  // maintain order in questionTypes
  questionTypes = [
    { type: 'shortText', label: 'Short Text', icon: 'assets/question-type-icons/shortText.svg' },
    { type: 'paragraph', label: 'Paragraph', icon: 'assets/question-type-icons/paragraph.svg'},
    { type: 'multipleChoice', label: 'Multiple Choice', icon: 'assets/question-type-icons/multipleChoice.svg'},
    { type: 'checkboxes', label: 'Checkboxes', icon: 'assets/question-type-icons/checkboxes.svg'},
    { type: 'dropdown', label: 'Dropdown', icon: 'assets/question-type-icons/dropdown.svg'},
    { type: 'date', label: 'Date', icon: 'assets/question-type-icons/date.svg'},
    { type: 'time', label: 'Time', icon: 'assets/question-type-icons/time.svg'},
    { type: 'linearScale', label: 'Linear Scale', icon: 'assets/question-type-icons/linearScale.svg'},
    { type: 'multipleChoiceGrid', label: 'Multiple Choice Grid', icon: 'assets/question-type-icons/multipleChoiceGrid.svg'},
    { type: 'checkboxGrid', label: 'Checkbox Grid', icon: 'assets/question-type-icons/checkboxGrid.svg'},
    { type: 'rating', label: 'Rating', icon: 'assets/question-type-icons/rating.svg'},
    { type: 'file', label: 'File Upload', icon: 'assets/question-type-icons/file.svg'},
  ];  
  selectedTypes: { [sIdx: number]: { [qIdx: number]: any } } = {};
  isChangeDeadlinePopUp = false;
  isChangeButtonClicked = false;
  isDeadlineRemoved = false;
  isDeadlineNull = false;
  isDeadlinePast = false;
  // side drawer
  isDrawerOpen: boolean = false;
  firstRender: boolean = true;

  constructor(private route: ActivatedRoute, 
              private fb: FormBuilder, 
              private formService: FormService, 
              private router: Router ) {
      this.form = this.fb.group({
        title: '',
        description: '',
        deadline: '',
        sections: this.fb.array([])
      });
  }
  
  ngOnInit() {
    window.scrollTo(0, 0);
    setTimeout(() => {
      this.firstRender = false;
    }, 0);
    this.setMinDateTime();
    this.route.paramMap.subscribe(params => {

      this.formIndex = Number(params.get("formId"));
      this.versionNumber = Number(params.get("formVersion"));
      this.loadVersions();
      
    });
  }

  toggleDrawer(){
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  loadVersions() {
    //console.log("getting form versions...");
    this.formService.getFormVersions(this.formIndex).subscribe((formVersions) => {
      
      if(!formVersions) {
        console.error("No versions found", formVersions);
        return;
      }
      const versionsList: any = formVersions; 

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

        this.form.patchValue({
            title: versionData.title,
            description: versionData.description,
            deadline: versionData.deadline
        });

        const formSchema = JSON.parse(versionData.formSchema);
        // console.log("form schema");
        // console.log(formSchema)

        const sectionsArray = (formSchema.sections || []).map((section: any) => {
            const questions = section.questions.map((field:any) =>{
                return this.fb.group({
                    questionText: field.questionText,
                    questionDescription: field.questionDescription,
                    type: field.type,
                    required: field.required,
                    sectionBasedonAnswer: field.sectionBasedonAnswer || false,
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
        this.selectedTypes = formSchema.sections.map((section: any) => 
          section.questions.map((question: any) => {
          const found = this.questionTypes.find(q => q.type === question.type);
          return { ...found };
          })
      );
        // this.form = this.fb.group({
        //   title: new FormControl(versionData.title || ''),
        //   description: new FormControl(versionData.description || ''),
        //   sections: this.fb.array(formSchema.sections.map((s: any) => {
        //     return this.createSectionGroup(s);
        //   })),
        // });

        this.form.disable();
        this.currentFormVersion = versionData;
        console.log(this.currentFormVersion);
    });
  }

  get sections(): FormArray {
    return this.form.get('sections') as FormArray;
  }

  get oldDeadline(): any {
    return this.form.get('deadline');
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

  setMinDateTime() {
    const now = new Date();
    // Convert to ISO and remove seconds + milliseconds
    const isoString = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
    this.minDateTime = isoString;
  }

  openChangeDeadlinePopUp() {
    console.log(this.currentFormVersion);
    this.isChangeDeadlinePopUp = true;
    document.body.style.overflow = 'hidden';
  }

  closeChangeDeadlinePopUp() {
    this.isChangeDeadlinePopUp = false;
    document.body.style.overflow = 'auto';
  }

  onDeadlineInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value;

      if(inputValue) {
        this.isDeadlineNull = false;
        const inputDeadline = new Date(inputValue);
        const now = new Date();

        if (now < inputDeadline) {
          this.isDeadlinePast = false;
        }
      }
  }

  updateDeadline() {

    // Validate deadline
    if(!this.deadline && !this.isDeadlineRemoved) {
      this.isDeadlineNull = true;
      return;
    }
    const inputDeadline = new Date(this.deadline);
    const now = new Date();
    if((now > inputDeadline) && !this.isDeadlineRemoved) {
      this.isDeadlinePast = true;
      return;
    }

    this.formService.updateDeadline(this.currentFormVersion.id, this.deadline).subscribe({
      next: (response) => console.log("Deadline updated successfully successfully", response),
      error: (error) => console.error("Error updating deadline", error)
    });

    this.closeChangeDeadlinePopUp();
    this.loadFormVersion(this.currentFormVersion.version);
  }

  cloneVersion() {
    this.router.navigate([`/edit/${this.currentFormVersion.id}`]);
  }

}
