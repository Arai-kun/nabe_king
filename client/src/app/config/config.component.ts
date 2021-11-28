import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { config } from '../config';
import { DbService } from '../db.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  submitting: boolean = false;
  config: config = {
    email: '',
    status: false,
    dulation: 0
  }
  statusOptions: string[] = ['無効', '有効'];
  status : string = this.statusOptions[0];
  dulation: number = 0;
  dulations = [{value: 0, viewValue: ""}];
  radioControl = new FormControl(this.status);
  selectControl = new FormControl(this.dulation, Validators.required);
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dbService: DbService
  ) { }

  ngOnInit(): void {
    for(let i = 0; i < 31; i++){
      this.dulations.push({value: i, viewValue: `${i}日後に送信する`});
    }
    this.form = this.fb.group({
      status: this.radioControl,
      select: this.selectControl
    });
    this.getConfig();
  }

  getConfig() : void {
    this.dbService.get<config>('config')
    .subscribe(config => {
      this.config = config;
      console.log(this.config);
      if(this.config.status) this.status = this.statusOptions[1];
      this.dulation = this.config.dulation;
    });
  }

  onSave(): void {
    this.submitting = true;
    console.log(this.form.value);
    console.log(this.status);
    console.log(this.dulation);

  }

}
