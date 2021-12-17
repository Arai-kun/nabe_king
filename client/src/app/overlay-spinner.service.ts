import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class OverlaySpinnerService {

  constructor(
    private overlay: Overlay,
    private toastrService: ToastrService
  ) { }

  overlayRef = this.overlay.create({
    hasBackdrop: true,
    positionStrategy: this.overlay
      .position().global().centerHorizontally().centerVertically()
  });

  attach(): void {
    this.overlayRef.attach(new ComponentPortal(MatSpinner));
    setTimeout(() => {
      if(this.overlayRef.hasAttached()){
        this.toastrService.error('ネットワークに問題がある恐れがあります。このままお待ちいただくか、しばらく経ってから再度お試しください', 'ネットワークエラー', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
        console.log('Network Error');
      }
    }, 15000);
  }
  
  detach(): void {
    this.overlayRef.detach();
  }

}
