import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {NavbarComponent} from './utilities/navbar/navbar.component';
import {AngularFireModule} from "@angular/fire";
import {environment} from "../environments/environment";
import {OverlayModule} from "@angular/cdk/overlay";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    OverlayModule,
    MatProgressSpinnerModule
  ],
  providers: [{provide: LOCALE_ID, useValue: 'de'}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
