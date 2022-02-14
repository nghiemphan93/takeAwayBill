import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SpinnerService } from '../../services/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';

const USERNAME = 'Golde8';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isAuth$ = new Observable<boolean>();
  error = null;

  loginForm = new FormGroup({
    username: new FormControl(
      { value: USERNAME, disabled: true },
      Validators.required
    ),
    password: new FormControl('', Validators.required),
  });
  sub = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAuth$ = this.authService.getAuth();

    this.sub.add(
      this.isAuth$.subscribe(async (isAuth) => {
        if (isAuth) {
          await this.onToDashboard();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  async onLogin(): Promise<void> {
    const password = this.loginForm.controls.password;
    if (password.invalid) {
      throw new Error('Password is required');
    }
    await this.authService.login(USERNAME, this.loginForm.value.password);
    await this.router.navigate(['dashboard']);
  }

  async onLogOut(): Promise<void> {
    await this.authService.logout();
  }

  async onToDashboard(): Promise<void> {
    await this.router.navigate(['dashboard']);
  }
}
