import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private matSnackBar: MatSnackBar
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        console.log(`request failed with error: ${JSON.stringify(err)}`);
        this.authService.logout().then();
        this.matSnackBar.open('Netzwerkfehler, bitte nochmal anmelden!', '', {
          duration: 3000,
        });
        return throwError(err);
      })
    );
  }
}
