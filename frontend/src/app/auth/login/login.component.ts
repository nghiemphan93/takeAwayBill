import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isAuth$ = new Observable<boolean>();
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private authService: AuthService,
              private router: Router) {
  }

  ngOnInit() {
    this.isAuth$ = this.authService.getAuth();

    this.isAuth$.subscribe(async isAuth => {
      if (isAuth) {
        await this.router.navigate(['dashboard']);
      }
    })
  }

  async onLogin(): Promise<void> {
    try {
      await this.authService.login(this.loginForm.value.username, this.loginForm.value.password);
      await this.router.navigate(['dashboard']);
    } catch (e) {
      console.log(e);
      alert(`${e.statusText} ${e.message}`);
    }
  }

  async onLogOut(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (e) {
      console.log(e);
      alert(`${e.statusText} ${e.message}`);
    }
  }

}
