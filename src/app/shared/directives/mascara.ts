import { Directive, HostListener, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { formatarCep, formatarTelefone, somenteDigitos } from '../utils/formatos';

type TipoMascara = 'telefone' | 'cep' | 'codigo';

/** Máscara simples para inputs de formulário reativo: appMascara="telefone" | "cep" | "codigo". */
@Directive({ selector: 'input[appMascara]' })
export class Mascara {
  readonly appMascara = input.required<TipoMascara>();
  private readonly ngControl = inject(NgControl, { optional: true, self: true });

  @HostListener('input', ['$event'])
  aoDigitar(evento: Event): void {
    const el = evento.target as HTMLInputElement;
    const formatado = this.formatar(el.value);
    if (formatado !== el.value) {
      el.value = formatado;
      this.ngControl?.control?.setValue(formatado, { emitEvent: true });
    }
  }

  private formatar(valor: string): string {
    switch (this.appMascara()) {
      case 'telefone':
        return formatarTelefone(valor);
      case 'cep':
        return formatarCep(valor);
      default:
        return somenteDigitos(valor).slice(0, 6);
    }
  }
}
