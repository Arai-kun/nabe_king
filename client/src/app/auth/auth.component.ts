import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { DbService } from '../db.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  params!: Params;
  url!: string;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private dbService: DbService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.dbService.tokensExist()
    .subscribe(result => {
      if(result){
        this.router.navigate(['home']);
      }
      else{
        this.params = this.route.snapshot.queryParams;
        console.log(this.params);
        if(this.params["spapi_oauth_code"] && this.params["selling_partner_id"])
        {
          this.authService.exchangeToken(this.params["spapi_oauth_code"], this.params["selling_partner_id"])
          .subscribe(()=> {
            this.dbService.dbInit()
            .subscribe(() => this.ngOnInit());
          });
        }
        else
        {
          window.location.href = 
          "https://sellercentral.amazon.co.jp/apps/authorize/consent?application_id=amzn1.sp.solution.64bd6392-c1a0-4951-9b00-2744796fc74a&version=beta&state=123456";
        }
      }
    });
  }



}
