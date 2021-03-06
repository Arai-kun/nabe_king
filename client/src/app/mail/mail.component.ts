import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
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
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { Dialog2Component } from '../dialog2/dialog2.component';
import { Router } from '@angular/router';

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
      url:'https://res.cloudinary.com/dctfqlyj9/image/upload/v1643959198/loader-1s-100px_soplk1.svg'
    }
  }
  unSaved: boolean = true;


  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;

  constructor(
    private dbService: DbService,
    private fileService: FileService,
    public dialog: MatDialog,
    private mailService: MailService,
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService,
    private ngZone: NgZone,
    private router: Router
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
    let dialogRef = this.dialog.open(DialogComponent, {
      width: '560px',
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
              this.ngZone.run(() => {
                this.overlaySpinnerService.detach();
                this.toastrService.success('??????????????????', '', { positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true});
              });
            }
            else{
              this.ngZone.run(() => {
                this.overlaySpinnerService.detach();
                this.toastrService.error('??????????????????????????????????????????????????????????????????????????????????????????????????????????????????', '????????????', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
              });
            }
          });
        });
      }
    });
  }

  /**
   * Save mail design and html, subject
   */

  onUserSave(): void {
    let dialogRef = this.dialog.open(DialogComponent, {
      width: '560px',
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
                  this.unSaved = false;
                  this.ngZone.run(() => {
                    this.overlaySpinnerService.detach();
                    this.toastrService.success('?????????????????????????????????????????????????????????????????????', '??????????????????', { positionClass: 'toast-bottom-center', timeOut: 6000, closeButton: true});
                  });
                  this.router.navigate(['/home/config']);
                }
                else{
                  this.ngZone.run(() => {
                    this.overlaySpinnerService.detach();
                    this.toastrService.error('??????????????????????????????????????????????????????????????????????????????????????????????????????????????????', '????????????', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
                  });
                }
              });
            }
            else{
              this.ngZone.run(() => {
                this.overlaySpinnerService.detach();
                this.toastrService.error('?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????', '????????????', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
              });
            }
          });
        });
      }
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    if(this.unSaved) {
      let dialogRef = this.dialog.open(Dialog2Component, {
        width: '400px'
      });
      let result_buf: Subject<boolean> = new Subject();

      dialogRef.afterClosed().subscribe(result => {
        result_buf.next(result);
      });
      return result_buf;
    }
    else{
      return true;
    }
  }

}
