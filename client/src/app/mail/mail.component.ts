import { Component, OnInit, ViewChild } from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import { DbService } from '../db.service';
import { FileService } from '../file.service';
import { user } from '../user';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

export interface DialogData {
  subject: string;
}

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.css']
})
export class MailComponent implements OnInit {
  email: string = "";
  subject: string = "";
  submitting: boolean = false;
  sending: boolean = false;


  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;

  constructor(
    private dbService: DbService,
    private fileService: FileService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getEmail();
    this.subject = 'タイトル';
  }

  editorLoaded(event: any) {
    // load the design json here
    //this.emailEditor.editor.loadDesign(sample);
    const reader = new FileReader();
    this.emailEditor.editor.registerCallback("image", (file: any, done: (arg0: { progress: number, url: string; }) => void) => {
      reader.readAsDataURL(file.attachments[0]);
      reader.onload = () => {
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
    this.openDialog();
    //this.exportHtml();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '250px',
      data: {subject: this.subject} 
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.subject = result;
      console.log(this.subject);
    });
  }
}
