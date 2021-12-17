import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { user } from '../user';
import { testMail } from '../testMail';
import { DbService } from '../db.service';
import { MailService } from '../mail.service';
import { OverlaySpinnerService } from '../overlay-spinner.service';

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
    private overlaySpinnerService: OverlaySpinnerService
  ) { }

  ngOnInit(): void {
    this.getEmail();
    this.form = this.fb.group({
      email: this.emailControl,
      subject: this.subjectControl,
      content: this.contentControl
    })
  }

  getEmail(): void {
    this.dbService.get<user>('email')
    .subscribe(user => this.email = user.email);
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
      }
      else{
        console.log('Submit failed');
      }
    })

  }
}
