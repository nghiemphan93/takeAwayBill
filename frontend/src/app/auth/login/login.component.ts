import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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
export class LoginComponent implements OnInit {
  isAuth$ = new Observable<boolean>();
  error = null;

  loginForm = new FormGroup({
    username: new FormControl(
      { value: USERNAME, disabled: true },
      Validators.required
    ),
    password: new FormControl('', Validators.required),
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAuth$ = this.authService.getAuth();
  }

  async onLogin(): Promise<void> {
    try {
      this.spinnerService.show();
      const password = this.loginForm.controls.password;
      if (password.invalid) {
        throw new Error('Password is required');
      }
      await this.authService.login(USERNAME, this.loginForm.value.password);
      await this.router.navigate(['dashboard']);
    } catch (e) {
      console.error(e);
      this.matSnackBar.open(e.message, '', {
        duration: 3000,
      });
    } finally {
      this.spinnerService.hide();
    }
  }

  async onLogOut(): Promise<void> {
    try {
      this.spinnerService.show();
      await this.authService.logout();
    } catch (e) {
      console.error(e);
      this.matSnackBar.open(e.message, '', {
        duration: 3000,
      });
    } finally {
      this.spinnerService.hide();
    }
  }

  async onToDashboard(): Promise<void> {
    await this.router.navigate(['dashboard']);
  }
}
