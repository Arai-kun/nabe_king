import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { user } from '../user';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
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
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private overlay: Overlay
  ) { }

  overlayRef = this.overlay.create({
    hasBackdrop: true,
    positionStrategy: this.overlay
      .position().global().centerHorizontally().centerVertically()
  });

  ngOnInit(): void {
    this.form = this.fb.group({
      email: this.emailControl,
      password: this.passwordControl
    });
  }

  onSubmit() {
    this.overlayRef.attach(new ComponentPortal(MatSpinner));
    this.submitting = true;
    //console.log(this.form.value);
    this.user.email = this.form.get('email')?.value; 
    this.user.password = this.form.get('password')?.value;
    this.authService.login(this.user)
    .subscribe(result => {
      if(result)
      {
        this.overlayRef.detach();
        this.router.navigate(['auth']);
      }
      else
      {
        this.loginFailed();
      }
    });
  }

  loginFailed(): void {
    this.overlayRef.detach();
    this.submitting = false;
    //this.toastr.error('正しいメールアドレスとパスワードを入力してください', 'ログイン失敗', {positionClass: 'toast-top-full-width', timeOut: 5000});
    this.form.reset();
  }


}