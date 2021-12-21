import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { user } from '../user';
import { testMail } from '../testMail';
import { DbService } from '../db.service';
import { MailService } from '../mail.service';
import { OverlaySpinnerService } from '../overlay-spinner.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  form!: FormGroup;
  email: string ='';
  emailControl = new FormControl(this.email);
  subjectControl = new FormControl(null, Validators.required);
  contentControl = new FormControl(null, Validators.required);
  ADMIN_EMAIL: string = 'koki.alright@gmail.com'; 
  

  constructor(
    private fb: FormBuilder,
    private dbService: DbService,
    private mailService: MailService,
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.overlaySpinnerService.attach();
    this.getEmail();
    this.form = this.fb.group({
      email: this.emailControl,
      subject: this.subjectControl,
      content: this.contentControl
    });
  }

  getEmail(): void {
    this.dbService.get<user>('email')
    .subscribe(user => {
      this.email = user.email;
      this.overlaySpinnerService.detach();
    });
  }

  onSubmit(): void {
    this.overlaySpinnerService.attach();
    const mailData: testMail = {
      email: '',
      subject: `【お問い合わせ】${this.form.get('subject')?.value}`,
      to: this.ADMIN_EMAIL,
      html: `<p>${this.email} 様より以下の内容でお問い合わせを頂きました。</p><p>上記のメールアドレスに直接ご回答ください。</p><p>------------------------------------------</p><p>${(this.form.get('content')?.value).split('\n').join('<br>')}</p>`
    }
    this.mailService.send(mailData)
    .subscribe(result => {
      if(result){
        this.overlaySpinnerService.detach();
        this.toastrService.success('送信しました', '', { positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true});
      }
      else{
        this.overlaySpinnerService.detach();
        this.toastrService.error('大変申し訳ありません。しばらく経ってから再度送信していただくか、復旧をお待ちください', '送信失敗', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
      }
    })

  }
}
