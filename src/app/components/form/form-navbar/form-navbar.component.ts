import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-navbar',
  templateUrl: './form-navbar.component.html',
  styleUrls: ['./form-navbar.component.scss']
})
export class FormNavbarComponent implements OnInit {
    //* ******side drawer******
    isDrawerOpen: boolean = false;
    firstRender: boolean = true;

    //* *****Profile Menu******
    isProfileMenuOpen = false;

    ngOnInit() {
        // If you are editing an existing form, fetch the data
        window.scrollTo(0, 0);
        setTimeout(() => {
            this.firstRender=false;
        }, 0);
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
