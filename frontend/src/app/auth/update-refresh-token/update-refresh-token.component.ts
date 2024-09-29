import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { SpinnerService } from '../../services/spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jwtDecode } from "jwt-decode";
import moment from 'moment';

@Component({
  selector: 'app-update-refresh-token',
  templateUrl: './update-refresh-token.component.html',
  styleUrls: ['./update-refresh-token.component.scss'],
})
export class UpdateRefreshTokenComponent implements OnInit, OnDestroy {
  isAuth$ = new Observable<boolean>();
  error = null;

  form = new FormGroup({
    newRefreshToken: new FormControl(
      { value: '', disabled: false },
      Validators.required
    ),
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
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  async onSubmit(): Promise<void> {
    const newRefreshToken = this.form.get('newRefreshToken')?.value as string;
    let isTokenValid = false;

    try {
      const decodedToken = jwtDecode(newRefreshToken) as any;
      const diffToNow = moment
        .duration(moment.unix(decodedToken.exp).diff(moment().toDate()))
        .asMinutes();

      if (diffToNow > 0) {
        isTokenValid = true;
      }
    } catch (e) {
      console.log(e);
      this.matSnackBar.open((e as Error)?.message, '', {
        duration: 3000,
      });
    }

    if (isTokenValid) {
      try {
        await this.authService.updateRefreshToken(newRefreshToken).toPromise();
        await this.router.navigate(['dashboard']);
      } catch (e) {
        console.log(e);
        throw e;
      }
    } else {
      this.matSnackBar.open('invalid token', '', {
        duration: 3000,
      });
    }
  }
}
