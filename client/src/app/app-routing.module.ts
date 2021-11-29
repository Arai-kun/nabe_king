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


const routes: Routes = [
  { path: "", redirectTo: "auth", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "auth", component: AuthComponent, canActivate: [AuthGuard] },
  { path: "home", 
    component: HomeComponent, 
    canActivate: [AuthGuard],
    children: [
      { path: "config", component: ConfigComponent },
      { path: "data", component: DataComponent },
      { path: "mail", component: MailComponent }
    ]
  },
  { path: "**", redirectTo: "auth" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
