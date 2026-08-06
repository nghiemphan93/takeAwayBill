import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './utilities/navbar/navbar.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
  isAuth$ = new Observable<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {
    this.authService.initAuth().then();
    this.isAuth$ = this.authService.getAuth();
  }

  ngOnInit(): void {}
}
