import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private api: ApiService) {}

  checkUser(username: string, password: string): Observable<any> {
    return this.api.post('checkuser/', {
      userName: username,
      password: password
    });
  }
}
