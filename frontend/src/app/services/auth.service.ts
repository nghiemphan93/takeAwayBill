import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, delay, map, retryWhen, take } from 'rxjs/operators';
import { SpinnerService } from './spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import moment from 'moment';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = 'https://take-away-bill.herokuapp.com';
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private spinnerService: SpinnerService,
    private matSnackBar: MatSnackBar
  ) {
    if (isDevMode()) {
      this.baseUrl = 'http://localhost:5005';
    }

    // this.getAuth().subscribe(async (isAuth) => {
    //   if (isAuth) {
    //     await this.router.navigate(['dashboard']);
    //   } else {
    //     await this.router.navigate(['login']);
    //   }
    // });
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAuth(): Observable<boolean> {
    return this.isAuth.asObservable();
  }

  setNotAuthenticated(): void {
    this.isAuth.next(false);
    localStorage.removeItem('token');
  }

  setAuthenticated(token: string): void {
    localStorage.setItem('token', token);
    this.isAuth.next(true);
  }

  clearSessionCache(): void {
    sessionStorage.clear();
  }

  /**
   * Send POST Request to Server to log user in
   * Set new value of iAuth to true and notify other components via Observable
   *
   * @param username
   * @param password
   *
   */
  async login(username: string, password: string): Promise<void> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    // @ts-ignore
    const { token } = await this.http
      .post(`${this.baseUrl}/login`, formData)
      .pipe(
        retryWhen((errors) => {
          let retries = 0;
          return errors.pipe(
            delay(1000),
            take(5),
            map((error) => {
              if (retries++ === 4) {
                throw error;
              }
            })
          );
        }),
        catchError((err) => {
          console.log('login failed 401: ' + JSON.stringify(err));
          this.setNotAuthenticated();
          this.matSnackBar.open('Netzwerkfehler, bitte nochmal anmelden!', '', {
            duration: 3000,
          });
          return throwError(err);
        })
      )
      .toPromise();
    this.setAuthenticated(token);
  }

  /**
   * Send GET Request to Server to log user out
   * Set new value of iAuth to false and notify other components via Observable
   */
  async logout(): Promise<void> {
    const token = localStorage.getItem('token');
    // @ts-ignore
    const httpOptions = { headers: new HttpHeaders({ token }) };
    await this.http
      .get(`${this.baseUrl}/logout`, httpOptions)
      .pipe(
        retryWhen((errors) => {
          let retries = 0;
          return errors.pipe(
            delay(1000),
            take(5),
            map((error) => {
              if (retries++ === 4) {
                throw error;
              }
            })
          );
        }),
        catchError((err) => {
          console.log('logout failed 401: ' + JSON.stringify(err));
          this.setNotAuthenticated();
          this.matSnackBar.open('Netzwerkfehler, bitte nochmal anmelden!', '', {
            duration: 3000,
          });
          return throwError(err);
        })
      )
      .toPromise();
    this.setNotAuthenticated();
  }

  /**
   * Initialize auth status for the whole application
   */
  async initAuth(): Promise<void> {
    try {
      this.spinnerService.show();
      this.clearSessionCache();
      const token = localStorage.getItem('token');
      if (token) {
        const expiredTime = moment
          .duration(this.calculateDuration(token))
          .asMinutes();
        if (expiredTime > 0) {
          this.isAuth.next(true);
        }
      }
    } catch (e) {
      console.error(e.message);
      this.matSnackBar.open(e.message, '', {
        duration: 3000,
      });
    } finally {
      this.spinnerService.hide();
    }
  }

  /**
   * Calculate new time until token expires
   * @param token
   */
  private calculateDuration = (token: string): number => {
    const decodedToken = jwt_decode(token) as any;
    return moment.unix(decodedToken.exp).diff(moment().toDate());
  };
}
