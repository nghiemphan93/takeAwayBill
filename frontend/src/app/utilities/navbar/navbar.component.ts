import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { SpinnerService } from '../../services/spinner.service';
import { AsyncPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  imports: [AsyncPipe, MatButton, RouterLink, MatToolbarModule],
  standalone: true,
})
export class NavbarComponent implements OnInit {
  isAuth$ = new Observable<boolean>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private spinnerService: SpinnerService,
  ) {}

  ngOnInit(): void {
    this.isAuth$ = this.authService.getAuth();
  }

  async onLogOut(): Promise<void> {
    this.spinnerService.show();
    try {
      await this.authService.logout();
      await this.router.navigate(['login']);
    } catch (e) {}
    this.spinnerService.hide();
  }
}
