import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Solicitacao, rotuloRetirada } from '../../../core/models/app.models';
import { ColetasService } from '../../../core/services/coletas.service';
import { PIPES_ROTULOS } from '../../../shared/pipes/rotulos.pipe';

@Component({
  selector: 'app-detalhe-solicitacao',
  imports: [RouterLink, ...PIPES_ROTULOS],
  template: `
    <div class="pagina-app">
      <div class="container">
        <nav class="breadcrumb-eco">
          <a routerLink="/gerador">Home</a><span>/</span>
          <a routerLink="/gerador/solicitacoes">Minhas solicitações</a><span>/</span>
          <span class="atual">Detalhes da solicitação</span>
        </nav>

        @if (erro()) {
          <div class="alert alert-warning">{{ erro() }}</div>
        } @else if (!s()) {
          <div class="text-center py-5"><span class="spinner-border text-success"></span></div>
        } @else {
          <div class="card-eco p-4 p-md-5 mx-auto" style="max-width: 42rem">
            <div class="d-flex justify-content-between align-items-start">
              <span class="eco-eyebrow">Acompanhamento</span>
             
            </div>
            <h1 class="eco-titulo mb-1">{{ s()!.material | material: s()!.outroMaterial }}</h1>
            <p class="small text-secondary mb-3">Veja as informações e o andamento desta solicitação.</p>
            <span class="status mb-4" [class]="s()!.status | classeStatus">{{ s()!.status | status }}</span>

            <div class="grade-detalhes mt-3">
              <div>
                <span class="rotulo"><i class="bi bi-geo-alt"></i> Local</span>
                <span class="valor">{{ s()!.endereco }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-person"></i> Prestador</span>
                <span class="valor">{{ s()!.prestador || '—' }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-box-seam"></i> Volume</span>
                <span class="valor">{{ s()!.volume | volume }}</span>
              </div>
              <div>
                <span class="rotulo"><i class="bi bi-calendar-check"></i> Retirada</span>
                <span class="valor">{{ retirada() }}</span>
              </div>
            </div>

            @if (s()!.observacoes) {
              <div class="aviso-suave mt-3"><strong>Observações:</strong> {{ s()!.observacoes }}</div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class DetalheSolicitacao {
  private readonly coletas = inject(ColetasService);

  readonly id = input.required<string>();
  readonly s = signal<Solicitacao | null>(null);
  readonly erro = signal<string | null>(null);

  ngOnInit(): void {
    this.coletas.obterSolicitacao(this.id()).subscribe({
      next: (s) => this.s.set(s),
      error: () => this.erro.set('Solicitação não encontrada.'),
    });
  }

  retirada(): string {
    const s = this.s();
    return s ? rotuloRetirada(s) : '';
  }
}
