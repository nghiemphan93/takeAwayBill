import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuth = new Subject<boolean>();

  constructor(private http: HttpClient) {
  }

  getAuth(): Observable<boolean> {
    return this.isAuth.asObservable();
  }

  /**
   * Send POST Request to Server to log user in
   * Set new value of iAuth to true and notify other components via Observable
   *
   * @param username
   * @param password
   *
   */
  login(username: string, password: string): void {
    // TODO
  }

  /**
   * Send GET Request to Server to log user out
   * Set new value of iAuth to false and notify other components via Observable
   */
  logout(): void {
    // TODO
  }
}
