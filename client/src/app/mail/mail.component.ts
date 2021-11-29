import { Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { EmailEditorComponent } from 'angular-email-editor';
import { DbService } from '../db.service';
import { user } from '../user';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent implements OnInit {
  email: string = "";
  form!: FormGroup;
  emailControl = new FormControl(null, Validators.required);
  submitting: boolean = false;


  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;

  constructor(
    private fb: FormBuilder,
    private dbService: DbService
  ) { }

  ngOnInit(): void {
    this.getEmail();
    this.form = this.fb.group({
      email: this.emailControl
    });
  }

  editorLoaded(event: any) {
    // load the design json here
    //this.emailEditor.editor.loadDesign(sample);
    const reader = new FileReader();
    this.emailEditor.editor.registerCallback("image", (file: any, done: (arg0: { progress: number, url: string; }) => void) => {
      console.log("image");
      reader.readAsDataURL(file.attachments[0]);
      reader.onload = () => {
        console.log(reader.result);
      }
      done({
          progress: 100,
          url: "http://portalmelhoresamigos.com.br/wp-content/uploads/2017/06/ferrett-buraco_DOMINIO-PUBLICO.jpg"
      });
    });
  }

  exportHtml() {
    this.emailEditor.editor.exportHtml((data: any) => console.log('exportHtml', data));
  }

  getEmail(): void {
    this.dbService.get<user>('email')
    .subscribe(user => {
      this.email = user.email;
      console.log(this.email);
    })
  }

  onSend(): void {
    console.log(this.form.value);
    this.exportHtml();
  }
}
