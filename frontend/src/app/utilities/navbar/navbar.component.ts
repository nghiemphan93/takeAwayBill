import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {fromEvent, Observable, of, pipe} from "rxjs";
import {Router} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isAuth$ = new Observable<boolean>();

  constructor(private authService: AuthService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.isAuth$ = this.authService.getAuth();
  }

  async onLogOut() {
    try {
      await this.authService.logout();
      await this.router.navigate(['login']);
    } catch (e) {
      console.log(e);
      alert(`${e.statusText} ${e.message}`);
    }
  }
}
