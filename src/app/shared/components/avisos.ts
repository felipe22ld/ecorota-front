import { Component, inject } from '@angular/core';
import { AvisoService } from '../services/aviso.service';

@Component({
  selector: 'app-avisos',
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      @for (a of avisos.avisos(); track a.id) {
        <div
          class="toast show align-items-center border-0 text-white mb-2"
          [class.bg-success]="a.tipo === 'sucesso'"
          [class.bg-secondary]="a.tipo === 'info'"
          [class.bg-danger]="a.tipo === 'erro'"
          role="status"
          aria-live="polite"
        >
          <div class="d-flex">
            <div class="toast-body">{{ a.texto }}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Fechar" (click)="avisos.fechar(a.id)"></button>
          </div>
        </div>
      }
    </div>
  `,
})
export class Avisos {
  readonly avisos = inject(AvisoService);
}
