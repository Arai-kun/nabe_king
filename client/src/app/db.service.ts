import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { user } from './user'; 

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
    );
  }

  getAll<T>(kind: string): Observable<T[]> {
    const url = `user/${kind}`;
    return this.http.get<T[]>(url, this.httpOptions)
    .pipe(
      catchError(this.handleError<T[]>())
    );
  }

  update<T>(kind: string, data: T): Observable<boolean> {
    const url = `user/${kind}`;
    return this.http.post<T>(url, data, this.httpOptions)
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

  pwReset(token: string): Observable<any> {
    return this.http.post('user/reset', JSON.stringify({"token": token}), this.httpOptions)
    .pipe(
      catchError(this.handleError<any>(null))
    );
  }

  pwRepublish(email: string, password: string): Observable<boolean> {
    return this.http.post('user/republish', JSON.stringify({"email": email, "password": password}), this.httpOptions)
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

  delete() : Observable<boolean> {
    const url = 'user/delete';
    return this.http.get(url, this.httpOptions)
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

  private handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
