import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
      //tap(() => console.log(`sending user data =${user}`)),
      map(result =>{
        if(result) return true;
        return false;
      }),
      catchError(() => of(false)),
      shareReplay(1)
    )
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>('/auth')
    .pipe(
      //tap(() => console.log('Confirm if authenticated')),
      //catchError(() => of('isAuthenticated fail'))
      map(result => {
        if(result){
          return true;
        }
        else{
          return false;
        }
      }),
      catchError(() => of(false))
    )
  }

  logout(): Observable<string>{
    return this.http.get<string>('auth/logout')
    .pipe(
      //tap(() => console.log('logouting...')),
      catchError(() => of('logout failed'))
    )
  }
}
