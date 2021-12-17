import { Injectable } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatSpinner } from '@angular/material/progress-spinner';

@Injectable({
  providedIn: 'root'
})
export class OverlaySpinnerService {

  constructor(
    private overlay: Overlay
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
        console.log('Network Error');
      }
    }, 15000);
  }

  detach(): void {
    this.overlayRef.detach();
  }

}
