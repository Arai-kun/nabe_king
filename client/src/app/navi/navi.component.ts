import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { OverlaySpinnerService } from '../overlay-spinner.service';
import { DbService } from '../db.service';
import { user } from '../user';

@Component({
  selector: 'app-navi',
  templateUrl: './navi.component.html',
  styleUrls: ['./navi.component.css']
})
export class NaviComponent implements OnInit {
  email: string = '';

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router,
    private overlaySpinnerService: OverlaySpinnerService,
    private dbService: DbService
    ) {}

  ngOnInit(): void {
    this.getEmail();
  }

  getEmail(): void {
    this.dbService.get<user>('email')
    .subscribe(user => this.email = user.email);
  }

  onLogout(): void{
    this.overlaySpinnerService.attach()
    this.authService.logout().subscribe(() => {
      this.overlaySpinnerService.detach();
      this.router.navigate(['/']);
    });
  }

}
