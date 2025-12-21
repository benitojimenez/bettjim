import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class User {
  _http = inject(HttpClient);

  constructor() { }

   register(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(environment.API_URL + 'register/', data, { headers: headers });
  }

  //
  login(data: any): Observable<any> {
    return this._http.post(environment.API_URL + 'login',data);
  }
  verify_user(id: any, data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.put(environment.API_URL + 'verify_user/' + id, data, { headers: headers }); 
  }

  /* ---------------------------------------------
  -----------------  Cart  --------------------
  ---------------------------------------------
  */

  create_cart(data: any): Observable<any> {   
    let headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.post(environment.API_URL + 'create_cart', data,{ headers: headers });
  }

  list_cart(id: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.get(environment.API_URL + 'list_cart/'+id,{ headers: headers });
  } 

  update_cart(id: any, data: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.put(environment.API_URL + 'update_cart/'+id,data,{ headers: headers });
  }
  aplicar_cupon_carrito(id: any,data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(environment.API_URL + 'aplicar_cupon_carrito/'+id,data,{ headers: headers });
  }

  delete_cart(id: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json'});
    return this._http.delete(environment.API_URL +'delete_cart/'+id,{ headers: headers });
  }

  //------------------------------------------------
  // Modulo de compras
  //---------------------------------------------------
  register_order(data: any): Observable<any> {
    return this._http.post(environment.API_URL + 'register_order', data);
  }

  get_orders_user(id: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(environment.API_URL + 'get_orders_user/' + id, { headers: headers });
  }
  get_detailorder_user(id:any,token:any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.get(environment.API_URL+'get_detailorder_user/'+id,{ headers: headers });
  }

}
