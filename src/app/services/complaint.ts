import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'; // Tu URL base

@Injectable({
  providedIn: 'root'
})
export class Complaint {
  private http = inject(HttpClient);
  // Asegúrate que tu environment tenga la URL, ej: 'http://localhost:3000/api'
  private url = environment.API_URL;

  register(data: any) {
    // Enviamos al endpoint público que creamos antes
    return this.http.post(`${this.url}complaint/register`, data);
  }
}