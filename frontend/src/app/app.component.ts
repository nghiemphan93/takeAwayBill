import {Component} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {FormControl, FormGroup} from "@angular/forms";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  data$ = new Observable<string>();
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private http: HttpClient) {
    this.data$ = this.http.get<string>('http://localhost:5000/getdatademo');
  }

  onSubmit() {
    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;
    const user = {username, password}
    console.log(user)

    this.http.get(`http://localhost:5000/login?username=${username}&password=${password}`).subscribe(result => {
      if (result.toString().includes('Goldene Drachen') || result.toString().includes('Order,Date,Postcode')) {
        console.log('logged in successful');
        this.data$ = this.http.get<string>('http://localhost:5000/getdatademo');
      } else {
        console.log('logged in FAILED...');
      }
    });
  }

  onLogOut() {
    console.log('loggin out')
    this.http.get('http://localhost:5000/logout').subscribe(result => {
      if (result.toString().includes('Not a member yet? Join Takeaway.com')) {
        console.log('logged out successful');
      } else {
        console.log('logged out FAILED');
      }
    })
  }

  onGetData() {
    this.data$ = this.http.get<string>('http://localhost:5000/getdatademo');
  }
}
