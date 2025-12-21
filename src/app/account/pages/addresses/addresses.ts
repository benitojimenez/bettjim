import { Component, signal } from '@angular/core';


interface Address {
  id: string;
  alias: string; // Ej: Casa, Trabajo
  receiver: string;
  street: string;
  city: string;
  phone: string;
  isDefault: boolean;
}
@Component({
  selector: 'app-addresses',
  imports: [],
  templateUrl: './addresses.html',
  styleUrl: './addresses.scss',
})
export default class Addresses {
  addresses = signal<Address[]>([
    {
      id: '1',
      alias: 'Casa Principal',
      receiver: 'Juan Pérez',
      street: 'Av. Larco 123, Dpto 401',
      city: 'Miraflores, Lima',
      phone: '+51 999 111 222',
      isDefault: true
    },
    {
      id: '2',
      alias: 'Oficina',
      receiver: 'Juan Pérez (Recepción)',
      street: 'Calle Las Begonias 450, Piso 8',
      city: 'San Isidro, Lima',
      phone: '+51 999 333 444',
      isDefault: false
    }
  ]);

  setDefault(id: string) {
    // Lógica para actualizar en backend y luego en local
    this.addresses.update(list => list.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  }

  deleteAddress(id: string) {
    if(confirm('¿Estás seguro de eliminar esta dirección?')) {
      this.addresses.update(list => list.filter(a => a.id !== id));
    }
  }
}
