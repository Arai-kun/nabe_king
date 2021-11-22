import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  params!: Params;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.params = this.route.snapshot.queryParams;
    if(this.params["spapi_oauth_code"] && this.params["selling_partner_id"])
    {

    }
    else
    {
      window.location.href = 
      "https://sellercentral.amazon.co.jp/apps/authorize/consent?application_id=amzn1.sp.solution.64bd6392-c1a0-4951-9b00-2744796fc74a&version=beta";
    }
  }

}
