import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import moment from 'moment';
import jwt_decode from 'jwt-decode';

export class TakeAwayToken {
  accessToken?: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = 'https://take-away-bill.herokuapp.com';
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    if (isDevMode()) {
      this.baseUrl = 'http://localhost:5005';
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAuth(): Observable<boolean> {
    return this.isAuth.asObservable();
  }

  getTokens(): TakeAwayToken {
    const token: TakeAwayToken = {
      accessToken: localStorage.getItem('accessToken') || '',
      refreshToken: localStorage.getItem('refreshToken') || '',
    };
    return token;
  }

  setNotAuthenticated(): void {
    this.isAuth.next(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  setAuthenticated(accessToken?: string, refreshToken?: string): void {
    localStorage.setItem('accessToken', accessToken || '');
    localStorage.setItem('refreshToken', refreshToken || '');
    this.isAuth.next(true);
  }

  clearSessionCache(): void {
    sessionStorage.clear();
  }

  /**
   * Send POST Request to Server to log user in
   * Set new value of iAuth to true and notify other components via Observable
   *
   *
   */
  async login(username: string, password: string): Promise<void> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const token: TakeAwayToken = await this.http
      .post<TakeAwayToken>(`${this.baseUrl}/login`, formData)
      .toPromise();

    this.setAuthenticated(token.accessToken, token.refreshToken);
  }

  /**
   * Send GET Request to Server to log user out
   * Set new value of iAuth to false and notify other components via Observable
   */
  async logout(): Promise<void> {
    this.setNotAuthenticated();
  }

  async generateNewTokens(): Promise<TakeAwayToken> {
    const token: TakeAwayToken = await this.http
      .get<TakeAwayToken>(`${this.baseUrl}/generate-new-tokens`)
      .toPromise();
    this.setAuthenticated(token.accessToken, token.refreshToken);
    return token;
  }

  /**
   * Initialize auth status for the whole application
   */
  async initAuth(): Promise<void> {
    this.clearSessionCache();
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    const accessTokenExpiredTime = moment
      .duration(this.calculateDuration(accessToken || ''))
      .asMinutes();
    if (accessTokenExpiredTime > 3) {
      this.isAuth.next(true);
    } else {
      await this.generateNewTokens();
    }
  }

  /**
   * Calculate new time until token expires
   */
  calculateDuration(token: string | undefined): number {
    if (token) {
      const decodedToken = jwt_decode(token) as any;
      return moment.unix(decodedToken.exp).diff(moment().toDate());
    }
    return 0;
  }
}
