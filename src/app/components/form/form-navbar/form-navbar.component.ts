import { Component, OnInit } from '@angular/core';
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
            // hide app component on /create
            this.currentUrl = event.url;
        });
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
