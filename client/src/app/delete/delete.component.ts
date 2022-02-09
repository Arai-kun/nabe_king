import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DbService } from '../db.service';
import { OverlaySpinnerService } from '../overlay-spinner.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.css']
})
export class DeleteComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<DeleteComponent>,
    private dbService: DbService,
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  ok(): void {
    this.overlaySpinnerService.attach();
    this.dbService.delete()
    .subscribe(result => {
      if(result){
        this.toastrService.success('アカウントを削除しました', '', { positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true});
        this.overlaySpinnerService.detach();
        this.router.navigate(['/']);
      }
    })
  }

  cancel(): void {
    this.dialogRef.close();
  }

}
