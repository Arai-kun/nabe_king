import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { DbService } from '../db.service';
import { data } from '../data';
import { MatTableDataSource } from '@angular/material/table';
import { OverlaySpinnerService } from '../overlay-spinner.service';
import { ToastrService } from 'ngx-toastr';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface displayData {
    orderId: string,
    purchaseDate: string,
    itemName: string,
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
export class DataComponent implements OnInit, AfterViewInit{
  data!: data['data_arr']; 
  displayedColumns: string[] = [
    'orderId',
    'purchaseDate',
    'itemName',
    'orderStatus',
    'isSent',
    'notSend'
  ];

  dataSource = new MatTableDataSource<displayData>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dbService: DbService,
    private overlaySpinnerService: OverlaySpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.overlaySpinnerService.attach();
    this.getData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  
  /**
   * Notice!: Push() for dataSource does not generate a trigger of object change in mat-table.
   *          Use '=' to provide data to dataSource.
   */

  getData(): void {
    this.dbService.get<data>('data')
    .subscribe(data => {
      this.data = data['data_arr'];
      if(!this.data){
        this.overlaySpinnerService.detach();
        return;
      }
      let bufOrderStatus: string;
      let bufIsSent: string;
      let bufData: displayData[] = [];
      for(let i = 0; i < this.data.length; i++){
        if(this.data[i].orderStatus === 'Shipped' || this.data[i].orderStatus === 'InvoiceUnconfirmed'){
          //this.dataSource[i].orderStatus = '発送済';
          bufOrderStatus = '発送済';
        }
        else{
          bufOrderStatus = '未発送';
        }
        if(this.data[i].isSent){
          bufIsSent = '配信済';
        }
        else{
          //this.dataSource[i].isSent = '未配信';
          bufIsSent = '未配信';
        }
        let date = new Date(this.data[i].purchaseDate);
        bufData.push({
          orderId: this.data[i].orderId,
          purchaseDate: `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/ ${date.getHours()}:${date.getMinutes()}`,
          itemName: this.data[i].itemName,
          orderStatus: bufOrderStatus,
          isSent: bufIsSent,
          unSend: this.data[i].unSend
        });
      }
      this.dataSource.data = bufData;
      this.overlaySpinnerService.detach();
    });
  }

  onSave(): void {
    this.overlaySpinnerService.attach();
    /* 未配信のみの配列に絞るべきか */
    for(let i = 0; i < this.dataSource.data.length; i++){
      if(this.dataSource.data[i].unSend === true) this.data[i].unSend = true;
      if(this.dataSource.data[i].unSend === false) this.data[i].unSend = false;
    }
    this.dbService.update<data>('data', {email: "", data_arr: this.data})
    .subscribe(result => {
      if(result){
        this.overlaySpinnerService.detach();
        this.toastrService.success('反映しました', '', { positionClass: 'toast-bottom-center', timeOut: 5000, closeButton: true});
        this.ngOnInit();
      }
      else{
        this.overlaySpinnerService.detach();
        this.toastrService.error('大変申し訳ありません。お手数ですが、お問い合わせからご報告をお願いいたします', '反映失敗', { positionClass: 'toast-bottom-full-width', timeOut: 6000, closeButton: true});
      }
    });
  }
}
