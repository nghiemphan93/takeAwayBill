import { enableProdMode, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire/compat';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';
import { de_DE, NZ_I18N } from 'ng-zorro-antd/i18n';
import { AuthInterceptor } from './app/interceptors/auth.interceptor';
import { ErrorInterceptor } from './app/interceptors/error.interceptor';
import { SpinnerInterceptor } from './app/interceptors/spinner.interceptor';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatSnackBarModule } from '@angular/material/snack-bar';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(de);

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AppRoutingModule,
      BrowserAnimationsModule,
      AngularFireModule.initializeApp(environment.firebaseConfig),
      OverlayModule,
      MatSnackBarModule,
    ),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: NZ_I18N, useValue: de_DE },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
  ],
}).catch((err) => console.error(err));
