import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { DbService } from '../db.service';
import { user } from '../user';
import { Location } from "@angular/common";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user: user = {
    email: "",
    password: "",
    seller_partner_id: "",
    refresh_token: "",
    access_token: ""
  };
  form!: FormGroup;
  emailControl = new FormControl(null, Validators.required);
  passwordControl = new FormControl(null, Validators.required);
  submitting: boolean = false;


  constructor(
    private dbService: DbService,
    private fb: FormBuilder,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: this.emailControl,
      password: this.passwordControl
    });
  }

  onSubmit() {
    this.submitting = true;
    console.log(this.form.get('email')?.value);
    this.user.email = this.form.get('email')?.value; 
    this.user.password = this.form.get('password')?.value;
    this.dbService.userExist(this.user.email)
    .subscribe(exist => {
      if(exist){
        this.location.go("login");
      }
      else{
        this.dbService.createUser(this.user)
        .subscribe(() => this.location.go("auth"));
      }
    });
  }
}