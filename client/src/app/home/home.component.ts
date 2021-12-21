import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { user } from '../user';
import { DbService } from '../db.service';
import { ToastrService } from 'ngx-toastr';
import { OverlaySpinnerService } from '../overlay-spinner.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  email: string ='';

  constructor(
    private router: Router,
    private dbService: DbService,
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.overlaySpinnerService.attach();
    this.getEmail();
  }

  getEmail(): void {
    this.dbService.get<user>('email')
    .subscribe(user => {
      this.email = user.email;
      this.toastrService.info(`ようこそ! ${this.email} さん`, '',{ positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true });
      this.overlaySpinnerService.detach();
      /* Initial display */
      this.router.navigate(['/home/config']);
    });
  }

}
