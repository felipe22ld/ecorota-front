import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  texto: string;
  tipo: 'sucesso' | 'info' | 'erro';
}

/** Avisos rápidos (toasts) exibidos no canto da tela. */
@Injectable({ providedIn: 'root' })
export class AvisoService {
  private seq = 0;
  readonly avisos = signal<Aviso[]>([]);

  sucesso(texto: string): void {
    this.mostrar(texto, 'sucesso');
  }

  info(texto: string): void {
    this.mostrar(texto, 'info');
  }

  erro(texto: string): void {
    this.mostrar(texto, 'erro');
  }

  fechar(id: number): void {
    this.avisos.update((lista) => lista.filter((a) => a.id !== id));
  }

  private mostrar(texto: string, tipo: Aviso['tipo']): void {
    const id = ++this.seq;
    this.avisos.update((lista) => [...lista, { id, texto, tipo }]);
    setTimeout(() => this.fechar(id), 5000);
  }
}
