import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DbService } from '../db.service';
import { user } from '../user';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { OverlaySpinnerService } from '../overlay-spinner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user: user = {
    email: "",
    password: "",
    seller_partner_id: "",
    refresh_token: "",
    access_token: ""
  };
  form!: FormGroup;
  emailControl = new FormControl(null, [
    Validators.required,
    Validators.email
  ]);
  passwordControl = new FormControl(null, Validators.required);


  constructor(
    private dbService: DbService,
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: this.emailControl,
      password: this.passwordControl
    });
  }

  onSubmit() {
    this.overlaySpinnerService.attach();
    this.user.email = this.form.get('email')?.value; 
    this.user.password = this.form.get('password')?.value;
    this.dbService.userExist(this.user.email)
    .subscribe(exist => {
      if(exist){
        this.overlaySpinnerService.detach();
        this.toastrService.error('このメールアドレスは既に登録済みです', '登録失敗', { positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true});
        //this.router.navigate(['login']);
      }
      else{
        this.dbService.createUser(this.user)
        .subscribe(() => {
          this.authService.login(this.user)
          .subscribe(() => {
            this.overlaySpinnerService.detach();
            this.router.navigate(['auth']);
          });
        });
      }
    });
  }
}
