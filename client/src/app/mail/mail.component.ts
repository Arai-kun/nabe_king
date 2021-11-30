import { Component, OnInit, ViewChild} from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import { DbService } from '../db.service';
import { FileService } from '../file.service';
import { user } from '../user';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent implements OnInit {
  email: string = "";
  submitting: boolean = false;
  sending: boolean = false;


  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;

  constructor(
    private dbService: DbService,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    this.getEmail();
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
        if(typeof reader.result === 'string'){
          this.fileService.upload(reader.result)
          .subscribe(url =>{
            done({
              progress: 100,
              url: url
            });
          });
        }
      }
    });
  }

  exportHtml() {
    this.submitting = true;
    this.emailEditor.editor.exportHtml((data: any) => console.log('exportHtml', data));
  }

  getEmail(): void {
    this.dbService.get<user>('email')
    .subscribe(user => this.email = user.email);
  }

  onSend(): void {
    this.sending = true;
    this.exportHtml();
  }
}
