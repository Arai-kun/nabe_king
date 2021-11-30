import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { map } from 'rxjs/operators';
import { mail } from './mail';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) { }

  send(mail: mail): Observable<boolean>{
    return this.http.post<mail>('/mail/send', mail, this.httpOptions)
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
