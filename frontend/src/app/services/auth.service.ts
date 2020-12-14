import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = 'http://localhost:5005';
  isAuth = new BehaviorSubject<boolean>(false);

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
  async login(username: string, password: string): Promise<void> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    await this.http.post(`${this.baseUrl}/login`, formData).toPromise();
    this.isAuth.next(true);
  }

  /**
   * Send GET Request to Server to log user out
   * Set new value of iAuth to false and notify other components via Observable
   */
  async logout(): Promise<void> {
    await this.http.get(`${this.baseUrl}/logout`).toPromise();
    this.isAuth.next(false);
  }

  /**
   * Initialize auth status for the whole application
   */
  async initAuth(): Promise<void> {
    try {
      await this.http.get(`${this.baseUrl}/initAuth`).toPromise();
      this.isAuth.next(true);
    } catch (e) {
      console.log('log in to authenticate');
      this.isAuth.next(false);
    }
  }
}
