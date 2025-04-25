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
    
    isProfileMenuOpen: boolean = false;
    isSaveMenuOpen = false;

    ngOnInit() {
        // using firstRender to remove side drawer from DOM until page is ready
        window.scrollTo(0, 0);
        setTimeout(() => {
            this.firstRender=false;
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


    onSaveAsTemplateClick() {
        this.saveAsTemplateClicked.emit();
    }

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
    
    //* Handling publish button click
    @Output() publishClicked = new EventEmitter<void>();
    onSaveClick(){
        this.publishClicked.emit();
    }

    //* Handling preview button click
    @Output() onPreviewClicked = new EventEmitter<void>();
    onPreviewClick(){
        this.onPreviewClicked.emit();

        //Open New tab
        window.open('/form-preview', '_blank')
    }

    // drawer function
    toggleDrawer(){
        this.isDrawerOpen=!this.isDrawerOpen;
    }

    // profile menu function
    toggleProfileMenu() {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
    }

    // save menu function
    toggleSaveMenu() {
        this.isSaveMenuOpen = !this.isSaveMenuOpen;
    }
}
