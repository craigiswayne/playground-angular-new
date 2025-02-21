import {inject, Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {tap} from 'rxjs';
import {environment} from '../../environments/environment';

const tokenKey = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient)

  public get isLoggedIn() {
    return [null, '', undefined].indexOf(this.token) === -1
  }

  private _token: string|null|undefined;
  public get token(): string|null|undefined {
    return localStorage.getItem(tokenKey);
  }

  public login(username: string, password: string){
    return this.http.post<LoginResponse>(environment.endpoints.login, {
      username,
      password,
      expiresInMins: 30
    }, {
      withCredentials: true
    }).pipe(
      tap(resp => {
        if(!resp){
          return
        }
        localStorage.setItem(tokenKey, resp.token)
        this.router.navigate(['/'], {skipLocationChange: false});
      })
    )
  }

  public logout(){
    localStorage.removeItem(tokenKey);
    this.router.navigate(['/login'], {skipLocationChange: false});
  }
}

interface LoginResponse {
  token: string;
}
