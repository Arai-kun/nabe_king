import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DataComponent } from './data/data.component';
import { MailComponent } from './mail/mail.component';
import { HomeComponent } from './home/home.component';
import { ConfigComponent } from './config/config.component';
import { ContactComponent } from './contact/contact.component';
import { CanDeactivateGuard } from './can-deactivate-guard.service';
import { ForgotComponent } from './forgot/forgot.component';
import { ResetComponent } from './reset/reset.component';
import { ManualComponent } from './manual/manual.component';


const routes: Routes = [
  { path: "", redirectTo: "auth", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "forgot", component: ForgotComponent },
  { path: "reset/:token", component: ResetComponent },
  { path: "auth", component: AuthComponent, canActivate: [AuthGuard] },
  { path: "home", 
    component: HomeComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: "config", component: ConfigComponent },
      { path: "data", component: DataComponent },
      { path: "mail", component: MailComponent, canDeactivate: [CanDeactivateGuard] },
      { path: "contact", component: ContactComponent },
      { path: "manual", component: ManualComponent }
    ]
  },
  { path: "**", redirectTo: "auth" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [CanDeactivateGuard]
})
export class AppRoutingModule { }
