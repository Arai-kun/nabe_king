import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OverlaySpinnerService } from '../overlay-spinner.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit {
  display : boolean = false;
  email: string = '';
  password: string = ''
  form!: FormGroup;
  emailControl = new FormControl(this.email);
  passwordControl = new FormControl(null, Validators.required);
  password2Control = new FormControl(null, Validators.required);
  

  
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.overlaySpinnerService.attach();
    this.checkToken();
    this.form = this.fb.group({
      email: this.emailControl,
      password: this.passwordControl,
      password2: this.password2Control
    });
  }

  onSubmit(): void {
    this.email = this.form.get('email')?.value; 
    this.password = this.form.get('password')?.value;
    if(this.password !== this.form.get('password2')?.value){
      this.toastrService.error('パスワードが一致しません', '', {positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true});
      this.form.get('password')?.setValue(null);
      this.form.get('password2')?.setValue(null);
      return;
    }
    else{
      this.overlaySpinnerService.attach();
      this.authService.pwRepublish(this.email, this.password)
      .subscribe(result => {
        if(result){
          this.overlaySpinnerService.detach();
          this.toastrService.success('パスワードの再発行が完了しました', '', {positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true});
          this.router.navigate(['login']);
        }
        else{
          this.overlaySpinnerService.detach();
          this.toastrService.error('大変申し訳ありません。しばらく経ってから再度試していただくか、復旧をお待ちください', '再発行失敗', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
        }
      })
    }
  }

  checkToken(): void {
    const token = String(this.route.snapshot.paramMap.get('token'));
    this.authService.tokenCheck(token)
    .subscribe(res => {
      switch(res['result']){
        case 0:
          this.display = true;
          this.overlaySpinnerService.detach();
          this.email = res['email'];
          break;
        case 1:
          this.overlaySpinnerService.detach();
          this.toastrService.error('リンクが不正か、有効期限が切れている恐れがあります', 'アクセス失敗', { positionClass: 'toast-bottom-center', timeOut: 6000, closeButton: true});
          this.router.navigate(['login']);
          break;
        default:
          this.overlaySpinnerService.detach();
          this.toastrService.error('大変申し訳ありません。しばらく経ってから再度試していただくか、復旧をお待ちください', 'アクセス失敗', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
      }
    });
  }
}
