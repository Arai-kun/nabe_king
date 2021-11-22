import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { shareReplay, tap, catchError} from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { user } from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient
  ) { }

  login(user: user): Observable<boolean>{
    return this.http.post<user>('/auth/login', user)
    .pipe(
      map(result =>{
        if(result) return true;
        return false;
      }),
      catchError(this.handleError<boolean>(false)),
      shareReplay(1)
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>('/auth')
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
    return this.http.get<string>('auth/logout')
    .pipe(
      catchError(this.handleError<string>('logout failed'))
    );
  }

  exchangeToken(code: string): Observable<Object> {
    return this.http.post('auth/exchange', code)
    .pipe(
      catchError(this.handleError<Object>({})),
      shareReplay(1)
    );
  }

  handleError<T>(result?: T) {
    return (error: any): Observable<T> => {
      console.log(error);
      return of(result as T);
    }
  }
}
