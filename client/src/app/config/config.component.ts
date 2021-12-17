import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms'
import { config } from '../config';
import { DbService } from '../db.service';
import { OverlaySpinnerService } from '../overlay-spinner.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  config: config = {
    email: '',
    status: false,
    dulation: 0,
    from: '',
    to: '',
    fba: false,
    mba: false,
    new: false,
    mint: false,
    verygood: false,
    good: false,
    acceptable: false
  }
  statusOptions: string[] = ['無効', '有効'];
  status : string = this.statusOptions[0];
  dulation: number = 0;
  dulations = [{value: 0, viewValue: "0日後に送信する"}];
  from: string = '';
  to: string = '';
  fba: boolean = false;
  mba: boolean = false;
  new: boolean = false;
  mint: boolean = false;
  verygood: boolean = false;
  good: boolean = false;
  acceptable: boolean = false;
  radioControl = new FormControl(this.status);
  selectControl = new FormControl(this.dulation);
  fromControl = new FormControl(this.from);
  toControl = new FormControl(this.to);
  fbaControl = new FormControl(this.fba);
  mbaControl = new FormControl(this.mba);
  newControl = new FormControl(this.new);
  mintControl = new FormControl(this.mint);
  verygoodControl = new FormControl(this.verygood);
  goodControl = new FormControl(this.good);
  acceptableControl = new FormControl(this.acceptable);
  form!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private dbService: DbService,
    private overlaySpinnerService: OverlaySpinnerService
  ) { }

  ngOnInit(): void {
    this.overlaySpinnerService.attach();
    for(let i = 1; i < 31; i++){
      this.dulations.push({value: i, viewValue: `${i}日後に送信する`});
    }
    this.form = this.fb.group({
      status: this.radioControl,
      select: this.selectControl,
      from: this.fromControl,
      to: this.toControl,
      fba: this.fbaControl,
      mba: this.mbaControl,
      new: this.newControl,
      mint: this.mintControl,
      verygood: this.verygoodControl,
      good: this.goodControl,
      acceptable: this.acceptableControl
    });
    this.getConfig();
  }

  getConfig() : void {
    /* Initialize only checkbox here */
    this.config.fba = false;
    this.config.mba = false;
    this.config.new = false;
    this.config.mint = false;
    this.config.verygood = false;
    this.config.good = false;
    this.config.acceptable = false;

    this.dbService.get<config>('config')
    .subscribe(config => {
      this.config = config;
      //console.log(this.config);
      if(this.config.status) this.status = this.statusOptions[1];
      this.dulation = this.config.dulation;
      this.from = this.config.from;
      this.to = this.config.to;
      this.fba = this.config.fba;
      this.mba = this.config.mba;
      this.new = this.config.new;
      this.mint = this.config.mint;
      this.verygood = this.config.verygood;
      this.good = this.config.good;
      this.acceptable =this.config.acceptable;
      this.overlaySpinnerService.detach();
    });
  }

  onSave(): void {

    console.log(this.form.value);
    console.log(`fba:${this.fba} mba:${this.mba} new:${this.new} mint:${this.mint} verygood:${this.verygood} good:${this.good} acceptable:${this.acceptable}`);
    if (Number(this.to.substr(0,2)) < Number(this.from.substr(0,2))){
      console.log('hour-error');
    }
    else{
      if(Number(this.to.substr(3,2)) > Number(this.from.substr(3,2))){
        console.log('time setting valid');
      }
      else{
        console.log('minute-error');
      }
    }

    this.overlaySpinnerService.attach();
    if(this.status === this.statusOptions[0]) this.config.status = false;
    if(this.status === this.statusOptions[1]) this.config.status = true;
    this.config.dulation = this.dulation;
    this.config.from = this.from;
    this.config.to = this.to;
    this.config.fba = this.fba;
    this.config.mba = this.mba;
    this.config.new = this.new;
    this.config.mint = this.mint;
    this.config.verygood = this.verygood;
    this.config.good = this.good;
    this.config.acceptable = this.acceptable;
    this.dbService.update<config>('config', this.config)
    .subscribe(result => {
      if(result){
        this.overlaySpinnerService.detach();
        //this.submitting = false;
        this.ngOnInit();
      }
      else{
        console.log("config update failed");
      }
    })

  }

}
