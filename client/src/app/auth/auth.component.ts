import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { DbService } from '../db.service';
import { OverlaySpinnerService } from '../overlay-spinner.service';
import { ToastrService } from 'ngx-toastr';

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
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.overlaySpinnerService.attach();
    this.dbService.tokensExist()
    .subscribe(result => {
      if(result){
        this.overlaySpinnerService.detach();
        this.router.navigate(['home']);
      }
      else{
        this.params = this.route.snapshot.queryParams;
        //console.log(this.params);
        if(this.params["spapi_oauth_code"] && this.params["selling_partner_id"])
        {
          this.authService.exchangeToken(this.params["spapi_oauth_code"], this.params["selling_partner_id"])
          .subscribe(res => {
            console.log(res);
            if(Number(res['result']) === 1){
              this.overlaySpinnerService.detach();
              this.toastrService.error(`このセラーアカウントは、既に本アプリの${res['email']} のアカウントに紐づいています。ログインするか、パスワードを忘れた場合は再発行してください`, '連携失敗', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
              this.router.navigate(['/login']);
            }
            else if(Number(res['result']) === 0){
              this.dbService.dbInit()
              .subscribe(() => {
                this.overlaySpinnerService.detach();
                this.ngOnInit();
              });
            }
          });
        }
        else
        {
          this.overlaySpinnerService.detach();
          window.location.href = 
          "https://sellercentral.amazon.co.jp/apps/authorize/consent?application_id=amzn1.sp.solution.64bd6392-c1a0-4951-9b00-2744796fc74a&version=beta&state=123456";
        }
      }
    });
  }
}
