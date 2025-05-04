import { Component, OnInit, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-navbar',
  templateUrl: './form-navbar.component.html',
  styleUrls: ['./form-navbar.component.scss']
})
export class FormNavbarComponent implements OnInit {

    currentUrl!: string;
    isTemplateMode = false;
    isDraftMode = false;
    isEditMode = false;

    // side drawer
    isDrawerOpen: boolean = false;
    firstRender: boolean = true;
    isSaveMenuOpen = false;

    constructor(private router: Router, private eRef: ElementRef, private route: ActivatedRoute) {
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
            this.currentUrl = event.url;
        });
    }

    ngOnInit() {
        // using firstRender to remove side drawer from DOM until page is ready
        window.scrollTo(0, 0);
        setTimeout(() => {
            this.firstRender = false;
        }, 0);

        this.route.queryParams.subscribe(params => {

            const templateId = params['templateId'];
            const draftId = params['draftId'];

            if(templateId) this.isTemplateMode = true;
            if(draftId) this.isDraftMode = true;
        });
    }

    

    confirmNavigateAway(targetRoute: string) {
        Swal.fire({
            title: 'Do you want to save your changes?',
            text: 'If you leave now, your unsaved changes will be lost.',
            icon: 'warning',
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Save and Exit',
            denyButtonText: `Don't Save`,
            cancelButtonText: 'Go Back',
            confirmButtonColor: '#3085d6',
            denyButtonColor: '#d33',
            cancelButtonColor: '#aaa'
        }).then((result) => {
            if (result.isConfirmed) {
                this.onSaveClick();  // save form
                this.router.navigate([targetRoute]);
            } else if (result.isDenied) {
                this.router.navigate([targetRoute]);
            }
            // if canceled, do nothing
        });
    }

    //* Handling Form Title change
    @Input() formTitle: string = '';
    @Output() formTitleChange = new EventEmitter<string>();

    onTitleChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.formTitleChange.emit(input.value);
    }

    onTitleBlur(event: FocusEvent) {
        const input = event.target as HTMLInputElement;
        if (!input.value.trim()) {
            input.value = 'Untitled Form';
            this.formTitleChange.emit(input.value);
        }
    }
    
    //* Handling save button click
    @Output() saveClicked = new EventEmitter<boolean>();
    onSaveClick(shouldNavigate: boolean = false) {
        this.saveClicked.emit(shouldNavigate);
    }

    //* Handling save as template button click
    @Output() saveAsTemplateClicked = new EventEmitter<boolean>();
    onSaveAsTemplateClick(shouldNavigate: boolean = false) {
        this.saveAsTemplateClicked.emit(shouldNavigate);
    }

    //* Handling save draft button click
    @Output() saveDraftClicked = new EventEmitter<boolean>();
    onSaveDraftClick(shouldNavigate: boolean = false) {
        this.saveDraftClicked.emit(shouldNavigate);
    }

    //* Handling preview button click
    @Output() previewClicked = new EventEmitter<void>();
    onPreviewClick() {
        this.previewClicked.emit();
        //Open New tab
        window.open('/form-preview', '_blank')
    }

    //* Handling copyLink button click
    @Output() copyLinkCliked = new EventEmitter<number>();
    onCopyLinkClick() {

    }

    //* Handling form assign button click
    @Output() assignFormClicked = new EventEmitter<number>();
    onAssignFormClicked() {

    }

    // drawer function
    toggleDrawer() {
        this.isDrawerOpen = !this.isDrawerOpen;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
      if (!this.eRef.nativeElement.contains(event.target)) {
        this.isSaveMenuOpen = false;
      }
    }

    // save menu function
    toggleSaveMenu() {
        if(this.currentUrl !== '/create' && !this.isDraftMode) this.onSaveClick(true);
        else this.isSaveMenuOpen = !this.isSaveMenuOpen;
    }
}
