import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Ubigeo {
  // Inyectamos la plataforma para saber si estamos en el servidor o navegador
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // URL base de tu nueva API de Node.js
  private readonly API_URL = `${environment.API_URL}v1/peru/location/`;

  // --- SEÑALES DE SELECCIÓN ---
  selectedDepId = signal<string | null>(null);
  selectedProvId = signal<string | null>(null);
  selectedDistId = signal<string | null>(null);

  // --- RECURSOS HTTP (Carga reactiva segura para SSR) ---

  // 1. Regiones
  public regionesResource = httpResource<{ data: any[] }>(() => {
    // 🔥 Si es el servidor, abortamos (evita error NG0991 y bloqueos SSR)
    if (!this.isBrowser) return undefined;

    return { 
      url: `${this.API_URL}regions`, 
      method: 'GET' 
    };
  }, { defaultValue: { data: [] } });

  // 2. Provincias
  private provinciasResource = httpResource<{ data: any[] }>(() => {
    const depId = this.selectedDepId();
    // 🔥 Abortamos si no es navegador o si no hay selección
    if (!this.isBrowser || !depId) return undefined;

    return {
      url: `${this.API_URL}provinces/${depId}`,
      method: 'GET'
    };
  }, { defaultValue: { data: [] } });

  // 3. Distritos
  private distritosResource = httpResource<{ data: any[] }>(() => {
    const provId = this.selectedProvId();
    // 🔥 Abortamos si no es navegador o si no hay selección
    if (!this.isBrowser || !provId) return undefined;
    
    return {
      url: `${this.API_URL}districts/${provId}`,
      method: 'GET'
    };
  }, { defaultValue: { data: [] } });


  // --- COMPUTED (Consumo directo para la UI) ---
  // El .data ahora es seguro porque el defaultValue coincide con tu interfaz
  regiones = computed(() => this.regionesResource.value()?.data ?? []);
  provinciasFiltradas = computed(() => this.provinciasResource.value()?.data ?? []);
  distritosFiltrados = computed(() => this.distritosResource.value()?.data ?? []);

  // --- ESTADOS DE CARGA ---
  loadingRegiones = this.regionesResource.isLoading;
  loadingProvincias = this.provinciasResource.isLoading;
  loadingDistritos = this.distritosResource.isLoading;


  // --- MÉTODOS DE ACTUALIZACIÓN ---
  setDepartamento(id: string | null) {
    this.selectedDepId.set(id);
    this.selectedProvId.set(null); 
    this.selectedDistId.set(null);
  }

  setProvincia(id: string | null) {
    this.selectedProvId.set(id);
    this.selectedDistId.set(null);
  }

  setDistrito(id: string | null) {
    this.selectedDistId.set(id);
  }
}