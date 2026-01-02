import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { HttpClient, HttpHeaders, httpResource } from '@angular/common/http';
import { Observable, filter } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from '../shared/classes/order';
import { sign } from 'crypto';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from './auth';

interface OrderResponse {
  data: Order[];
}



@Injectable({
  providedIn: 'root'
})
export class User {
  
  _http = inject(HttpClient);
  authService = inject(Auth);
  private platformId = inject(PLATFORM_ID);
  router = inject(Router);

  constructor() { }

  register(data: any): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(environment.API_URL + 'register/', data, { headers: headers });
  }

  //
  login(data: any): Observable<any> {
    return this._http.post(environment.API_URL + 'login', data);
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
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(environment.API_URL + 'create_cart', data, { headers: headers });
  }

  list_cart(id: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.get(environment.API_URL + 'list_cart/' + id, { headers: headers });
  }

  update_cart(id: any, data: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.put(environment.API_URL + 'update_cart/' + id, data, { headers: headers });
  }
  aplicar_cupon_carrito(id: any, data: any, token: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token });
    return this._http.put(environment.API_URL + 'aplicar_cupon_carrito/' + id, data, { headers: headers });
  }

  delete_cart(id: any): Observable<any> {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.delete(environment.API_URL + 'delete_cart/' + id, { headers: headers });
  }

  //------------------------------------------------
  // Modulo de compras
  //---------------------------------------------------
  register_order(data: any): Observable<any> {
    return this._http.post(environment.API_URL + 'register_order', data);
  }

  public OrdersResource = httpResource<OrderResponse>(() => {

    // 4. VERIFICAMOS SI ESTAMOS EN EL NAVEGADOR ANTES DE USAR localStorage
     if (isPlatformBrowser(this.platformId) && this.authService.isAuthenticated()) {
    return {
      url: `${environment.API_URL}get_orders_user`,
      method: 'GET'
    };
  }
    return undefined; // En el servidor o sin auth, no hace petición  
  }, { defaultValue: { data: [] } });

  private serverOrdersClean = computed(() => {
    const response = this.OrdersResource.value();
    return response?.data ?? [];
  });

  orderFilter = signal<'all' | 'active' | 'completed' | 'cancelled'>('all');
  activeFilter = signal<'all' | 'active' | 'completed' | 'cancelled'>('all');
  searchOrder = signal('');


  public filteredOrders = computed(() => {
    const all = this.serverOrdersClean();
    if (this.searchOrder()) return all.filter(o => o.n_order.includes(this.searchOrder()));
    if (this.orderFilter() === 'all') return all;
    if (this.orderFilter() === 'active') return all.filter(o => ['Procesando', 'Enviado'].includes(o.status));
    if (this.orderFilter() === 'completed') return all.filter(o => o.status === 'Completado');
    if (this.orderFilter() === 'cancelled') return all.filter(o => o.status === 'Cancelado');

    return all;
  });
  public ordersActiveCount = computed(() => {
    return this.serverOrdersClean().filter(o => ['Procesando', 'Enviado'].includes(o.status)).length;
  });


  get_order_details(): Observable<any> {
    return this._http.get(environment.API_URL+'get_order_details');
  }

  //update profile user
  get_customer_profile() : Observable<any> {
    return this._http.get(environment.API_URL+'get_customer_profile');
  }

  update_customer_profile(data:any) : Observable<any> {
    return this._http.put(environment.API_URL+'update_customer_profile',data);
  }
  update_password(data:any) : Observable<any> {
    return this._http.put(environment.API_URL+'update_password',data);
  }
  delete_user(): Observable<any> {
    return this._http.delete(environment.API_URL + 'delete_user');
  }





  

}
