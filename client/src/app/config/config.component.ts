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
    dulation: 0,
    from: '',
    to: ''
  }
  statusOptions: string[] = ['無効', '有効'];
  status : string = this.statusOptions[0];
  dulation: number = 0;
  dulations = [{value: 0, viewValue: "0日後に送信する"}];
  radioControl = new FormControl(this.status);
  selectControl = new FormControl(this.dulation);
  fromControl = new FormControl('');
  toControl = new FormControl('');
  form!: FormGroup;
  fba: boolean = false;
  mba: boolean = false;
  new: boolean = false;
  mint: boolean = false;
  verygood: boolean = false;
  good: boolean = false;
  acceptable: boolean = false;



  constructor(
    private fb: FormBuilder,
    private dbService: DbService
  ) { }

  ngOnInit(): void {
    this.submitting = false;
    for(let i = 1; i < 31; i++){
      this.dulations.push({value: i, viewValue: `${i}日後に送信する`});
    }
    this.form = this.fb.group({
      status: this.radioControl,
      select: this.selectControl,
      from: this.fromControl,
      to: this.toControl
    });
    this.getConfig();
  }

  getConfig() : void {
    this.dbService.get<config>('config')
    .subscribe(config => {
      this.config = config;
      //console.log(this.config);
      if(this.config.status) this.status = this.statusOptions[1];
      this.dulation = this.config.dulation;
    });
  }

  onSave(): void {

    console.log(this.form.value);
    console.log(`fba:${this.fba} mba:${this.mba} new:${this.new} mint:${this.mint} verygood:${this.verygood} good:${this.good} acceptable:${this.acceptable}`);
    console.log(new Date(this.form.get('from')?.value));
    console.log(new Date(this.form.get('to')?.value));
    
    this.submitting = true;
    if(this.status === this.statusOptions[0]) this.config.status = false;
    if(this.status === this.statusOptions[1]) this.config.status = true;
    this.config.dulation = this.dulation;
    this.dbService.update<config>('config', this.config)
    .subscribe(result => {
      if(result){
        //this.submitting = false;
        this.ngOnInit();
      }
      else{
        console.log("config update failed");
      }
    })

  }

}
