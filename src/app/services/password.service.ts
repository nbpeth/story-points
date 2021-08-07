import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {catchError, tap} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  constructor(private http: HttpClient,
              private authService: AuthService,
              private localStorage: LocalStorageService) {
  }

  // hashing should be done server side, https only
  static encode = (value: string): string => Base64.stringify(hmacSHA512(sha256(value), 'somepig'));

  authorizeSession = (sessionId: any, encodedPassword: string) => {
    return this.http.post(`${environment.host}/${sessionId}/auth`,
      {
        passCode: encodedPassword
      },
      {headers: new HttpHeaders().append('Authorization', `Bearer ${this.localStorage.get('jwt')}`)})
      .pipe(
        tap(response => {
          const existingStorageForSession = JSON.parse(sessionStorage.getItem(`${sessionId}`) || '{}');
          sessionStorage.setItem(`${sessionId}`, JSON.stringify({...existingStorageForSession, password: encodedPassword}));
        }),
        catchError((error: any) => {

          this.localStorage.clearSessionPasswordCache(sessionId);

          return throwError(error);
        })
      );

  }


}
