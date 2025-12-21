import { CanDeactivateFn } from '@angular/router';

// Interfaz para componentes que necesitan confirmar salida
export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const preventExitGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  // Si el componente tiene el método canDeactivate, lo usamos
  return component.canDeactivate ? component.canDeactivate() : true;
};