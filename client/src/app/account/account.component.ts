import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  constructor(public auth: AngularFireAuth, private http:HttpClient) { }

  ngOnInit(): void {
  }

  todayDate = new Date();

  sendPhoneInput(userId: string, phoneNum: string) {
    console.log(userId);
    console.log(phoneNum);
    var formData: any = {
      "uid": userId,
      "phoneNumber": phoneNum
    }
    if(navigator.geolocation) {
      console.log("HERE");
      navigator.geolocation.getCurrentPosition((position) => {
      formData["lat"] = position.coords.latitude;
      formData["lng"] = position.coords.longitude;

      let res = this.http.post<any>('http://localhost:3000/add-user', formData);
      res.subscribe((data) => {
      this.sendTestMessage(userId);
      });
      })
    }
    else {
      let res = this.http.post<any>('http://localhost:3000/add-user', formData);
      res.subscribe((data) => {
      this.sendTestMessage(userId);
      });
    }
  }

  sendTestMessage(userId: string): void {
    var formData = {
      "uid": userId
    }
    let res = this.http.post<any>('http://localhost:3000/send-welcome-message', formData);
    res.subscribe((data) => {
      console.log(data.message);
    });
  }
}
