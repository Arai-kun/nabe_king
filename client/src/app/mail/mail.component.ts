import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
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
import { OverlaySpinnerService } from '../overlay-spinner.service';

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
  appearance = {
    loader: {
      //html:'<div></div>'
      url:'https://res.cloudinary.com/du1gt2vtq/image/upload/v1638778224/Rolling-1s-200px_wqzznh.svg'
    }
  }


  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;

  constructor(
    private dbService: DbService,
    private fileService: FileService,
    public dialog: MatDialog,
    private mailService: MailService,
    public cd: ChangeDetectorRef,
    private overlaySpinnerService: OverlaySpinnerService
  ) { }

  ngOnInit(): void {
    this.getEmail();
    this.getSubject();
  }

  editorLoaded(event: any) {
    // load the design json here
    this.dbService.get<mailDesign>('mailDesign')
    .subscribe(design => {
      if(design.design !== ''){
        this.emailEditor.editor.loadDesign(JSON.parse(design.design));
      }
    });
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
        this.overlaySpinnerService.attach();
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
              this.overlaySpinnerService.detach();
              //this.cd.detectChanges(); // -> なぜかViewの変更検知がいかないため明示的に命令
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

  onUserSave(): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {subject: this.subject} 
    });

    dialogRef.afterClosed().subscribe(result => {
      //console.log(result);
      if(typeof result === 'string'){
        this.subject = result;
        this.overlaySpinnerService.attach();
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
                  this.overlaySpinnerService.detach();
                  //this.cd.detectChanges(); // -> なぜかViewの変更検知がいかないため明示的に命令
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
