import { Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

const MENSAGENS: Record<string, (e: any) => string> = {
  required: () => 'Campo obrigatório.',
  email: () => 'E-mail em formato inválido.',
  minlength: (e) => `Mínimo de ${e.requiredLength} caracteres.`,
  maxlength: (e) => `Máximo de ${e.requiredLength} caracteres.`,
  telefone: () => 'Informe um telefone com DDD.',
  cep: () => 'CEP deve ter 8 dígitos.',
  codigo: () => 'O código tem 6 dígitos.',
  senhaFraca: () => 'Use 8+ caracteres com letra maiúscula, minúscula, número e caractere especial.',
  materiais: () => 'Selecione pelo menos um material.',
};

/**
 * Mostra a mensagem de erro de um campo (validação local ou vinda da API).
 * Uso: <app-erro-campo [controle]="form.controls.email" />
 *
 * O Angular 22 usa OnPush por padrão, então o componente escuta `control.events`
 * (valor, status, touched) e guarda uma "versão" em signal para se redesenhar.
 */
@Component({
  selector: 'app-erro-campo',
  template: `
    @if (mensagem(); as msg) {
      <div class="invalid-feedback d-block">{{ msg }}</div>
    }
  `,
})
export class ErroCampo {
  readonly controle = input.required<AbstractControl | null>();
  private readonly versao = signal(0);

  constructor() {
    effect((onCleanup) => {
      const c = this.controle();
      if (!c) return;
      const sub = c.events.subscribe(() => this.versao.update((v) => v + 1));
      onCleanup(() => sub.unsubscribe());
    });
  }

  readonly mensagem = computed(() => {
    this.versao();
    const c = this.controle();
    if (!c || !c.errors || !(c.touched || c.dirty)) return null;
    const [chave, valor] = Object.entries(c.errors)[0];
    if (chave === 'api') return String(valor);
    return MENSAGENS[chave]?.(valor) ?? 'Valor inválido.';
  });
}
