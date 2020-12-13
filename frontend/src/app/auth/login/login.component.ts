import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  data$ = new Observable<string>();
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private http: HttpClient) {
  }

  ngOnInit() {
    this.data$ = this.http.get<string>('http://localhost:5005/getdatademo');
  }

  onSubmit(): void {
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    const user = {username, password};
    console.log(user);

    this.http.get(`http://localhost:5005/login?username=${username}&password=${password}`).subscribe(result => {
      if (result.toString().includes('Goldene Drachen') || result.toString().includes('Order,Date,Postcode')) {
        console.log('logged in successful');
        this.data$ = this.http.get<string>('http://localhost:5005/getdatademo');
      } else {
        console.log('logged in FAILED...');
      }
    });
  }

  onLogOut(): void {
    console.log('loggin out');
    this.http.get('http://localhost:5005/logout').subscribe(result => {
      if (result.toString().includes('Not a member yet? Join Takeaway.com')) {
        console.log('logged out successful');
      } else {
        console.log('logged out FAILED');
      }
    });
  }

  onGetData(): void {
    this.data$ = this.http.get<string>('http://localhost:5005/getdatademo');
  }

}
