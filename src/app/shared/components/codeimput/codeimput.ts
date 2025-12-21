import { Component, ElementRef, EventEmitter, Output, QueryList, ViewChildren, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type CodeInputType = 'numeric' | 'alpha' | 'alphanumeric';

@Component({
  selector: 'app-codeimput',
  standalone: true, // Asumo que es standalone por tu código anterior
  imports: [CommonModule, FormsModule],
  templateUrl: './codeimput.html',
  styleUrl: './codeimput.scss',
})
export class CodeImput {
  
  // --- INPUTS DINÁMICOS (Angular Signals) ---
  // Define cuántas cajas quieres (ej: 4, 6, 8)
  length = input<number>(6); 
  
  // Define qué caracteres se permiten
  inputType = input<CodeInputType>('numeric'); 

  // --- ESTADO ---
  // Array mutable para el ngModel (se reconstruye en el effect)
  digitsArray: string[] = []; 
  
  hasError = signal(false);

  @Output() codeCompleted = new EventEmitter<string>();

  @ViewChildren('inputEl') inputs!: QueryList<ElementRef<HTMLInputElement>>;

  constructor() {
    // EFFECT: Reacciona cuando cambia el 'length' desde el padre
    effect(() => {
      const size = this.length();
      // Reiniciamos el array con la nueva longitud
      this.digitsArray = new Array(size).fill('');
    });
  }

  /**
   * Obtiene la Expresión Regular según el tipo configurado
   */
  private getValidationRegex(): RegExp {
    switch (this.inputType()) {
      case 'numeric': return /[^0-9]/g;
      case 'alpha': return /[^a-zA-Z]/g;
      case 'alphanumeric': return /[^a-zA-Z0-9]/g;
      default: return /[^0-9]/g;
    }
  }

  /**
   * Maneja la entrada de texto normal
   */
  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // 1. Limpieza dinámica basada en el inputType
    const regex = this.getValidationRegex();
    value = value.replace(regex, '');
    
    // Convertir a mayúsculas si son letras
    if (this.inputType() !== 'numeric') {
      value = value.toUpperCase();
    }

    this.digitsArray[index] = value;
    input.value = value; // Reflejar limpieza en el DOM

    // 2. Mover foco al siguiente (Dinámico: usa this.length())
    if (value.length === 1 && index < this.length() - 1) {
      this.inputs.get(index + 1)?.nativeElement.focus();
    }

    this.checkCompletion();
  }

  /**
   * Maneja la tecla de borrar (Backspace)
   */
  onBackspace(event: any, index: number) {
    // Si está vacío, retroceder foco
    if (event.target.value === '' && index > 0) {
      this.inputs.get(index - 1)?.nativeElement.focus();
    }
    
    // Chequear completitud después de un breve delay
    setTimeout(() => this.checkCompletion(), 0);
  }

  /**
   * Maneja el pegado de texto completo
   */
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');

    if (!pastedText) return;

    // 1. Limpieza dinámica
    const regex = this.getValidationRegex();
    // Limpiar y cortar al tamaño configurado
    let cleanText = pastedText.replace(regex, '').slice(0, this.length());
    
    if (this.inputType() !== 'numeric') {
      cleanText = cleanText.toUpperCase();
    }

    // 2. Rellenar array
    for (let i = 0; i < cleanText.length; i++) {
      this.digitsArray[i] = cleanText[i];
    }
    
    // 3. Enfocar el último llenado o el siguiente vacío
    const focusIndex = Math.min(cleanText.length, this.length() - 1);
    this.inputs.get(focusIndex)?.nativeElement.focus();
    
    this.checkCompletion();
  }

  /**
   * Verifica si el código está completo según el length dinámico
   */
  private checkCompletion() {
    this.hasError.set(false);
    const code = this.digitsArray.join('');
    
    // Comparar contra this.length() en lugar de número fijo
    if (code.length === this.length()) {
      this.codeCompleted.emit(code);
      this.inputs.last.nativeElement.blur();
    }
  }

  reset() {
    // Resetear array respetando el tamaño actual
    this.digitsArray = new Array(this.length()).fill('');
    this.hasError.set(false);
    this.inputs.first.nativeElement.focus();
  }
}