import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '@auth0/auth0-angular';
import {LocalStorageService} from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient,
              private authService: AuthService,
              private localStorageService: LocalStorageService
  ) {
  }

  getSessionDetails = (sessionId: any) => {
    const token = this.localStorageService.getIdToken();
    return this.http.post(
      `/sessionDetails`,
      { sessionId },
      {headers: new HttpHeaders().append('Authorization', `Bearer ${token}`)}
    );
  }
}
