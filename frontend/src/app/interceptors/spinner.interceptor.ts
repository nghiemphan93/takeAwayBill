import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { SpinnerService } from '../services/spinner.service';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  constructor(private spinnerService: SpinnerService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.spinnerService.show();
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          this.spinnerService.hide();
        }
        return event;
      }),
      catchError((err) => {
        this.spinnerService.hide();
        return throwError(err);
      })
    );
  }
}
