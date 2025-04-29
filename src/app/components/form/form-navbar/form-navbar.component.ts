import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-form-navbar',
  templateUrl: './form-navbar.component.html',
  styleUrls: ['./form-navbar.component.scss']
})
export class FormNavbarComponent implements OnInit {
    @Output() saveAsTemplateClicked = new EventEmitter<void>();

    currentUrl!: string;
    // side drawer
    isDrawerOpen: boolean = false;
    firstRender: boolean = true;
    isSaveMenuOpen = false;

    ngOnInit() {
        // using firstRender to remove side drawer from DOM until page is ready
        window.scrollTo(0, 0);
        setTimeout(() => {
            this.firstRender = false;
        }, 0);
    }

    constructor(private router: Router){
        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: any) => {
            this.currentUrl = event.url;
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
    @Output() publishClicked = new EventEmitter<void>();
    onSaveClick(){
        this.publishClicked.emit();
    }

    //* Handling save as template button click
    onSaveAsTemplateClick() {
        this.saveAsTemplateClicked.emit();
    }

    //* Handling preview button click
    @Output() onPreviewClicked = new EventEmitter<void>();
    onPreviewClick() {
        this.onPreviewClicked.emit();
        //Open New tab
        window.open('/form-preview', '_blank')
    }

    //* Handling copyLink button click
    copyLink(id: number) {   
        const baseUrl = window.location.origin; 
        const shareableLink = `${baseUrl}/sharelink/${id}`; 
        navigator.clipboard.writeText(shareableLink).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Link Copied!',
            text: 'You can now share the form link easily.',
            confirmButtonColor: '#4CAF50',
            timer: 2000, 
          });
        });
    }

    // drawer function
    toggleDrawer(){
        this.isDrawerOpen = !this.isDrawerOpen;
    }

    // save menu function
    toggleSaveMenu() {
        if(this.currentUrl === 'create') this.isSaveMenuOpen = !this.isSaveMenuOpen;
        else this.onSaveClick();
    }
}
