import { Component, Output, EventEmitter, signal, HostListener, ElementRef, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  id: string | number;
  name: string;
  department_id?: string; // Para provincias
  province_id?: string;   // Para distritos
}
@Component({
  selector: 'app-custom-select',
  imports: [CommonModule],
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.scss',
})
export class CustomSelect {
 // Inputs como Signals (Lectura desde el padre)
  label = input<string>('Seleccionar...');
  options = input<SelectOption[]>([]); 
  selectedId = input<string | number | null | undefined>(null);
  disabled = input<boolean>(false);

  @Output() selectionChange = new EventEmitter<any>();

  isOpen = signal(false);
  searchQuery = signal('');

  // Filtro reactivo
  filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const data = Array.isArray(this.options()) ? this.options() : []; 
    
    if (!query) return data;
    return data.filter(opt => opt.name.toLowerCase().includes(query));
  });

  constructor(private eRef: ElementRef) { }

  // Getter corregido (añadidos paréntesis a options)
  get selectedName(): string {
    const opts = this.options(); // 🔥 Faltaban paréntesis aquí
    if (!opts || !Array.isArray(opts)) return '';
    
    const found = opts.find(opt => opt.id === this.selectedId()); 
    return found ? found.name : '';
  }

  toggleDropdown() {
    if (this.disabled()) return;
    this.isOpen.update(v => {
      if (!v) this.searchQuery.set('');
      return !v;
    });
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  selectOption(option: any) {
    if (!option) return;
    
    // 🔥 IMPORTANTE: No puedes hacer this.selectedId = option.id
    // El padre recibirá el evento y actualizará el valor que fluye hacia el input selectedId()
    this.selectionChange.emit(option); 
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}