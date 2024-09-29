import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, firstValueFrom, Observable} from 'rxjs';
import moment from 'moment';
import { jwtDecode } from "jwt-decode";
import { Router } from '@angular/router';

export class TakeAwayToken {
  accessToken?: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl = 'https://takeawaybill.nghiemphan.de';
  isAuth = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
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

  updateRefreshToken(newRefreshToken: string): Observable<string> {
    const formData = new FormData();
    formData.append('newRefreshToken', newRefreshToken);

    const url = `${this.baseUrl}/update-refresh-token`;
    return this.http.put<string>(url, formData);
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

  clearLocalCache(): void {
    localStorage.clear();
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

    const token: TakeAwayToken = await firstValueFrom(this.http
      .post<TakeAwayToken>(`${this.baseUrl}/login`, formData)
    );

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
    const token: TakeAwayToken = await firstValueFrom(this.http
      .get<TakeAwayToken>(`${this.baseUrl}/generate-new-tokens`)
    );
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
    const refreshTokenExpiredTime = moment
      .duration(this.calculateDuration(refreshToken || ''))
      .asMinutes();

    if (accessTokenExpiredTime > 0) {
      this.isAuth.next(true);
    } else if (refreshTokenExpiredTime > 0) {
      await this.generateNewTokens();
    } else {
      this.isAuth.next(false);
      this.clearLocalCache();
      // await this.router.navigate(['login']);
    }
  }

  /**
   * Calculate new time until token expires
   */
  calculateDuration(token: string | undefined): number {
    if (token) {
      const decodedToken = jwtDecode(token) as any;
      return moment.unix(decodedToken.exp).diff(moment().toDate());
    }
    return 0;
  }
}
