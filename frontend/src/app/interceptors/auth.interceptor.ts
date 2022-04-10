import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService, TakeAwayToken } from '../services/auth.service';
import moment from 'moment';
import { fromPromise } from 'rxjs/internal-compatibility';
import {
  catchError,
  delay,
  map,
  retryWhen,
  switchMap,
  take,
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private matSnackBar: MatSnackBar
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let authReq = request;
    const token: TakeAwayToken = this.authService.getTokens();
    const accessTokenExpiredTime = moment
      .duration(this.authService.calculateDuration(token.accessToken))
      .asMinutes();
    authReq = request.clone({
      headers: request.headers.set('accessToken', token.accessToken || ''),
    });

    if (
      accessTokenExpiredTime < 0 &&
      !authReq.url.includes('generate-new-tokens') &&
      !authReq.url.includes('update-refresh-token')
    ) {
      return fromPromise(this.authService.generateNewTokens()).pipe(
        switchMap((newToken: TakeAwayToken) => {
          authReq = request.clone({
            headers: request.headers.set(
              'accessToken',
              newToken.accessToken || ''
            ),
          });
          return this.handleMultiple(authReq, next);
        })
      );
    }
    return this.handleMultiple(authReq, next);
  }

  private handleMultiple(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // console.log('event--->>>', event);
        }
        return event;
      }),
      retryWhen((errors) => {
        const MAX_RETRY = 5;
        let retries = 0;
        return errors.pipe(
          delay(1000),
          take(MAX_RETRY),
          map((error) => {
            console.log(retries);
            if (retries++ === MAX_RETRY - 1) {
              throw error;
            }
          })
        );
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }
}
