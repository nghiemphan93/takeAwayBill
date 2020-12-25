import {Injectable, isDevMode} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Router} from "@angular/router";
import {catchError, delay, map, retryWhen, take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = 'https://take-away-bill.herokuapp.com';
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient,
              private router: Router) {
    if (isDevMode()) {
      this.baseUrl = 'http://localhost:5005';
    }

    this.getAuth().subscribe(async isAuth => {
      if (isAuth) {
        await this.router.navigate(['dashboard']);
      } else {
        await this.router.navigate(['login']);
      }
    })
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  getAuth(): Observable<boolean> {
    return this.isAuth.asObservable();
  }

  setNotAuthenticated() {
    this.isAuth.next(false);
    localStorage.removeItem('token');
  }

  setAuthenticated(token: string) {
    localStorage.setItem('token', token);
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
              throw error
            }
          }))
        }),
        catchError(err => {
          if (err.status === 401) {
            this.setNotAuthenticated();
          }
          return of(null);
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
    const httpOptions = {headers: new HttpHeaders({token})}
    await this.http.get(`${this.baseUrl}/logout`, httpOptions)
      .pipe(
        retryWhen(errors => {
          let retries = 0;
          return errors.pipe(delay(1000), take(5), map(error => {
            if (retries++ === 4) {
              throw error
            }
          }))
        }),
        catchError(err => {
          if (err.status === 401) {
            this.setNotAuthenticated();
          }
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
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const httpOptions = {headers: new HttpHeaders({token})}
        await this.http.get(`${this.baseUrl}/initAuth`, httpOptions)
          .pipe(
            retryWhen(errors => {
              let retries = 0;
              return errors.pipe(delay(1000), take(5), map(error => {
                if (retries++ === 4) {
                  throw error
                }
              }))
            }),
            catchError(err => {
              if (err.status === 401) {
                this.setNotAuthenticated();
              }
              return of(null);
            })
          )
          .toPromise();
        this.isAuth.next(true);
      }
    } catch (e) {
      if (e.status === 401) {
        // console.log('log in to authenticate');
        // this.setNotAuthenticated();
      }
    }
  }
}
