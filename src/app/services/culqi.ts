import { Injectable,inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class CulqiService { 
  _http = inject(HttpClient);
  
  // Métodos para crear token
  createToken(data: any): Observable<any> {
    return this._http.post(environment.API_URL+'culqi_token', data);
  }
  // Métodos para crear token
  createTokenYape(data: any): Observable<any> {
    return this._http.post(environment.API_URL+'culqi_tokenyape', data);
  }
  // Métodos para crear cargo
  createCharge(data: any): Observable<any> {
    return this._http.post(environment.API_URL+'culqi_charges', data);
  }

 

}