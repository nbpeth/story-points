import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  constructor(private http: HttpClient) { }

  // hashing should be done server side, https only
  static encode = (value: string): string => Base64.stringify(hmacSHA512(sha256(value), 'somepig'));

  authorizeSession = (sessionId: any, passCode: string) => {
    return this.http.post(`${environment.host}/${sessionId}/auth`,
      {},
      { headers: new HttpHeaders().append('Authorization', PasswordService.encode(passCode)) });
  }
}
