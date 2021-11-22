import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { NaviComponent } from './navi/navi.component';

const routes: Routes = [
  { path: "", redirectTo: "authorize", pathMatch: "full" },
  { path: "authorize", component: AuthComponent },
  { path: "navi", component: NaviComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
