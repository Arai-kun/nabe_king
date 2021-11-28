import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { user } from './user';
import { config } from './config'; 

@Injectable({
  providedIn: 'root'
})
export class DbService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) { }

  createUser(user: user): Observable<any>{
    return this.http.post('user', user, this.httpOptions)
    .pipe(
      catchError(this.handleError<any>(null)),
      shareReplay(1)
    );
  }

  userExist(email: string): Observable<boolean> {
    return this.http.post<boolean>('user/exist', JSON.stringify({"email": email}), this.httpOptions)
    .pipe(
      map(result => {
        if(result){
          return true;
        }
        else{
          return false;
        }
      }),
      catchError(this.handleError<boolean>(false))
    );
  }

  tokensExist(): Observable<boolean> {
    return this.http.get<boolean>('user/tokens', this.httpOptions)
    .pipe(
      map(result => {
        if(result){
          return true;
        }
        else{
          return false;
        }
      }),
      catchError(this.handleError<boolean>(false))
    );
  }

  dbInit(): Observable<any> {
    return this.http.get('user/init', this.httpOptions)
    .pipe(
      catchError(this.handleError<any>(null)),
      shareReplay(1)
    );
  }

  get<T>(kind: string): Observable<T> {
    const url = `user/${kind}`;
    return this.http.get<T>(url, this.httpOptions)
    .pipe(
      catchError(this.handleError<T>())
    )
  }

  private handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
