import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
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

  @ViewChild('phoneNumberInput') phoneNumberInput: any;

  statusText: string = '';
  todayDate = new Date();

  sendPhoneInput(userId: string, phoneNum: string) {
    // Check if valid phone number
    if (!/^[0-9\+]*\b\w{10,}\b$/gm.test(phoneNum)) {
      this.statusText = 'Please enter a valid phone number.'
      return;
    }
    console.log(userId);
    console.log(phoneNum);
    var formData: any = {
      "uid": userId,
      "phoneNumber": phoneNum
    }
    this.phoneNumberInput.nativeElement.value = '';
    this.statusText = 'Loading...';
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
      formData["lat"] = position.coords.latitude;
      formData["lng"] = position.coords.longitude;

      let res = this.http.post<any>('http://localhost:3000/add-user', formData);
      res.subscribe((data) => {
        if (data.prevAdded) {
          this.statusText = data.message;
        } else {
          this.statusText = 'Added phone number successfully! Check your phone for messages!'
          this.sendTestMessage(userId);
        }
      });
      })
    }
    else {
      let res = this.http.post<any>('http://localhost:3000/add-user', formData);
      res.subscribe((data) => {
        if (data.prevAdded) {
          this.statusText = data.message;
        } else {
          this.statusText = 'Added phone number successfully! Check your phone for messages!'
          this.sendTestMessage(userId);
        }
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
