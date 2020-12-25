import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {fromEvent, Observable, of, pipe} from "rxjs";
import {Router} from "@angular/router";
import {SpinnerService} from "../../services/spinner.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isAuth$ = new Observable<boolean>();

  constructor(private authService: AuthService,
              private router: Router,
              private spinnerService: SpinnerService) {
  }

  ngOnInit(): void {
    this.isAuth$ = this.authService.getAuth();
  }

  async onLogOut() {
    this.spinnerService.show();
    try {
      await this.authService.logout();
      await this.router.navigate(['login']);
    } catch (e) {
    }
    this.spinnerService.hide();
  }
}
