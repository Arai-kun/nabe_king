import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog2',
  templateUrl: './dialog2.component.html',
  styleUrls: ['./dialog2.component.css']
})
export class Dialog2Component implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<Dialog2Component>,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cd.detectChanges();
  }

  ok(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

}
