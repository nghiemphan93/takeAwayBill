import {Component, ViewChild} from '@angular/core';
import {AuthService} from './services/auth.service';
import {Observable} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuth$ = new Observable<boolean>();

  constructor(private authService: AuthService,
              private router: Router) {
    this.authService.initAuth().then();
    this.isAuth$ = this.authService.getAuth();
  }
}
