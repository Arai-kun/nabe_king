import { Component, ViewChild } from '@angular/core';
import { EmailEditorComponent } from 'angular-email-editor';
import sample from './sample.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-email-editor';

  @ViewChild(EmailEditorComponent)
  private emailEditor!: EmailEditorComponent;
  
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
}