import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { OverlaySpinnerService } from '../overlay-spinner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: ['./forgot.component.css']
})
export class ForgotComponent implements OnInit {
  email: string = '';
  form!: FormGroup;
  emailControl = new FormControl(null, [
    Validators.required,
    Validators.email
  ]);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: this.emailControl
    });
  }

  onSubmit(): void {
    this.overlaySpinnerService.attach();
    //console.log(this.form.value);
    this.email = this.form.get('email')?.value; 
    this.authService.pwReset(this.email)
    .subscribe(res => {
      switch(res['result']){
        case 0:
          this.overlaySpinnerService.detach();
          this.toastrService.success(`${this.email} にパスワード再発行用メールを送信しました。ご確認ください`, '送信完了', { positionClass: 'toast-bottom-full-width', disableTimeOut: true, closeButton: true});
          break;
        case 1:
          this.overlaySpinnerService.detach();
          this.toastrService.error('このメールアドレスは登録されていません', '登録なし', { positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true});
          break;
        default:
          this.overlaySpinnerService.detach();
          this.toastrService.error('大変申し訳ありません。しばらく経ってから再度送信していただくか、復旧をお待ちください', '送信失敗', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
      }
    });
  }
}
