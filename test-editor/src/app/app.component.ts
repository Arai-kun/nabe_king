import { Component, ViewChild, Inject} from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import sample from './sample.json';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  subject: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-email-editor';
  email : string = '';
  subject: string= '';
  form!: FormGroup;
  emailControl = new FormControl(null, [
    Validators.required,
    Validators.email
  ]);
  submitting: boolean = false;

  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;

  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getEmail();
    this.form = this.fb.group({
      email: this.emailControl
    });
    this.subject = 'タイトル';
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
    this.email = 'mail@test.com';
    //console.log(this.email);
  }

  onSend(): void {
    this.openDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: {subject: this.subject}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.subject = result;
    });
  }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}