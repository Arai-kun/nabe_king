import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { testMail } from './testMail';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) { }

  send(mail: testMail): Observable<boolean>{
    return this.http.post<testMail>('/mail/send', mail, this.httpOptions)
    .pipe(
      map(result =>{
        if(result) {
          return true;
        }
        else{
          return false;
        }
      }),
      catchError(this.handleError<boolean>(false)),
      shareReplay(1)
    );
  }

  private handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
