import {Injectable} from '@angular/core';
import {flatMap} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private http: HttpClient, private authService: AuthService) {
  }

  getSessionDetails = (sessionId: any) => {
    return this.authService.getAccessTokenSilently()
      .pipe(
        flatMap((accessToken: any) => {
            return this.http.get(`/sessions/${sessionId}`,

              {headers: new HttpHeaders().append('Authorization', `Bearer ${accessToken}`)});
          }
        ),
      );
  }
}
