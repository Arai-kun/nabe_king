import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { user } from '../user';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

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
  emailControl = new FormControl(null, Validators.required);
  passwordControl = new FormControl(null, Validators.required);
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: this.emailControl,
      password: this.passwordControl
    });
  }

  onSubmit() {
    this.submitting = true;
    //console.log(this.form.value);
    this.user.email = this.form.get('email')?.value; 
    this.user.password = this.form.get('password')?.value;
    this.authService.login(this.user)
    .subscribe(result => {
      if(result)
      {
        this.submitting = false;
        this.router.navigate(['auth']);
      }
      else
      {
        this.loginFailed();
      }
    });
  }

  loginFailed(): void {
    this.submitting = false;
    //this.toastr.error('正しいメールアドレスとパスワードを入力してください', 'ログイン失敗', {positionClass: 'toast-top-full-width', timeOut: 5000});
    this.form.reset();
  }


}