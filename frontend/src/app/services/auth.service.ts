import {Injectable, isDevMode} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Router} from '@angular/router';
import {catchError, delay, map, retryWhen, take} from 'rxjs/operators';
import {SpinnerService} from './spinner.service';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = 'https://take-away-bill.herokuapp.com';
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
              private router: Router,
              private spinnerService: SpinnerService,
              private matSnackBar: MatSnackBar) {
    if (isDevMode()) {
      this.baseUrl = 'http://localhost:5005';
    }

    this.getAuth().subscribe(async isAuth => {
      if (isAuth) {
        await this.router.navigate(['dashboard']);
      } else {
        await this.router.navigate(['login']);
      }
    });
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  getAuth(): Observable<boolean> {
    return this.isAuth.asObservable();
  }

  setNotAuthenticated() {
    this.isAuth.next(false);
    sessionStorage.removeItem('token');
  }

  setAuthenticated(token: string) {
    sessionStorage.setItem('token', token);
    this.isAuth.next(true);
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
    const {token} = await this.http.post(`${this.baseUrl}/login`, formData)
      .pipe(
        retryWhen(errors => {
          let retries = 0;
          return errors.pipe(delay(1000), take(5), map(error => {
            if (retries++ === 4) {
              throw error;
            }
          }));
        }),
        catchError(err => {
          console.log('login failed 401: ' + JSON.stringify(err));
          this.setNotAuthenticated();
          this.matSnackBar.open('Netzwerkfehler, bitte nochmal anmelden!', '', {
            duration: 3000
          });
          return of(null);
        })
      )
      .toPromise();
    this.setAuthenticated(token);
    this.autoClearAuthenticated();
  }

  autoClearAuthenticated() {
    setTimeout(() => {
      this.setNotAuthenticated();
    }, 60000 * 10);
  }

  /**
   * Send GET Request to Server to log user out
   * Set new value of iAuth to false and notify other components via Observable
   */
  async logout(): Promise<void> {
    const token = sessionStorage.getItem('token');
    // @ts-ignore
    const httpOptions = {headers: new HttpHeaders({token})};
    await this.http.get(`${this.baseUrl}/logout`, httpOptions)
      .pipe(
        retryWhen(errors => {
          let retries = 0;
          return errors.pipe(delay(1000), take(5), map(error => {
            if (retries++ === 4) {
              throw error;
            }
          }));
        }),
        catchError(err => {
          console.log('logout failed 401: ' + JSON.stringify(err));
          this.setNotAuthenticated();
          this.matSnackBar.open('Netzwerkfehler, bitte nochmal anmelden!', '', {
            duration: 3000
          });
          return of(null);
        })
      )
      .toPromise();
    this.setNotAuthenticated();
  }

  /**
   * Initialize auth status for the whole application
   */
  async initAuth(): Promise<void> {
    this.spinnerService.show();
    const token = sessionStorage.getItem('token');
    if (token) {
      this.isAuth.next(true);
      this.autoClearAuthenticated();
    }
    this.spinnerService.hide();

    // if (token) {
    //   this.spinnerService.show();
    //   const httpOptions = {headers: new HttpHeaders({token})};
    //   const result = await this.http.get(`${this.baseUrl}/initAuth`, httpOptions)
    //     .pipe(
    //       retryWhen(errors => {
    //         let retries = 0;
    //         return errors.pipe(delay(1000), take(5), map(error => {
    //           if (retries++ === 4) {
    //             throw error;
    //           }
    //         }));
    //       }),
    //       catchError(err => {
    //         console.log('init auth failed 401: ' + JSON.stringify(err));
    //         this.setNotAuthenticated();
    //         this.matSnackBar.open('Netzwerkfehler, bitte nochmal anmelden!', '', {
    //           duration: 3000
    //         });
    //         return of(null);
    //       })
    //     )
    //     .toPromise();
    //   if (token) {
    //     this.isAuth.next(true);
    //     this.autoClearAuthenticated();
    //   }
    //   this.spinnerService.hide();
    // }
  }
}
