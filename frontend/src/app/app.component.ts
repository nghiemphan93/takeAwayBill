import {Component} from '@angular/core';
import {AuthService} from './services/auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import localeDe from '@angular/common/locales/de';
import {registerLocaleData} from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isAuth$ = new Observable<boolean>();

  constructor(private authService: AuthService,
              private router: Router) {
    registerLocaleData(localeDe);

    this.authService.initAuth().then();
    this.isAuth$ = this.authService.getAuth();
  }
}
