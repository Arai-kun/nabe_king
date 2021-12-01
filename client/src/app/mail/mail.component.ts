import { Component, OnInit, ViewChild } from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import { DbService } from '../db.service';
import { FileService } from '../file.service';
import { user } from '../user';
import { mail } from '../mail';
import { mailDesign } from '../mailDesign';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { MailService } from '../mail.service';
import { testMail } from '../testMail';

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
    public dialog: MatDialog,
    private mailService: MailService
  ) { }

  ngOnInit(): void {
    this.getEmail();
    this.getSubject();
  }

  editorLoaded(event: any) {
    // load the design json here
    this.dbService.get<mailDesign>('mailDesign')
    .subscribe(design => this.emailEditor.editor.loadDesign(design.design));
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

  /*
  exportHtml() {
    this.submitting = true;
    this.emailEditor.editor.exportHtml((data: any) => console.log('exportHtml', data));
  }
  */

  getEmail(): void {
    this.dbService.get<user>('email')
    .subscribe(user => this.email = user.email);
  }

  getSubject(): void {
    this.dbService.get<DialogData>('subject')
    .subscribe(data => this.subject = data.subject);
  }

  /**
   * Sending test mail
   */

  onSend(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {subject: this.subject} 
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log(result);
      if(typeof result === 'string'){
        this.subject = result;
        this.sending = true;
        this.emailEditor.editor.exportHtml((data: any) => {
          const mail: testMail = {
            email: this.email,
            html: data['html'],
            subject: this.subject,
            to: this.email   
          }
          this.mailService.send(mail)
          .subscribe(res => {
            if(res){
              this.sending = false;
            }
            else{
              console.log('Send failed');
            }
          })
        });
      }
    });
  }

  /**
   * Save mail design and html, subject
   */

  onSave(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {subject: this.subject} 
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log(result);
      if(typeof result === 'string'){
        this.subject = result;
        this.sending = true;
        this.emailEditor.editor.exportHtml((data: any) => {
          const mail: mail = {
            email: "",
            html: data['html'],
            subject: this.subject  
          }
          const mailDesign: mailDesign = {
            email: "",
            design: data['design']
          }

          this.dbService.update<mailDesign>('mailDesign', mailDesign)
          .subscribe(result => {
            if(result){
              this.dbService.update<mail>('mail', mail)
              .subscribe(result => {
                if(result){
                  this.submitting = false;
                }
                else{
                  console.log('Save mail failed');
                }
              });
            }
            else{
              console.log('Save mailDesign failed');
            }
          })
        });
      }
    });
  }


}