import { Component, OnInit } from '@angular/core';
import { DbService } from '../db.service';
import { data } from '../data';

export interface displayData {
    orderId: string,
    purchaseDate: Date,
    orderStatus: string,
    buyerEmail: string,
    buyerName: string,
    itemName: string,
    quantityOrdered: number,
    isSent: string
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
    purchaseDate: new Date(),
    buyerName: "",
    buyerEmail: "",
    itemName: "",
    quantityOrdered: 0,
    orderStatus: "",
    isSent: ""
  }];
  notSend: boolean = false;

  constructor(
    private dbService: DbService
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.dbService.get<data>('data')
    .subscribe(data => {
      let data_arr: data['data_arr'] = data['data_arr'];
      for(let i = 0; i < data_arr.length; i++){
        if(data_arr[i].orderStatus === 'Shipped' || data_arr[i].orderStatus === 'InvoiceUnconfirmed'){
          this.dataSource[i].orderStatus = '発送済';
        }
        else{
          this.dataSource[i].orderStatus = '未発送';
        }
        if(data_arr[i].isSent){
          this.dataSource[i].isSent = '配信済';
        }
        else{
          this.dataSource[i].isSent = '未配信';
        }
        this.dataSource[i].orderId = data_arr[i].orderId;
        this.dataSource[i].purchaseDate = data_arr[i].purchaseDate;
        this.dataSource[i].buyerName = data_arr[i].buyerName;
        this.dataSource[i].buyerEmail = data_arr[i].buyerEmail;
        this.dataSource[i].itemName= data_arr[i].itemName;
        this.dataSource[i].quantityOrdered = data_arr[i].quantityOrdered;
      }
    });
  }

  onSave(): void {
    console.log(this.notSend);
  }

}
