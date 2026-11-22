import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Migalha {
  rotulo: string;
  link?: string;
}

/** Breadcrumb + eyebrow + título + subtítulo, padrão das telas internas. */
@Component({
  selector: 'app-cabecalho-pagina',
  imports: [RouterLink],
  template: `
    @if (migalhas().length) {
      <nav class="breadcrumb-eco" aria-label="Você está em">
        @for (m of migalhas(); track m.rotulo; let ultimo = $last) {
          @if (m.link && !ultimo) {
            <a [routerLink]="m.link">{{ m.rotulo }}</a>
            <span>/</span>
          } @else {
            <span class="atual">{{ m.rotulo }}</span>
          }
        }
      </nav>
    }
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
      <div>
        @if (eyebrow()) {
          <span class="eco-eyebrow mb-1">{{ eyebrow() }}</span>
        }
        <h1 class="eco-titulo mb-1">{{ titulo() }}</h1>
        @if (subtitulo()) {
          <p class="eco-subtitulo small mb-0">{{ subtitulo() }}</p>
        }
      </div>
      <ng-content />
    </div>
  `,
})
export class CabecalhoPagina {
  readonly migalhas = input<Migalha[]>([]);
  readonly eyebrow = input<string>();
  readonly titulo = input.required<string>();
  readonly subtitulo = input<string>();
}
