import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { shareReplay, tap, catchError} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { user } from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient
  ) { }

  createUser(user: user): Observable<any>{
    return this.http.post('auth/create', user, this.httpOptions)
    .pipe(
      catchError(this.handleError<any>(null)),
      shareReplay(1)
    );
  }

  userExist(email: string): Observable<boolean> {
    return this.http.post<boolean>('auth/exist', JSON.stringify({"email": email}), this.httpOptions)
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


  login(user: user): Observable<boolean>{
    return this.http.post<user>('/auth/login', user, this.httpOptions)
    .pipe(
      map(result =>{
        if(result){
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

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>('/auth/check', this.httpOptions)
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

  logout(): Observable<string>{
    return this.http.get<string>('/auth/logout', this.httpOptions)
    .pipe(
      catchError(this.handleError<string>('logout failed'))
    );
  }

  exchangeToken(code: string, id: string): Observable<any> {
    return this.http.post('auth/exchange', JSON.stringify({'code': code, 'id': id}), this.httpOptions)
    .pipe(
      catchError(this.handleError<any>(null)),
      shareReplay(1)
    );
  }

  pwReset(email: string): Observable<any> {
    return this.http.post('auth/reset', JSON.stringify({"email": email}),this.httpOptions)
    .pipe(
      catchError(this.handleError<any>(null)),
      shareReplay(1)
    );
  }

  tokenCheck(token: string): Observable<any> {
    return this.http.post('auth/tokenCheck', JSON.stringify({"token": token}), this.httpOptions)
    .pipe(
      catchError(this.handleError<any>(null))
    );
  }

  pwRepublish(email: string, password: string): Observable<boolean> {
    return this.http.post('auth/republish', JSON.stringify({"email": email, "password": password}), this.httpOptions)
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

  handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.log(error);
      return of(result as T);
    }
  }
}
