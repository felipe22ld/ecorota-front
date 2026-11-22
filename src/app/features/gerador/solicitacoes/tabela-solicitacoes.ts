import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Solicitacao, rotuloRetirada } from '../../../core/models/app.models';
import { PIPES_ROTULOS } from '../../../shared/pipes/rotulos.pipe';

/** Tabela (desktop) / lista em cartões (celular) das solicitações do Gerador. */
@Component({
  selector: 'app-tabela-solicitacoes',
  imports: [RouterLink, ...PIPES_ROTULOS],
  template: `
    @if (!solicitacoes().length) {
      <div class="card-borda text-center text-secondary small py-5">Nenhuma solicitação por aqui.</div>
    } @else {
      <!-- Desktop -->
      <div class="tabela-eco d-none d-md-block">
        <table class="table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Prestador</th>
              <th>Data/ Período</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (s of solicitacoes(); track s.id) {
              <tr>
                <td>
                  <span class="d-inline-flex align-items-center gap-2 fw-semibold">
                    <span class="icone-circulo redondo" style="width: 1.9rem; height: 1.9rem; font-size: 0.9rem"><i class="bi bi-recycle"></i></span>
                    {{ s.material | material: s.outroMaterial }}
                  </span>
                </td>
                <td class="text-secondary">{{ s.prestador || '—' }}</td>
                <td class="text-secondary">{{ quando(s) }}</td>
                <td><span class="status" [class]="s.status | classeStatus">{{ s.status | status }}</span></td>
                <td class="text-end">
                  <a [routerLink]="['/gerador/solicitacoes', s.id]" class="small text-nowrap">Ver detalhes <i class="bi bi-arrow-right"></i></a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Celular -->
      <div class="lista-cartoes d-md-none">
        @for (s of solicitacoes(); track s.id) {
          <a [routerLink]="['/gerador/solicitacoes', s.id]" class="card-borda p-3 text-decoration-none text-body">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <strong>{{ s.material | material: s.outroMaterial }}</strong>
              <span class="status" [class]="s.status | classeStatus">{{ s.status | status }}</span>
            </div>
            <div class="small text-secondary">{{ s.prestador || 'Sem prestador' }} • {{ quando(s) }}</div>
          </a>
        }
      </div>
    }
  `,
})
export class TabelaSolicitacoes {
  readonly solicitacoes = input.required<Solicitacao[]>();

  quando(s: Solicitacao): string {
    return rotuloRetirada(s).replace(/^Retirada única • |^Fixa \/ Recorrente • /, '');
  }
}
