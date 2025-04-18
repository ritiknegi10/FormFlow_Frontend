import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-form-navbar',
  templateUrl: './form-navbar.component.html',
  styleUrls: ['./form-navbar.component.scss']
})
export class FormNavbarComponent implements OnInit {
    currentUrl!: string;
    //* ******side drawer******
    isDrawerOpen: boolean = false;
    firstRender: boolean = true;

    //* *****Profile Menu******
    isProfileMenuOpen = false;

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
            this.formTitleChange.emit('Untitled Form');
        }
    }
    
    //* Handling publish button click
    @Output() publishClicked = new EventEmitter<void>();
    onPublishClick(){
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
}
