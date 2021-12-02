import { Component, OnInit } from '@angular/core';
import { DbService } from '../db.service';
import { data } from '../data';

export interface displayData {
    orderId: string,
    purchaseDate: string,
    buyerEmail: string,
    buyerName: string,
    itemName: string,
    quantityOrdered: number,
    orderStatus: string,
    isSent: string,
    unSend: boolean
}

/**
 * OrderStatuses
 * - PendingAvailability
 * - Pending
 * - Unshipped
 * - PartiallyShipped
 * - Shipped -> Detect Shipped
 * - InvoiceUnconfirmed -> Detect Shipped
 * - Canceled
 * - Unfulfillable
 */

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {
  submitting: boolean = false;
  data!: data; 
  /*
  data_arr: data['data_arr'] = [{
    orderId: '',
    purchaseDate: new Date(),
    orderStatus: '',
    buyerEmail: '',
    buyerName: '',
    itemName: '',
    quantityOrdered: 0,
    isSent: false,
    unSend: false
  }];*/
  displayedColumns: string[] = [
    'orderId',
    'purchaseDate',
    'buyerName',
    'buyerEmail',
    'itemName',
    'quantityOrdered',
    'orderStatus',
    'isSent',
    'notSend'
  ];
  dataSource: displayData[] = [{
    orderId: "",
    purchaseDate: "",
    buyerName: "",
    buyerEmail: "",
    itemName: "",
    quantityOrdered: 0,
    orderStatus: "",
    isSent: "",
    unSend: false
  }];

  constructor(
    private dbService: DbService
  ) { }

  ngOnInit(): void {
    this.submitting = false;
    this.getData();
  }

  getData(): void {
    this.dbService.get<data>('data')
    .subscribe(data => {
      console.log(data['data_arr']);
      this.data = data;
      console.log(this.data);
      for(let i = 0; i < this.data['data_arr'].length; i++){
        if(this.data['data_arr'][i].orderStatus === 'Shipped' || this.data['data_arr'][i].orderStatus === 'InvoiceUnconfirmed'){
          this.dataSource[i].orderStatus = '発送済';
        }
        else{
          console.log(`flag + ${i}`);
          this.dataSource[i].orderStatus = '未発送';
        }
        if(this.data['data_arr'][i].isSent){
          this.dataSource[i].isSent = '配信済';
        }
        else{
          this.dataSource[i].isSent = '未配信';
        }
        this.dataSource[i].orderId = this.data['data_arr'][i].orderId;
        console.log(this.data['data_arr'][i].purchaseDate);
        this.data['data_arr'][i].purchaseDate = new Date(this.data['data_arr'][i].purchaseDate);
        console.log(this.data['data_arr'][i].purchaseDate);
        this.dataSource[i].purchaseDate = `${this.data['data_arr'][i].purchaseDate.getFullYear()}年${this.data['data_arr'][i].purchaseDate.getMonth() + 1}月${this.data['data_arr'][i].purchaseDate.getDate()}日${this.data['data_arr'][i].purchaseDate.getHours()}時${this.data['data_arr'][i].purchaseDate.getMinutes()}分`;
        this.dataSource[i].buyerName = this.data['data_arr'][i].buyerName;
        this.dataSource[i].buyerEmail = this.data['data_arr'][i].buyerEmail;
        this.dataSource[i].itemName= this.data['data_arr'][i].itemName;
        this.dataSource[i].quantityOrdered = this.data['data_arr'][i].quantityOrdered;
        this.dataSource[i].unSend = this.data['data_arr'][i].unSend;
        console.log(this.dataSource);
      }
    });
  }

  onSave(): void {
    this.submitting = true;
    /* 未配信のみの配列に絞るべきか */
    for(let i = 0; i < this.dataSource.length; i++){
      if(this.dataSource[i].unSend === true) this.data['data_arr'][i].unSend = true;
      if(this.dataSource[i].unSend === false) this.data['data_arr'][i].unSend = false;
    }
    this.dbService.update<data>('data', {email: "", data_arr: this.data['data_arr']})
    .subscribe(result => {
      if(result){
        this.ngOnInit();
      }
      else{
        console.log('data update failed');
      }
    })
  }

}
