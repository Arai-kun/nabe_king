import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    window.location.href = "https://sellercentral.amazon.co.jp/apps/authorize/consent?application_id=amzn1.sp.solution.64bd6392-c1a0-4951-9b00-2744796fc74a&version=beta";
  }

}
